from datetime import date, datetime, time

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AssessmentAttempt, LearningInteraction, Student, User
from ..routes.learning_interactions import _interaction_out
from ..schemas import UserOut
from ..security import LEARNER_ROLE, PARENT_ROLE, require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


def _date_start(value: date | None) -> datetime | None:
    return datetime.combine(value, time.min) if value else None


def _date_end(value: date | None) -> datetime | None:
    return datetime.combine(value, time.max) if value else None


def _student_map(db: Session) -> dict[int, Student]:
    return {student.id: student for student in db.scalars(select(Student)).all()}


def _user_map(db: Session) -> dict[int, User]:
    return {user.id: user for user in db.scalars(select(User)).all()}


@router.get("/parents", response_model=list[UserOut])
def admin_parents(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.scalars(select(User).where(User.role == PARENT_ROLE).order_by(User.created_at.desc())).all()


@router.get("/learners", response_model=list[UserOut])
def admin_learners(
    parent_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = select(User).where(User.role == LEARNER_ROLE)
    if parent_id is not None:
        query = query.where(User.parent_id == parent_id)
    return db.scalars(query.order_by(User.created_at.desc())).all()


@router.get("/students")
def admin_students(
    parent_id: int | None = None,
    learner_id: int | None = None,
    grade: int | None = Query(default=None, ge=5, le=7),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = select(Student)
    if parent_id is not None:
        query = query.where(Student.parent_id == parent_id)
    if learner_id is not None:
        learner = db.get(User, learner_id)
        query = query.where(Student.id == (learner.student_id if learner else -1))
    if grade is not None:
        query = query.where(Student.grade == grade)

    users = _user_map(db)
    rows = []
    for student in db.scalars(query.order_by(Student.created_at.desc())).all():
        parent = users.get(student.parent_id) if student.parent_id else None
        learner = next((user for user in users.values() if user.student_id == student.id), None)
        rows.append(
            {
                "id": student.id,
                "parent_id": student.parent_id,
                "parent_name": parent.full_name if parent else None,
                "learner_user_id": learner.id if learner else None,
                "learner_username": learner.username if learner else None,
                "name": student.name,
                "grade": student.grade,
                "age_group": student.age_group,
                "created_at": student.created_at,
            }
        )
    return rows


@router.get("/assessments")
def admin_assessments(
    parent_id: int | None = None,
    learner_id: int | None = None,
    grade: int | None = Query(default=None, ge=5, le=7),
    subject: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = select(AssessmentAttempt).join(AssessmentAttempt.student)
    if parent_id is not None:
        query = query.where(Student.parent_id == parent_id)
    if learner_id is not None:
        learner = db.get(User, learner_id)
        query = query.where(AssessmentAttempt.student_id == (learner.student_id if learner else -1))
    if grade is not None:
        query = query.where(AssessmentAttempt.grade == grade)
    if subject:
        query = query.where(AssessmentAttempt.subject == subject)
    if date_from:
        query = query.where(AssessmentAttempt.created_at >= _date_start(date_from))
    if date_to:
        query = query.where(AssessmentAttempt.created_at <= _date_end(date_to))

    students = _student_map(db)
    users = _user_map(db)
    rows = []
    for attempt in db.scalars(query.order_by(AssessmentAttempt.created_at.desc())).all():
        student = students.get(attempt.student_id)
        parent = users.get(student.parent_id) if student and student.parent_id else None
        rows.append(
            {
                "id": attempt.id,
                "student_id": attempt.student_id,
                "student_name": student.name if student else None,
                "parent_id": student.parent_id if student else None,
                "parent_name": parent.full_name if parent else None,
                "grade": attempt.grade,
                "term": attempt.term,
                "subject": attempt.subject,
                "topic": attempt.topic,
                "difficulty": attempt.difficulty,
                "question_count": attempt.question_count,
                "score": attempt.score,
                "total_marks": attempt.total_marks,
                "created_at": attempt.created_at,
            }
        )
    return rows


@router.get("/interactions")
def admin_interactions(
    parent_id: int | None = None,
    learner_id: int | None = None,
    grade: int | None = Query(default=None, ge=5, le=7),
    module: str | None = Query(default=None, pattern="^(coding_ai|spiritual_guide|hobbies_creativity)$"),
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = select(LearningInteraction).join(LearningInteraction.student)
    if parent_id is not None:
        query = query.where(Student.parent_id == parent_id)
    if learner_id is not None:
        learner = db.get(User, learner_id)
        query = query.where(LearningInteraction.student_id == (learner.student_id if learner else -1))
    if grade is not None:
        query = query.where(Student.grade == grade)
    if module:
        query = query.where(LearningInteraction.module_name == module)
    if date_from:
        query = query.where(LearningInteraction.created_at >= _date_start(date_from))
    if date_to:
        query = query.where(LearningInteraction.created_at <= _date_end(date_to))

    students = _student_map(db)
    users = _user_map(db)
    rows = []
    for interaction in db.scalars(query.order_by(LearningInteraction.created_at.desc())).all():
        item = _interaction_out(interaction).model_dump()
        student = students.get(interaction.student_id)
        parent = users.get(student.parent_id) if student and student.parent_id else None
        creator = users.get(interaction.user_id)
        item.update(
            {
                "student_name": student.name if student else None,
                "grade": student.grade if student else None,
                "parent_id": student.parent_id if student else None,
                "parent_name": parent.full_name if parent else None,
                "created_by": creator.full_name if creator else None,
            }
        )
        rows.append(item)
    return rows


@router.get("/progress")
def admin_progress(
    parent_id: int | None = None,
    learner_id: int | None = None,
    grade: int | None = Query(default=None, ge=5, le=7),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    students_query = select(Student)
    if parent_id is not None:
        students_query = students_query.where(Student.parent_id == parent_id)
    if learner_id is not None:
        learner = db.get(User, learner_id)
        students_query = students_query.where(Student.id == (learner.student_id if learner else -1))
    if grade is not None:
        students_query = students_query.where(Student.grade == grade)

    users = _user_map(db)
    rows = []
    for student in db.scalars(students_query.order_by(Student.created_at.desc())).all():
        attempts = db.scalars(select(AssessmentAttempt).where(AssessmentAttempt.student_id == student.id)).all()
        interactions = db.scalars(select(LearningInteraction).where(LearningInteraction.student_id == student.id)).all()
        completed = [attempt for attempt in attempts if attempt.score is not None and attempt.total_marks]
        average = None
        if completed:
            average = round(sum((attempt.score / attempt.total_marks) * 100 for attempt in completed) / len(completed), 2)
        parent = users.get(student.parent_id) if student.parent_id else None
        rows.append(
            {
                "student_id": student.id,
                "student_name": student.name,
                "parent_id": student.parent_id,
                "parent_name": parent.full_name if parent else None,
                "grade": student.grade,
                "revision_attempts": len(attempts),
                "marked_attempts": len(completed),
                "average_percentage": average,
                "learning_interactions": len(interactions),
            }
        )
    return rows


@router.get("/summary")
def admin_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    users = db.scalars(select(User)).all()
    students = db.scalars(select(Student)).all()
    assessments = db.scalars(select(AssessmentAttempt)).all()
    interactions = db.scalars(select(LearningInteraction)).all()

    module_counts: dict[str, int] = {}
    subject_counts: dict[str, int] = {}
    for interaction in interactions:
        module_counts[interaction.module_name] = module_counts.get(interaction.module_name, 0) + 1
    for assessment in assessments:
        subject_counts[assessment.subject] = subject_counts.get(assessment.subject, 0) + 1

    return {
        "parents": len([user for user in users if user.role == PARENT_ROLE]),
        "learners": len([user for user in users if user.role == LEARNER_ROLE]),
        "admins": len([user for user in users if user.role == "admin"]),
        "students": len(students),
        "assessments": len(assessments),
        "learning_interactions": len(interactions),
        "module_counts": module_counts,
        "subject_counts": subject_counts,
    }
