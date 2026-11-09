from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, ParentRegisterRequest, TokenResponse, UserOut
from ..security import (
    LEARNER_ROLE,
    PARENT_ROLE,
    create_access_token,
    create_learner_access_token,
    get_current_user,
    hash_password,
    require_jwt_configured,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register-parent", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_parent(payload: ParentRegisterRequest, db: Session = Depends(get_db)):
    require_jwt_configured()
    email = payload.email.strip().lower()
    existing = db.scalar(select(User).where(func.lower(User.email) == email))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A parent with this email already exists")

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        username=None,
        password_hash=hash_password(payload.password),
        role=PARENT_ROLE,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A parent with this email already exists") from exc
    db.refresh(user)
    return {"access_token": create_access_token(user), "user": user}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    require_jwt_configured()
    email = payload.email.strip().lower() if payload.email else None
    username = payload.username.strip().lower() if payload.username else None
    if not email and not username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email or username is required")

    conditions = []
    if email:
        conditions.append(func.lower(User.email) == email)
    if username:
        conditions.append(func.lower(User.username) == username)

    user = db.scalar(select(User).where(or_(*conditions)))
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login credentials")

    if user.role == LEARNER_ROLE:
        if not user.learner_access_enabled:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login credentials")
        access_token, _ = create_learner_access_token(db, user)
        db.commit()
        return {"access_token": access_token, "user": user}
    return {"access_token": create_access_token(user), "user": user}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
