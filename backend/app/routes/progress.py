import json
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..access import ensure_student_access
from ..database import get_db
from ..models import AssessmentAttempt, LearningInteraction, User
from ..routes.learning_interactions import _interaction_out
from ..schemas import ProgressItem, ProgressSummary
from ..security import get_current_user, require_parent

router = APIRouter(prefix="/progress", tags=["progress"])


def _attempt_to_item(attempt: AssessmentAttempt) -> ProgressItem:
    percentage = None
    if attempt.score is not None and attempt.total_marks:
        percentage = round((attempt.score / attempt.total_marks) * 100, 2)
    has_answers = bool(attempt.student_answers_json)
    is_marked = bool(attempt.result_json)
    if is_marked:
        status = "marked"
    elif has_answers:
        status = "submitted"
    else:
        status = "generated"
    return ProgressItem(
        assessment_id=attempt.id,
        date=attempt.created_at,
        grade=attempt.grade,
        term=attempt.term,
        subject=attempt.subject,
        topic=attempt.topic,
        has_answers=has_answers,
        is_marked=is_marked,
        status=status,
        score=attempt.score,
        total_marks=attempt.total_marks,
        percentage=percentage,
    )


@router.get("/student/{student_id}", response_model=ProgressSummary)
def student_progress(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = ensure_student_access(db, current_user, student_id)
    attempts = db.scalars(
        select(AssessmentAttempt)
        .where(AssessmentAttempt.student_id == student_id)
        .order_by(AssessmentAttempt.created_at.desc())
    ).all()

    completed = [a for a in attempts if a.score is not None and a.total_marks]
    average = None
    if completed:
        average = round(sum((a.score / a.total_marks) * 100 for a in completed) / len(completed), 2)

    interactions = db.scalars(
        select(LearningInteraction)
        .where(LearningInteraction.student_id == student_id)
        .order_by(LearningInteraction.created_at.desc())
    ).all()

    return ProgressSummary(
        student=student,
        attempts_count=len(attempts),
        average_percentage=average,
        recent_attempts=[_attempt_to_item(a) for a in attempts[:10]],
        learning_interactions=[_interaction_out(item) for item in interactions[:10]],
    )


@router.get("/summary")
def overall_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    attempts = db.scalars(
        select(AssessmentAttempt)
        .join(AssessmentAttempt.student)
        .where(AssessmentAttempt.student.has(parent_id=current_user.id))
        .order_by(AssessmentAttempt.created_at.desc())
    ).all()
    subject_summary: dict[str, list[float]] = {}
    weak_areas: list[str] = []
    interactions = db.scalars(
        select(LearningInteraction)
        .join(LearningInteraction.student)
        .where(LearningInteraction.student.has(parent_id=current_user.id))
        .order_by(LearningInteraction.created_at.desc())
    ).all()
    module_counts: dict[str, int] = {}

    for attempt in attempts:
        if attempt.score is not None and attempt.total_marks:
            subject_summary.setdefault(attempt.subject, []).append((attempt.score / attempt.total_marks) * 100)
        if attempt.result_json:
            result = json.loads(attempt.result_json)
            weak_areas.extend(result.get("weak_areas", []))
    for interaction in interactions:
        module_counts[interaction.module_name] = module_counts.get(interaction.module_name, 0) + 1

    return {
        "attempts_count": len(attempts),
        "learning_interactions_count": len(interactions),
        "learning_module_counts": module_counts,
        "subject_average_percentages": {
            subject: round(sum(scores) / len(scores), 2) for subject, scores in subject_summary.items()
        },
        "recent_weak_areas": weak_areas[:10],
        "recent_learning_interactions": [_interaction_out(item).model_dump() for item in interactions[:10]],
    }
