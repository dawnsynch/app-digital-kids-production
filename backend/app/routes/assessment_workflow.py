import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..access import ensure_assessment_access
from ..config import get_settings
from ..database import get_db
from ..models import AssessmentAttempt, AssessmentAuditEvent, Student, User
from ..schemas import (
    AssessmentActionRequest,
    AssessmentStatusResponse,
    LearnerAssessmentSubmissionReceipt,
    LearnerAssessmentSubmissionRequest,
    LearnerAssessmentListItem,
    LearnerReleasedFeedback,
    ParentAssessmentDetail,
    ParentAssessmentListItem,
    RevisionSubmitResponse,
)
from ..security import require_learner, require_parent
from ..services.openai_service import mark_revision_answers

router = APIRouter(prefix="/revision", tags=["assessment workflow"])
settings = get_settings()

SUBMITTED_STATES = {"submitted", "marking", "marking_failed", "needs_review", "marked", "released"}
PARENT_VISIBLE_STATES = {"submitted", "marking", "marking_failed", "needs_review", "marked", "released"}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _audit(
    db: Session,
    attempt: AssessmentAttempt,
    actor: User,
    event_type: str,
    previous_status: str | None,
    new_status: str,
    version: int | None = None,
    metadata: dict | None = None,
) -> None:
    db.add(
        AssessmentAuditEvent(
            assessment_id=attempt.id,
            actor_user_id=actor.id,
            actor_role=actor.role,
            event_type=event_type,
            previous_status=previous_status,
            new_status=new_status,
            version=version,
            metadata_json=json.dumps(metadata, separators=(",", ":")) if metadata else None,
        )
    )


def record_assessment_created(db: Session, attempt: AssessmentAttempt, actor: User, previous_status: str = "created") -> None:
    _audit(db, attempt, actor, "assessment_created", previous_status, "ready")


def _questions(attempt: AssessmentAttempt) -> list[dict]:
    try:
        questions = json.loads(attempt.questions_json)
    except (TypeError, json.JSONDecodeError):
        raise HTTPException(status_code=503, detail="Assessment content is unavailable") from None
    if not isinstance(questions, list) or not questions:
        raise HTTPException(status_code=503, detail="Assessment content is unavailable")
    return questions


def _normalize_answers(attempt: AssessmentAttempt, answers) -> list[dict]:
    question_ids = [item.get("id") for item in _questions(attempt)]
    if any(not isinstance(item, int) for item in question_ids) or len(set(question_ids)) != len(question_ids):
        raise HTTPException(status_code=503, detail="Assessment content is unavailable")
    submitted_ids = [item.question_id for item in answers]
    if len(set(submitted_ids)) != len(submitted_ids):
        raise HTTPException(status_code=422, detail="Each question may be answered only once")
    if any(question_id not in question_ids for question_id in submitted_ids):
        raise HTTPException(status_code=422, detail="An answer references an unknown question")
    answer_map = {item.question_id: item.answer for item in answers}
    return [{"question_id": question_id, "answer": answer_map.get(question_id, "")} for question_id in question_ids]


def _stored_answers(attempt: AssessmentAttempt) -> list[dict]:
    if not attempt.student_answers_json:
        return []
    try:
        value = json.loads(attempt.student_answers_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=503, detail="Submitted answers are unavailable") from None
    if not isinstance(value, list):
        raise HTTPException(status_code=503, detail="Submitted answers are unavailable")
    return value


def _receipt(attempt: AssessmentAttempt) -> dict:
    answers = _stored_answers(attempt)
    answered = sum(1 for item in answers if str(item.get("answer", "")).strip())
    if not attempt.submitted_at:
        raise HTTPException(status_code=503, detail="Submission receipt is unavailable")
    return {
        "assessment_id": attempt.id,
        "status": attempt.status,
        "submission_version": attempt.submission_version,
        "submitted_at": attempt.submitted_at,
        "answered_count": answered,
        "unanswered_count": len(answers) - answered,
        "message": "Answers submitted and locked. A parent can now review and mark this assessment.",
    }


def _owned_parent_attempt(db: Session, parent: User, assessment_id: int) -> tuple[AssessmentAttempt, Student]:
    row = db.execute(
        select(AssessmentAttempt, Student)
        .join(Student, Student.id == AssessmentAttempt.student_id)
        .where(AssessmentAttempt.id == assessment_id, Student.parent_id == parent.id)
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return row[0], row[1]


def _result_payload(attempt: AssessmentAttempt) -> dict | None:
    if not attempt.result_json:
        return None
    try:
        result = json.loads(attempt.result_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=503, detail="Marking result is unavailable") from None
    return {"assessment_id": attempt.id, **result}


def _validate_result(attempt: AssessmentAttempt, raw: dict) -> dict:
    questions = _questions(attempt)
    answers = _stored_answers(attempt)
    try:
        validated = RevisionSubmitResponse.model_validate({"assessment_id": attempt.id, **raw})
    except Exception:
        raise ValueError("invalid marking structure") from None
    expected_ids = {item["id"] for item in questions}
    marked_ids = [item.question_id for item in validated.marked_questions]
    if set(marked_ids) != expected_ids or len(marked_ids) != len(expected_ids):
        raise ValueError("invalid marked question ids")
    answer_map = {item["question_id"]: item["answer"] for item in answers}
    question_map = {item["id"]: item for item in questions}
    for item in validated.marked_questions:
        source = question_map[item.question_id]
        if item.student_answer != answer_map[item.question_id]:
            raise ValueError("marked answer differs from submitted snapshot")
        if item.question != source.get("question") or item.expected_answer != source.get("expected_answer"):
            raise ValueError("marked question content differs from assessment snapshot")
        if abs(float(item.total_marks) - float(source.get("marks", 0))) > 0.001:
            raise ValueError("marked total differs from assessment snapshot")
        if item.marks_awarded < 0 or item.marks_awarded > item.total_marks:
            raise ValueError("invalid marks")
    if validated.score < 0 or validated.total_marks <= 0 or validated.score > validated.total_marks:
        raise ValueError("invalid score")
    awarded = sum(float(item.marks_awarded) for item in validated.marked_questions)
    available = sum(float(item.total_marks) for item in validated.marked_questions)
    percentage = round((awarded / available) * 100, 2)
    if abs(float(validated.score) - awarded) > 0.001 or abs(float(validated.total_marks) - available) > 0.001:
        raise ValueError("marking totals are inconsistent")
    if abs(float(validated.percentage) - percentage) > 0.01:
        raise ValueError("marking percentage is inconsistent")
    return validated.model_dump(exclude={"assessment_id"})


@router.post("/learner/{assessment_id}/submit", response_model=LearnerAssessmentSubmissionReceipt)
def submit_learner_assessment(
    assessment_id: int,
    payload: LearnerAssessmentSubmissionRequest,
    db: Session = Depends(get_db),
    learner: User = Depends(require_learner),
):
    attempt = ensure_assessment_access(db, learner, assessment_id)
    normalized = _normalize_answers(attempt, payload.answers)
    if attempt.status in SUBMITTED_STATES:
        if normalized == _stored_answers(attempt):
            return _receipt(attempt)
        raise HTTPException(status_code=409, detail="Submitted answers are locked and cannot be changed")
    if attempt.status != "ready":
        raise HTTPException(status_code=409, detail=f"Assessment cannot be submitted from status '{attempt.status}'")

    now = _utc_now()
    try:
        changed = db.execute(
            update(AssessmentAttempt)
            .where(AssessmentAttempt.id == attempt.id, AssessmentAttempt.status == "ready")
            .values(
                status="submitted",
                student_answers_json=json.dumps(normalized, ensure_ascii=False),
                submission_request_id=payload.request_id,
                submission_version=AssessmentAttempt.submission_version + 1,
                submitted_at=now,
            )
            .execution_options(synchronize_session=False)
        )
        if changed.rowcount != 1:
            db.rollback()
            refreshed = db.get(AssessmentAttempt, attempt.id)
            if refreshed and normalized == _stored_answers(refreshed):
                return _receipt(refreshed)
            raise HTTPException(status_code=409, detail="Assessment was already submitted")
        db.expire_all()
        attempt = db.get(AssessmentAttempt, assessment_id)
        assert attempt is not None
        unanswered = sum(1 for item in normalized if not item["answer"].strip())
        _audit(db, attempt, learner, "answers_submitted", "ready", "submitted", attempt.submission_version, {"unanswered_count": unanswered})
        db.commit()
    except IntegrityError:
        db.rollback()
        duplicate = db.scalar(select(AssessmentAttempt).where(AssessmentAttempt.submission_request_id == payload.request_id))
        if duplicate and duplicate.id == attempt.id and normalized == _stored_answers(duplicate):
            return _receipt(duplicate)
        raise HTTPException(status_code=409, detail="Submission request ID was already used") from None
    db.refresh(attempt)
    return _receipt(attempt)


@router.get("/learner/{assessment_id}/submission", response_model=LearnerAssessmentSubmissionReceipt)
def learner_submission_status(
    assessment_id: int,
    db: Session = Depends(get_db),
    learner: User = Depends(require_learner),
):
    attempt = ensure_assessment_access(db, learner, assessment_id)
    if attempt.status not in SUBMITTED_STATES:
        raise HTTPException(status_code=409, detail="Assessment has not been submitted")
    return _receipt(attempt)


@router.get("/learner/{assessment_id}/feedback", response_model=LearnerReleasedFeedback)
def learner_released_feedback(
    assessment_id: int,
    db: Session = Depends(get_db),
    learner: User = Depends(require_learner),
):
    attempt = ensure_assessment_access(db, learner, assessment_id)
    if attempt.status != "released" or not attempt.released_at:
        raise HTTPException(status_code=403, detail="Results have not been released")
    result = _result_payload(attempt)
    if not result:
        raise HTTPException(status_code=503, detail="Released result is unavailable")
    return {"assessment_id": attempt.id, "subject": attempt.subject, "strand": attempt.topic, "released_at": attempt.released_at, "result": result}


@router.get("/learner/assessments", response_model=list[LearnerAssessmentListItem])
def learner_assessments(
    db: Session = Depends(get_db),
    learner: User = Depends(require_learner),
):
    attempts = db.scalars(
        select(AssessmentAttempt)
        .where(AssessmentAttempt.student_id == learner.student_id, AssessmentAttempt.status != "created")
        .order_by(AssessmentAttempt.created_at.desc(), AssessmentAttempt.id.desc())
        .limit(20)
    ).all()
    return [
        {
            "assessment_id": attempt.id,
            "subject": attempt.subject,
            "strand": attempt.topic,
            "status": attempt.status,
            "submitted_at": attempt.submitted_at,
            "released_at": attempt.released_at,
        }
        for attempt in attempts
    ]


@router.get("/parent/assessments", response_model=list[ParentAssessmentListItem])
def parent_assessments(
    student_id: int | None = Query(default=None),
    assessment_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    if assessment_status and assessment_status not in PARENT_VISIBLE_STATES:
        raise HTTPException(status_code=422, detail="Unsupported assessment status filter")
    query = (
        select(AssessmentAttempt, Student)
        .join(Student, Student.id == AssessmentAttempt.student_id)
        .where(Student.parent_id == parent.id, AssessmentAttempt.status.in_(PARENT_VISIBLE_STATES))
        .order_by(AssessmentAttempt.submitted_at.desc(), AssessmentAttempt.id.desc())
    )
    if student_id is not None:
        owned = db.scalar(select(Student.id).where(Student.id == student_id, Student.parent_id == parent.id))
        if not owned:
            raise HTTPException(status_code=404, detail="Learner not found")
        query = query.where(AssessmentAttempt.student_id == student_id)
    if assessment_status:
        query = query.where(AssessmentAttempt.status == assessment_status)
    return [
        {
            "assessment_id": attempt.id, "student_id": student.id, "learner_name": student.name,
            "grade": attempt.grade, "term": attempt.term, "subject": attempt.subject, "strand": attempt.topic,
            "status": attempt.status, "submitted_at": attempt.submitted_at,
            "marking_completed_at": attempt.marking_completed_at, "released_at": attempt.released_at,
        }
        for attempt, student in db.execute(query).all()
    ]


@router.get("/parent/assessments/{assessment_id}", response_model=ParentAssessmentDetail)
def parent_assessment_detail(
    assessment_id: int,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    attempt, student = _owned_parent_attempt(db, parent, assessment_id)
    if attempt.status not in PARENT_VISIBLE_STATES:
        raise HTTPException(status_code=409, detail="Assessment has not been submitted")
    events = db.scalars(select(AssessmentAuditEvent).where(AssessmentAuditEvent.assessment_id == attempt.id).order_by(AssessmentAuditEvent.id)).all()
    return {
        "assessment_id": attempt.id, "student_id": student.id, "learner_name": student.name,
        "grade": attempt.grade, "term": attempt.term, "subject": attempt.subject, "strand": attempt.topic,
        "difficulty": attempt.difficulty, "status": attempt.status, "questions": _questions(attempt),
        "answers": _stored_answers(attempt), "result": _result_payload(attempt), "submitted_at": attempt.submitted_at,
        "marking_completed_at": attempt.marking_completed_at, "reviewed_at": attempt.reviewed_at,
        "released_at": attempt.released_at, "audit_events": events,
    }


@router.post("/parent/assessments/{assessment_id}/mark", response_model=ParentAssessmentDetail)
def mark_parent_assessment(
    assessment_id: int,
    payload: AssessmentActionRequest,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    attempt, _ = _owned_parent_attempt(db, parent, assessment_id)
    if attempt.status in {"needs_review", "marked", "released"} and attempt.result_json:
        return parent_assessment_detail(assessment_id, db, parent)
    if attempt.status == "marking":
        raise HTTPException(status_code=409, detail="Marking is already in progress")
    if attempt.status not in {"submitted", "marking_failed"}:
        raise HTTPException(status_code=409, detail=f"Assessment cannot be marked from status '{attempt.status}'")
    if attempt.status == "marking_failed" and attempt.marking_request_id == payload.request_id:
        raise HTTPException(status_code=409, detail="Use a new request ID to retry failed marking")

    cutoff = _utc_now() - timedelta(hours=1)
    marking_count = db.scalar(select(func.count(AssessmentAuditEvent.id)).where(
        AssessmentAuditEvent.actor_user_id == parent.id,
        AssessmentAuditEvent.event_type == "marking_requested",
        AssessmentAuditEvent.created_at >= cutoff,
    )) or 0
    if marking_count >= settings.max_marking_requests_per_parent_per_hour:
        raise HTTPException(status_code=429, detail="Marking request limit reached. Please try again later.")

    previous_status = attempt.status
    attempt.status = "marking"
    attempt.marking_request_id = payload.request_id
    attempt.marking_requested_at = _utc_now()
    attempt.marking_error = None
    _audit(db, attempt, parent, "marking_requested", previous_status, "marking", attempt.marking_version + 1)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        duplicate = db.scalar(select(AssessmentAttempt).where(AssessmentAttempt.marking_request_id == payload.request_id))
        if duplicate and duplicate.id == attempt.id and duplicate.result_json:
            return parent_assessment_detail(assessment_id, db, parent)
        raise HTTPException(status_code=409, detail="Marking request ID was already used") from None

    try:
        result = _validate_result(attempt, mark_revision_answers(_questions(attempt), _stored_answers(attempt)))
    except Exception:
        db.refresh(attempt)
        attempt.status = "marking_failed"
        attempt.marking_error = "Marking could not be completed safely"
        _audit(db, attempt, parent, "marking_failed", "marking", "marking_failed", attempt.marking_version + 1)
        db.commit()
        raise HTTPException(status_code=503, detail="Marking could not be completed safely. Please retry.") from None

    db.refresh(attempt)
    attempt.result_json = json.dumps(result, ensure_ascii=False)
    attempt.score = float(result["score"])
    attempt.total_marks = float(result["total_marks"])
    attempt.marking_version += 1
    attempt.marking_completed_at = _utc_now()
    attempt.status = "needs_review"
    _audit(db, attempt, parent, "marking_completed", "marking", "needs_review", attempt.marking_version)
    db.commit()
    return parent_assessment_detail(assessment_id, db, parent)


@router.post("/parent/assessments/{assessment_id}/review", response_model=AssessmentStatusResponse)
def review_parent_assessment(
    assessment_id: int,
    _payload: AssessmentActionRequest,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    attempt, _ = _owned_parent_attempt(db, parent, assessment_id)
    if attempt.status in {"marked", "released"}:
        return {"assessment_id": attempt.id, "status": attempt.status, "message": "Marking review already confirmed."}
    if attempt.status != "needs_review" or not attempt.result_json:
        raise HTTPException(status_code=409, detail="A valid marking result must be reviewed first")
    attempt.status = "marked"
    attempt.reviewed_at = _utc_now()
    attempt.reviewed_by_user_id = parent.id
    _audit(db, attempt, parent, "marking_reviewed", "needs_review", "marked", attempt.marking_version)
    db.commit()
    return {"assessment_id": attempt.id, "status": "marked", "message": "Marking result reviewed and ready for release."}


@router.post("/parent/assessments/{assessment_id}/release", response_model=AssessmentStatusResponse)
def release_parent_assessment(
    assessment_id: int,
    _payload: AssessmentActionRequest,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    attempt, _ = _owned_parent_attempt(db, parent, assessment_id)
    if attempt.status == "released":
        return {"assessment_id": attempt.id, "status": "released", "message": "Results were already released."}
    if attempt.status != "marked" or not attempt.result_json or not attempt.reviewed_at:
        raise HTTPException(status_code=409, detail="Only reviewed, valid marking results can be released")
    attempt.status = "released"
    attempt.released_at = _utc_now()
    attempt.released_by_user_id = parent.id
    _audit(db, attempt, parent, "results_released", "marked", "released", attempt.marking_version)
    db.commit()
    return {"assessment_id": attempt.id, "status": "released", "message": "Results released to the learner."}
