import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..access import ensure_learning_interaction_access, ensure_student_access
from ..database import get_db
from ..models import LearningInteraction, User
from ..schemas import LearningInteractionCreate, LearningInteractionOut, LearningInteractionUpdate
from ..security import LEARNER_ROLE, get_current_user

router = APIRouter(prefix="/learning-interactions", tags=["learning-interactions"])


def _json_dumps(value) -> str | None:
    if value is None:
        return None
    return json.dumps(value, ensure_ascii=False)


def _json_loads(value: str | None):
    if not value:
        return None
    return json.loads(value)


def _interaction_out(interaction: LearningInteraction) -> LearningInteractionOut:
    return LearningInteractionOut(
        id=interaction.id,
        student_id=interaction.student_id,
        user_id=interaction.user_id,
        module_name=interaction.module_name,
        category=interaction.category,
        topic=interaction.topic,
        title=interaction.title,
        content_json=_json_loads(interaction.content_json),
        assignment_json=_json_loads(interaction.assignment_json),
        learner_response=interaction.learner_response,
        status=interaction.status,
        created_at=interaction.created_at,
        updated_at=interaction.updated_at,
    )


@router.post("", response_model=LearningInteractionOut)
def create_learning_interaction(
    payload: LearningInteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_student_access(db, current_user, payload.student_id)
    interaction = LearningInteraction(
        student_id=payload.student_id,
        user_id=current_user.id,
        module_name=payload.module_name,
        category=payload.category,
        topic=payload.topic,
        title=payload.title,
        content_json=_json_dumps(payload.content_json),
        assignment_json=_json_dumps(payload.assignment_json),
        learner_response=payload.learner_response,
        status=payload.status,
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return _interaction_out(interaction)


@router.get("/me", response_model=list[LearningInteractionOut])
def my_learning_interactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == LEARNER_ROLE:
        if not current_user.student_id:
            return []
        interactions = db.scalars(
            select(LearningInteraction)
            .where(LearningInteraction.student_id == current_user.student_id)
            .order_by(LearningInteraction.created_at.desc())
        ).all()
    else:
        interactions = db.scalars(
            select(LearningInteraction)
            .where(LearningInteraction.user_id == current_user.id)
            .order_by(LearningInteraction.created_at.desc())
        ).all()
    return [_interaction_out(item) for item in interactions]


@router.get("/student/{student_id}", response_model=list[LearningInteractionOut])
def student_learning_interactions(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_student_access(db, current_user, student_id)
    interactions = db.scalars(
        select(LearningInteraction)
        .where(LearningInteraction.student_id == student_id)
        .order_by(LearningInteraction.created_at.desc())
    ).all()
    return [_interaction_out(item) for item in interactions]


@router.patch("/{interaction_id}", response_model=LearningInteractionOut)
def update_learning_interaction(
    interaction_id: int,
    payload: LearningInteractionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interaction = ensure_learning_interaction_access(db, current_user, interaction_id)
    if payload.learner_response is not None:
        interaction.learner_response = payload.learner_response
    if payload.status is not None:
        interaction.status = payload.status
    if payload.assignment_json is not None:
        interaction.assignment_json = _json_dumps(payload.assignment_json)
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return _interaction_out(interaction)
