import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import select

from .config import get_settings
from .database import get_db
from .models import LearnerSession, User

PARENT_ROLE = "parent"
LEARNER_ROLE = "learner"
ADMIN_ROLE = "admin"

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 210_000)
    return f"pbkdf2_sha256$210000${salt}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected = password_hash.split("$", 3)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), int(iterations))
    return hmac.compare_digest(digest.hex(), expected)


def hash_learner_pin(pin: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", pin.encode("utf-8"), salt.encode("utf-8"), 310_000)
    return f"learner_pin_pbkdf2_sha256$310000${salt}${digest.hex()}"


def verify_learner_pin(pin: str, pin_hash: str | None) -> bool:
    if not pin_hash:
        return False
    try:
        algorithm, iterations, salt, expected = pin_hash.split("$", 3)
        if algorithm != "learner_pin_pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac("sha256", pin.encode("utf-8"), salt.encode("utf-8"), int(iterations))
    except (TypeError, ValueError):
        return False
    return hmac.compare_digest(digest.hex(), expected)


def hash_challenge(challenge: str) -> str:
    return hashlib.sha256(challenge.encode("utf-8")).hexdigest()


def create_access_token(user: User) -> str:
    settings = get_settings()
    secret = require_jwt_configured()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "aud": "digital-kids-api",
        "token_type": "account_access",
        "exp": int(expires_at.timestamp()),
    }
    return _encode_jwt(payload, secret, settings.jwt_algorithm)


def create_learner_access_token(db: Session, user: User) -> tuple[str, LearnerSession]:
    if user.role != LEARNER_ROLE or not user.student_id:
        raise ValueError("A linked learner identity is required")
    settings = get_settings()
    secret = require_jwt_configured()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.learner_session_expire_minutes)
    token_id = secrets.token_hex(32)
    learner_session = LearnerSession(
        token_id=token_id,
        user_id=user.id,
        student_id=user.student_id,
        credential_version=user.learner_session_version,
        expires_at=expires_at,
    )
    db.add(learner_session)
    payload = {
        "sub": str(user.id),
        "role": LEARNER_ROLE,
        "student_id": user.student_id,
        "aud": "digital-kids-learner",
        "token_type": "learner_access",
        "jti": token_id,
        "credential_version": user.learner_session_version,
        "exp": int(expires_at.timestamp()),
    }
    return _encode_jwt(payload, secret, settings.jwt_algorithm), learner_session


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    secret = require_jwt_configured()
    try:
        payload = _decode_jwt(token, secret, settings.jwt_algorithm)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc

    exp = payload.get("exp")
    if not isinstance(exp, int) or datetime.now(timezone.utc).timestamp() > exp:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    token_type = payload.get("token_type")
    audience = payload.get("aud")
    if (token_type, audience) not in {
        ("account_access", "digital-kids-api"),
        ("learner_access", "digital-kids-learner"),
    }:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return payload


def get_current_token_payload(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return decode_access_token(credentials.credentials)


def get_current_user(
    payload: dict[str, Any] = Depends(get_current_token_payload),
    db: Session = Depends(get_db),
) -> User:
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc

    user = db.get(User, user_id_int)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if payload.get("token_type") == "learner_access":
        token_id = payload.get("jti")
        student_id = payload.get("student_id")
        credential_version = payload.get("credential_version")
        learner_session = db.scalar(select(LearnerSession).where(LearnerSession.token_id == token_id))
        now = datetime.now(timezone.utc)
        session_expiry = learner_session.expires_at if learner_session else None
        if session_expiry and session_expiry.tzinfo is None:
            session_expiry = session_expiry.replace(tzinfo=timezone.utc)
        if (
            user.role != LEARNER_ROLE
            or not user.learner_access_enabled
            or not learner_session
            or learner_session.revoked_at is not None
            or not session_expiry
            or session_expiry <= now
            or learner_session.user_id != user.id
            or learner_session.student_id != user.student_id
            or student_id != user.student_id
            or credential_version != user.learner_session_version
            or learner_session.credential_version != user.learner_session_version
        ):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    elif user.role == LEARNER_ROLE:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user


def require_parent(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != PARENT_ROLE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Parent access required")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != ADMIN_ROLE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def require_parent_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in {PARENT_ROLE, ADMIN_ROLE}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Parent or admin access required")
    return current_user


def require_authenticated_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


def require_learner(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != LEARNER_ROLE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Learner access required")
    return current_user


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _encode_jwt(payload: dict[str, Any], secret: str, algorithm: str) -> str:
    if algorithm != "HS256":
        raise ValueError("Only HS256 JWT signing is supported")
    header = {"alg": algorithm, "typ": "JWT"}
    signing_input = ".".join(
        [
            _b64encode(json.dumps(header, separators=(",", ":")).encode("utf-8")),
            _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8")),
        ]
    )
    signature = hmac.new(secret.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256).digest()
    return f"{signing_input}.{_b64encode(signature)}"


def _decode_jwt(token: str, secret: str, algorithm: str) -> dict[str, Any]:
    if algorithm != "HS256":
        raise ValueError("Only HS256 JWT signing is supported")
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
        signing_input = f"{header_b64}.{payload_b64}"
        header = json.loads(_b64decode(header_b64))
        payload = json.loads(_b64decode(payload_b64))
    except Exception as exc:
        raise ValueError("Malformed token") from exc

    if header.get("alg") != algorithm:
        raise ValueError("Unexpected signing algorithm")

    expected_signature = hmac.new(secret.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256).digest()
    if not hmac.compare_digest(_b64decode(signature_b64), expected_signature):
        raise ValueError("Invalid token signature")
    return payload


def require_jwt_configured() -> str:
    secret = get_settings().jwt_secret_key
    if not secret:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="JWT secret is not configured")
    return secret
