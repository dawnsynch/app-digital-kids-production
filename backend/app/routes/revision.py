import json
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..access import ensure_assessment_access, ensure_student_access
from ..config import get_settings
from ..database import get_db
from ..models import AssessmentAttempt, User
from ..schemas import (
    RevisionAnswersResponse,
    RevisionGenerateRequest,
    RevisionGenerateResponse,
    LearnerPracticeAssessment,
    LearnerPracticeGenerateRequest,
    LearnerPracticeOptions,
    RevisionSubmitRequest,
    RevisionSubmitResponse,
)
from ..security import get_current_user, require_learner, require_parent
from ..services.openai_service import generate_revision_questions
from .assessment_workflow import mark_parent_assessment, record_assessment_created
from ..schemas import AssessmentActionRequest

router = APIRouter(prefix="/revision", tags=["revision"])
settings = get_settings()

CBC_SUBJECTS = {
    5: [
        "Mathematics",
        "English",
        "Kiswahili",
        "Science and Technology",
        "Social Studies",
        "CRE",
        "Agriculture and Nutrition",
        "Creative Arts",
    ],
    6: [
        "Mathematics",
        "English",
        "Kiswahili",
        "Science and Technology",
        "Social Studies",
        "CRE",
        "Agriculture and Nutrition",
        "Creative Arts",
    ],
    7: [
        "Mathematics",
        "English",
        "Kiswahili",
        "Integrated Science",
        "Social Studies",
        "CRE",
        "Agriculture and Nutrition",
        "Pre-Technical Studies",
        "Creative Arts and Sports",
    ],
}

CBC_STRANDS = {
    "Mathematics": ["Numbers", "Fractions", "Decimals", "Measurement", "Geometry", "Algebra"],
    "English": ["Listening and Speaking", "Reading", "Grammar", "Writing"],
    "Kiswahili": ["Kusikiliza na Kuzungumza", "Kusoma", "Sarufi", "Kuandika"],
    "Science and Technology": ["Living Things", "Environment", "Matter", "Force and Energy", "Technology"],
    "Integrated Science": ["Living Things", "Matter", "Force and Energy", "Environment"],
    "Social Studies": ["People and Population", "Resources", "Governance", "Citizenship"],
    "CRE": ["Creation", "Bible Stories", "Christian Values", "Prayer"],
    "Agriculture and Nutrition": ["Crop Production", "Animal Production", "Nutrition", "Environment"],
    "Creative Arts": ["Visual Arts", "Music", "Movement"],
    "Pre-Technical Studies": ["Tools and Safety", "Materials", "Design", "Digital Technology"],
    "Creative Arts and Sports": ["Visual Arts", "Music", "Physical Education", "Sports"],
}


@router.get("/options")
def revision_options(current_user: User = Depends(get_current_user)):
    return {
        "grades": [5, 6, 7],
        "terms": [1, 2, 3],
        "subjects": CBC_SUBJECTS,
        "difficulty": ["Easy", "Medium", "Hard"],
    }


@router.post("/generate", response_model=RevisionGenerateResponse)
def generate_revision(
    payload: RevisionGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    if payload.question_count > settings.max_questions_per_request:
        raise HTTPException(
            status_code=400,
            detail=f"Question count cannot exceed {settings.max_questions_per_request}",
        )
    student = ensure_student_access(db, current_user, payload.student_id)
    questions_payload = generate_revision_questions(
        grade=student.grade,
        term=payload.term,
        subject=payload.subject,
        topic=payload.topic,
        difficulty=payload.difficulty,
        count=payload.question_count,
    )
    questions = questions_payload["questions"]

    attempt = AssessmentAttempt(
        student_id=student.id,
        grade=student.grade,
        term=payload.term,
        subject=payload.subject,
        topic=payload.topic,
        difficulty=payload.difficulty,
        question_count=payload.question_count,
        questions_json=json.dumps(questions, ensure_ascii=False),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    record_assessment_created(db, attempt, current_user, "created")
    db.commit()

    return {
        "assessment_id": attempt.id,
        "student_id": student.id,
        "grade": student.grade,
        "term": payload.term,
        "subject": payload.subject,
        "topic": payload.topic,
        "difficulty": payload.difficulty,
        "questions": questions,
    }


@router.post("/answers", response_model=RevisionAnswersResponse)
def save_revision_answers(
    payload: RevisionSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_assessment_access(db, current_user, payload.assessment_id)
    raise HTTPException(status_code=409, detail="Use the idempotent learner assessment submission endpoint")


@router.get("/learner/options", response_model=LearnerPracticeOptions)
def learner_practice_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_learner),
):
    student = ensure_student_access(db, current_user, current_user.student_id or 0)
    return {
        "learner_name": student.name,
        "grade": student.grade,
        "terms": [1, 2, 3],
        "subjects": [
            {"name": subject, "strands": CBC_STRANDS.get(subject, ["General Revision"])}
            for subject in CBC_SUBJECTS[student.grade]
        ],
        "difficulty": ["Easy", "Medium", "Hard"],
        "question_counts": [5, 10],
    }


def _learner_assessment_payload(attempt: AssessmentAttempt) -> dict:
    questions = json.loads(attempt.questions_json)
    safe_questions = [
        {
            "id": item["id"],
            "question": item["question"],
            "marks": item.get("marks", 1),
            "skill_tested": item.get("skill_tested", "CBC practice"),
            "question_type": "text",
        }
        for item in questions
        if isinstance(item, dict) and isinstance(item.get("id"), int) and isinstance(item.get("question"), str)
    ]
    if len(safe_questions) != attempt.question_count:
        raise HTTPException(status_code=503, detail="The generated practice content is unavailable. Please try again.")
    return {
        "assessment_id": attempt.id,
        "grade": attempt.grade,
        "term": attempt.term,
        "subject": attempt.subject,
        "strand": attempt.topic,
        "difficulty": attempt.difficulty,
        "status": attempt.status,
        "questions": safe_questions,
        "answers": json.loads(attempt.student_answers_json) if attempt.student_answers_json else None,
        "submitted_at": attempt.submitted_at,
    }


@router.post("/learner/generate", response_model=LearnerPracticeAssessment)
def generate_learner_practice(
    payload: LearnerPracticeGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_learner),
):
    student = ensure_student_access(db, current_user, current_user.student_id or 0)
    existing = db.scalar(
        select(AssessmentAttempt).where(
            AssessmentAttempt.student_id == student.id,
            AssessmentAttempt.request_id == payload.request_id,
        )
    )
    if existing:
        if existing.status == "created":
            raise HTTPException(status_code=409, detail="This practice is already being prepared")
        return _learner_assessment_payload(existing)

    if payload.question_count > settings.max_questions_per_request:
        raise HTTPException(status_code=400, detail=f"Question count cannot exceed {settings.max_questions_per_request}")
    if payload.subject not in CBC_SUBJECTS.get(student.grade, []):
        raise HTTPException(status_code=400, detail="Subject is not supported for the learner's grade")
    supported_strands = CBC_STRANDS.get(payload.subject, ["General Revision"])
    if payload.strand not in supported_strands:
        raise HTTPException(status_code=400, detail="Strand is not supported for this subject")

    cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
    recent_count = db.scalar(
        select(func.count(AssessmentAttempt.id)).where(
            AssessmentAttempt.student_id == student.id,
            AssessmentAttempt.created_at >= cutoff,
        )
    ) or 0
    if recent_count >= settings.max_ai_requests_per_learner_per_hour:
        raise HTTPException(status_code=429, detail="Practice generation limit reached. Please try again later.")

    attempt = AssessmentAttempt(
        student_id=student.id,
        grade=student.grade,
        term=payload.term,
        subject=payload.subject,
        topic=payload.strand,
        difficulty=payload.difficulty,
        question_count=payload.question_count,
        questions_json="[]",
        request_id=payload.request_id,
        status="created",
    )
    db.add(attempt)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        duplicate = db.scalar(select(AssessmentAttempt).where(AssessmentAttempt.request_id == payload.request_id))
        if duplicate and duplicate.student_id == student.id and duplicate.status == "ready":
            return _learner_assessment_payload(duplicate)
        raise HTTPException(status_code=409, detail="This practice is already being prepared") from None

    try:
        questions_payload = generate_revision_questions(
            grade=student.grade,
            term=payload.term,
            subject=payload.subject,
            topic=payload.strand,
            difficulty=payload.difficulty,
            count=payload.question_count,
        )
        questions = questions_payload["questions"]
        if not isinstance(questions, list) or len(questions) != payload.question_count:
            raise ValueError("invalid question count")
        # Validate the complete internal model before persisting; learner serialization strips privileged fields.
        for item in questions:
            if not isinstance(item, dict) or not all(
                key in item for key in ("id", "question", "expected_answer", "marking_guide", "marks", "skill_tested")
            ):
                raise ValueError("invalid question structure")
    except Exception:
        # Provider/network diagnostics stay server-side; learners receive stable safe copy.
        db.delete(attempt)
        db.commit()
        raise HTTPException(status_code=503, detail="Questions could not be generated safely. Please try again.") from None

    attempt.questions_json = json.dumps(questions, ensure_ascii=False)
    attempt.status = "ready"
    db.add(attempt)
    record_assessment_created(db, attempt, current_user)
    db.commit()
    db.refresh(attempt)
    return _learner_assessment_payload(attempt)


@router.get("/learner/{assessment_id}", response_model=LearnerPracticeAssessment)
def get_learner_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_learner),
):
    attempt = ensure_assessment_access(db, current_user, assessment_id)
    return _learner_assessment_payload(attempt)


@router.get("/{assessment_id}")
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    attempt = ensure_assessment_access(db, current_user, assessment_id)
    return {
        "assessment_id": attempt.id,
        "student_id": attempt.student_id,
        "grade": attempt.grade,
        "term": attempt.term,
        "subject": attempt.subject,
        "topic": attempt.topic,
        "difficulty": attempt.difficulty,
        "questions": json.loads(attempt.questions_json),
        "answers": json.loads(attempt.student_answers_json) if attempt.student_answers_json else None,
        "result": json.loads(attempt.result_json) if attempt.result_json else None,
    }


@router.post("/submit", response_model=RevisionSubmitResponse)
def submit_revision(
    payload: RevisionSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    attempt = ensure_assessment_access(db, current_user, payload.assessment_id)
    if attempt.status not in {"submitted", "marking", "marking_failed", "needs_review", "marked", "released"}:
        raise HTTPException(status_code=409, detail="Assessment must be submitted by the learner before marking")
    stored = json.loads(attempt.student_answers_json or "[]")
    supplied = [item.model_dump() for item in payload.answers]
    if supplied != stored:
        raise HTTPException(status_code=409, detail="Marking must use the locked submitted answer snapshot")
    detail = mark_parent_assessment(
        attempt.id,
        AssessmentActionRequest(request_id=f"legacy_marking_{attempt.id}_{attempt.submission_version}_request"),
        db,
        current_user,
    )
    result = detail.get("result")
    if not result:
        raise HTTPException(status_code=503, detail="Marking result is unavailable")
    return result
