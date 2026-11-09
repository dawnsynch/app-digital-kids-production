import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models import LearnerHandoff, LearnerSession, Student, User
from ..schemas import (
    LearnerAccessStatus,
    LearnerHandoffOut,
    LearnerIdentityOut,
    LearnerPinConfigureRequest,
    LearnerRedeemRequest,
    ParentPasswordRequest,
    TokenResponse,
)
from ..security import (
    LEARNER_ROLE,
    create_learner_access_token,
    get_current_token_payload,
    hash_challenge,
    hash_learner_pin,
    hash_password,
    require_learner,
    require_parent,
    verify_learner_pin,
    verify_password,
)

router = APIRouter(tags=["learner authentication"])


def _utc(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _owned_student(db: Session, parent: User, student_id: int) -> Student:
    student = db.scalar(select(Student).where(Student.id == student_id, Student.parent_id == parent.id))
    if not student:
        raise HTTPException(status_code=404, detail="Learner not found")
    return student


def _learner_user(db: Session, student_id: int) -> User | None:
    return db.scalar(select(User).where(User.role == LEARNER_ROLE, User.student_id == student_id))


def _revoke_learner_access(db: Session, learner: User, now: datetime) -> None:
    learner.learner_session_version += 1
    learner.pin_failed_attempts = 0
    learner.pin_locked_until = None
    db.execute(
        update(LearnerSession)
        .where(LearnerSession.user_id == learner.id, LearnerSession.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    db.execute(
        update(LearnerHandoff)
        .where(LearnerHandoff.student_id == learner.student_id, LearnerHandoff.used_at.is_(None), LearnerHandoff.revoked_at.is_(None))
        .values(revoked_at=now)
    )


@router.get("/students/{student_id}/learner-access", response_model=LearnerAccessStatus)
def learner_access_status(
    student_id: int,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    _owned_student(db, parent, student_id)
    learner = _learner_user(db, student_id)
    return {
        "student_id": student_id,
        "pin_configured": bool(learner and learner.learner_pin_hash),
        "access_enabled": bool(learner and learner.learner_access_enabled),
    }


@router.post("/students/{student_id}/learner-pin", response_model=LearnerAccessStatus)
def configure_learner_pin(
    student_id: int,
    payload: LearnerPinConfigureRequest,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    student = _owned_student(db, parent, student_id)
    if not verify_password(payload.parent_password, parent.password_hash):
        raise HTTPException(status_code=403, detail="Unable to update learner access")

    learner = _learner_user(db, student.id)
    if not learner:
        learner = User(
            full_name=student.name,
            email=None,
            username=None,
            password_hash=hash_password(secrets.token_urlsafe(32)),
            role=LEARNER_ROLE,
            parent_id=parent.id,
            student_id=student.id,
        )
        db.add(learner)
        db.flush()

    now = datetime.now(timezone.utc)
    _revoke_learner_access(db, learner, now)
    learner.learner_pin_hash = hash_learner_pin(payload.pin)
    learner.learner_access_enabled = True
    db.commit()
    return {"student_id": student.id, "pin_configured": True, "access_enabled": True}


@router.post("/students/{student_id}/learner-pin/disable", response_model=LearnerAccessStatus)
def disable_learner_pin(
    student_id: int,
    payload: ParentPasswordRequest,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    student = _owned_student(db, parent, student_id)
    if not verify_password(payload.parent_password, parent.password_hash):
        raise HTTPException(status_code=403, detail="Unable to update learner access")
    learner = _learner_user(db, student.id)
    if not learner:
        raise HTTPException(status_code=409, detail="Learner access is not configured")

    now = datetime.now(timezone.utc)
    _revoke_learner_access(db, learner, now)
    learner.learner_pin_hash = None
    learner.learner_access_enabled = False
    db.commit()
    return {"student_id": student.id, "pin_configured": False, "access_enabled": False}


@router.post("/students/{student_id}/learner-handoff", response_model=LearnerHandoffOut)
def authorize_learner_handoff(
    student_id: int,
    db: Session = Depends(get_db),
    parent: User = Depends(require_parent),
):
    student = _owned_student(db, parent, student_id)
    learner = _learner_user(db, student.id)
    if not learner or not learner.learner_pin_hash or not learner.learner_access_enabled:
        raise HTTPException(status_code=409, detail="Learner access is not configured")

    settings = get_settings()
    now = datetime.now(timezone.utc)
    db.execute(
        update(LearnerHandoff)
        .where(LearnerHandoff.parent_id == parent.id, LearnerHandoff.used_at.is_(None), LearnerHandoff.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    challenge = secrets.token_urlsafe(48)
    db.add(
        LearnerHandoff(
            challenge_hash=hash_challenge(challenge),
            student_id=student.id,
            parent_id=parent.id,
            expires_at=now + timedelta(seconds=settings.learner_handoff_expire_seconds),
        )
    )
    db.commit()
    return {
        "challenge": challenge,
        "expires_in_seconds": settings.learner_handoff_expire_seconds,
        "learner": student,
    }


@router.post("/auth/learner/redeem", response_model=TokenResponse)
def redeem_learner_handoff(payload: LearnerRedeemRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    now = datetime.now(timezone.utc)
    handoff = db.scalar(select(LearnerHandoff).where(LearnerHandoff.challenge_hash == hash_challenge(payload.challenge)))
    if not handoff or handoff.used_at or handoff.revoked_at or _utc(handoff.expires_at) <= now:
        raise HTTPException(status_code=401, detail="This learner handoff is invalid or expired")

    learner = _learner_user(db, handoff.student_id)
    if not learner or not learner.learner_access_enabled or not learner.learner_pin_hash:
        raise HTTPException(status_code=401, detail="Unable to sign in with that PIN")

    if learner.pin_locked_until and _utc(learner.pin_locked_until) > now:
        retry_after = max(1, int((_utc(learner.pin_locked_until) - now).total_seconds()))
        raise HTTPException(
            status_code=429,
            detail="Learner sign-in is temporarily unavailable. Try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    if not verify_learner_pin(payload.pin, learner.learner_pin_hash):
        learner.pin_failed_attempts += 1
        handoff.failed_attempts += 1
        if learner.pin_failed_attempts >= settings.learner_pin_max_attempts:
            learner.pin_locked_until = now + timedelta(seconds=settings.learner_pin_cooldown_seconds)
            learner.pin_failed_attempts = 0
        db.commit()
        raise HTTPException(status_code=401, detail="Unable to sign in with that PIN")

    consumed = db.execute(
        update(LearnerHandoff)
        .where(
            LearnerHandoff.id == handoff.id,
            LearnerHandoff.used_at.is_(None),
            LearnerHandoff.revoked_at.is_(None),
            LearnerHandoff.expires_at > now,
        )
        .values(used_at=now)
        .execution_options(synchronize_session=False)
    )
    if consumed.rowcount != 1:
        db.rollback()
        raise HTTPException(status_code=401, detail="This learner handoff is invalid or expired")

    learner.pin_failed_attempts = 0
    learner.pin_locked_until = None
    access_token, _ = create_learner_access_token(db, learner)
    db.commit()
    return {"access_token": access_token, "user": learner}


@router.get("/auth/learner/me", response_model=LearnerIdentityOut)
def learner_me(learner: User = Depends(require_learner), db: Session = Depends(get_db)):
    student = db.get(Student, learner.student_id)
    if not student:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"user": learner, "learner": student}


@router.post("/auth/learner/logout", status_code=204)
def learner_logout(
    payload: dict = Depends(get_current_token_payload),
    learner: User = Depends(require_learner),
    db: Session = Depends(get_db),
):
    token_id = payload.get("jti")
    learner_session = db.scalar(
        select(LearnerSession).where(LearnerSession.token_id == token_id, LearnerSession.user_id == learner.id)
    )
    if learner_session and learner_session.revoked_at is None:
        learner_session.revoked_at = datetime.now(timezone.utc)
        db.commit()
    return Response(status_code=204)
