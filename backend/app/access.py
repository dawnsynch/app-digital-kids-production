from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from .models import AssessmentAttempt, LearningInteraction, Student, User
from .security import LEARNER_ROLE, PARENT_ROLE


def ensure_student_access(db: Session, current_user: User, student_id: int) -> Student:
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if current_user.role == PARENT_ROLE and student.parent_id == current_user.id:
        return student
    if current_user.role == LEARNER_ROLE and current_user.student_id == student.id:
        return student

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this student")


def ensure_assessment_access(db: Session, current_user: User, assessment_id: int) -> AssessmentAttempt:
    attempt = db.get(AssessmentAttempt, assessment_id)
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    ensure_student_access(db, current_user, attempt.student_id)
    return attempt


def ensure_learning_interaction_access(
    db: Session,
    current_user: User,
    interaction_id: int,
) -> LearningInteraction:
    interaction = db.get(LearningInteraction, interaction_id)
    if not interaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning interaction not found")
    ensure_student_access(db, current_user, interaction.student_id)
    return interaction
