from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, User
from ..schemas import CodingLessonRequest, CodingLessonResponse, SpiritualLessonRequest, SpiritualLessonResponse
from ..security import LEARNER_ROLE, get_current_user
from ..services.openai_service import generate_coding_lesson, generate_spiritual_lesson

router = APIRouter(prefix="/learning", tags=["learning"])


@router.post("/coding", response_model=CodingLessonResponse)
def coding_lesson(
    payload: CodingLessonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_learning_grade(payload.grade, db, current_user)
    try:
        return generate_coding_lesson(payload.grade, payload.topic, payload.lesson_minutes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/spiritual", response_model=SpiritualLessonResponse)
def spiritual_lesson(
    payload: SpiritualLessonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_learning_grade(payload.grade, db, current_user)
    try:
        return generate_spiritual_lesson(payload.grade, payload.theme, payload.lesson_minutes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _ensure_learning_grade(grade: int, db: Session, current_user: User) -> None:
    if current_user.role != LEARNER_ROLE:
        return
    if not current_user.student_id:
        raise HTTPException(status_code=403, detail="Learner profile is not linked")
    student = db.get(Student, current_user.student_id)
    if not student or student.grade != grade:
        raise HTTPException(status_code=403, detail="Learners can only request lessons for their own grade")
