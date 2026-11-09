from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..access import ensure_student_access
from ..database import get_db
from ..models import User
from ..schemas import HobbyActivityRequest, HobbyActivityResponse
from ..security import get_current_user
from ..services.openai_service import generate_hobby_activity

router = APIRouter(prefix="/hobbies", tags=["hobbies"])


@router.post("/activity", response_model=HobbyActivityResponse)
def hobby_activity(
    payload: HobbyActivityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = ensure_student_access(db, current_user, payload.student_id)
    try:
        return generate_hobby_activity(
            grade=student.grade,
            category=payload.category,
            difficulty=payload.difficulty,
            available_time_minutes=payload.available_time_minutes,
            available_materials=payload.available_materials,
            activity_type=payload.activity_type,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
