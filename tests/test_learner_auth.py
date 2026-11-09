from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import select

from backend.app.database import SessionLocal
from backend.app.models import LearnerHandoff, LearnerSession, User


def _headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _parent(client: TestClient, label: str = "PIN Parent") -> dict:
    response = client.post(
        "/auth/register-parent",
        json={
            "full_name": label,
            "email": f"{label.lower().replace(' ', '-')}-{uuid4().hex}@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    return response.json()


def _student(client: TestClient, parent: dict, name: str = "Secure Learner") -> dict:
    response = client.post(
        "/students",
        json={"name": name, "grade": 5, "age_group": "10-12"},
        headers=_headers(parent["access_token"]),
    )
    assert response.status_code == 200
    return response.json()


def _configure(client: TestClient, parent: dict, student: dict, pin: str = "246810") -> None:
    response = client.post(
        f"/students/{student['id']}/learner-pin",
        json={"parent_password": "password123", "pin": pin},
        headers=_headers(parent["access_token"]),
    )
    assert response.status_code == 200


def _handoff(client: TestClient, parent: dict, student: dict) -> str:
    response = client.post(
        f"/students/{student['id']}/learner-handoff",
        headers=_headers(parent["access_token"]),
    )
    assert response.status_code == 200
    return response.json()["challenge"]


def _redeem(client: TestClient, challenge: str, pin: str = "246810") -> dict:
    response = client.post("/auth/learner/redeem", json={"challenge": challenge, "pin": pin})
    assert response.status_code == 200
    return response.json()


def test_parent_configures_hashed_pin_with_reverification_and_ownership(client: TestClient):
    parent_a = _parent(client, "PIN Owner")
    parent_b = _parent(client, "Other Parent")
    student = _student(client, parent_a)

    wrong_password = client.post(
        f"/students/{student['id']}/learner-pin",
        json={"parent_password": "incorrect", "pin": "246810"},
        headers=_headers(parent_a["access_token"]),
    )
    assert wrong_password.status_code == 403
    assert wrong_password.json() == {"detail": "Unable to update learner access"}

    cross_parent = client.post(
        f"/students/{student['id']}/learner-pin",
        json={"parent_password": "password123", "pin": "246810"},
        headers=_headers(parent_b["access_token"]),
    )
    assert cross_parent.status_code == 404
    assert client.post(
        f"/students/{student['id']}/learner-pin",
        json={"parent_password": "password123", "pin": "1234"},
        headers=_headers(parent_a["access_token"]),
    ).status_code == 422

    _configure(client, parent_a, student)
    status = client.get(
        f"/students/{student['id']}/learner-access",
        headers=_headers(parent_a["access_token"]),
    )
    assert status.json() == {"student_id": student["id"], "pin_configured": True, "access_enabled": True}

    with SessionLocal() as db:
        learner = db.scalar(select(User).where(User.student_id == student["id"]))
        assert learner is not None
        assert learner.learner_pin_hash
        assert "246810" not in learner.learner_pin_hash


def test_single_use_handoff_creates_scoped_learner_session(client: TestClient):
    parent = _parent(client)
    student = _student(client, parent)
    other_student = _student(client, parent, "Sibling Learner")
    _configure(client, parent, student)
    challenge = _handoff(client, parent, student)

    with SessionLocal() as db:
        stored = db.scalar(select(LearnerHandoff).where(LearnerHandoff.student_id == student["id"]))
        assert stored is not None
        assert stored.challenge_hash != challenge
        assert challenge not in stored.challenge_hash

    auth = _redeem(client, challenge)
    learner_headers = _headers(auth["access_token"])
    identity = client.get("/auth/learner/me", headers=learner_headers)
    assert identity.status_code == 200
    assert identity.json()["learner"]["id"] == student["id"]
    assert identity.json()["learner"]["name"] == student["name"]
    assert client.get(f"/students/{student['id']}", headers=learner_headers).status_code == 200
    assert client.get(f"/students/{other_student['id']}", headers=learner_headers).status_code == 403
    assert client.post("/students", json={"name": "Denied", "grade": 5}, headers=learner_headers).status_code == 403
    assert client.get("/auth/learner/me", headers=_headers(parent["access_token"])).status_code == 403
    assert client.post("/auth/learner/redeem", json={"challenge": challenge, "pin": "246810"}).status_code == 401
    with SessionLocal() as db:
        session = db.scalar(select(LearnerSession).where(LearnerSession.student_id == student["id"]))
        assert session is not None
        session.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.commit()
    assert client.get("/auth/learner/me", headers=learner_headers).status_code == 401


def test_incorrect_pin_expired_handoff_and_cooldown_are_enforced(client: TestClient):
    parent = _parent(client)
    student = _student(client, parent)
    _configure(client, parent, student)
    challenge = _handoff(client, parent, student)

    for _ in range(5):
        invalid = client.post("/auth/learner/redeem", json={"challenge": challenge, "pin": "000000"})
        assert invalid.status_code == 401
        assert invalid.json() == {"detail": "Unable to sign in with that PIN"}
    cooldown = client.post("/auth/learner/redeem", json={"challenge": challenge, "pin": "246810"})
    assert cooldown.status_code == 429
    assert int(cooldown.headers["retry-after"]) >= 1

    fresh = _handoff(client, parent, student)
    with SessionLocal() as db:
        handoff = db.scalar(select(LearnerHandoff).where(LearnerHandoff.challenge_hash.is_not(None)).order_by(LearnerHandoff.id.desc()))
        assert handoff is not None
        handoff.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        learner = db.scalar(select(User).where(User.student_id == student["id"]))
        assert learner is not None
        learner.pin_locked_until = None
        db.commit()
    expired = client.post("/auth/learner/redeem", json={"challenge": fresh, "pin": "246810"})
    assert expired.status_code == 401
    assert expired.json() == {"detail": "This learner handoff is invalid or expired"}


def test_logout_and_pin_reset_revoke_server_side_sessions(client: TestClient):
    parent = _parent(client)
    student = _student(client, parent)
    _configure(client, parent, student)
    first = _redeem(client, _handoff(client, parent, student))
    first_headers = _headers(first["access_token"])
    assert client.get("/auth/learner/me", headers=first_headers).status_code == 200
    assert client.post("/auth/learner/logout", headers=first_headers).status_code == 204
    assert client.get("/auth/learner/me", headers=first_headers).status_code == 401

    second = _redeem(client, _handoff(client, parent, student))
    second_headers = _headers(second["access_token"])
    _configure(client, parent, student, pin="135790")
    assert client.get("/auth/learner/me", headers=second_headers).status_code == 401
    with SessionLocal() as db:
        sessions = db.scalars(select(LearnerSession).where(LearnerSession.student_id == student["id"])).all()
        assert sessions and all(session.revoked_at is not None for session in sessions)


def test_parent_disablement_revokes_sessions_and_future_handoffs(client: TestClient):
    parent = _parent(client)
    student = _student(client, parent)
    _configure(client, parent, student)
    auth = _redeem(client, _handoff(client, parent, student))
    learner_headers = _headers(auth["access_token"])

    disabled = client.post(
        f"/students/{student['id']}/learner-pin/disable",
        json={"parent_password": "password123"},
        headers=_headers(parent["access_token"]),
    )
    assert disabled.status_code == 200
    assert disabled.json()["access_enabled"] is False
    assert client.get("/auth/learner/me", headers=learner_headers).status_code == 401
    assert client.post(
        f"/students/{student['id']}/learner-handoff",
        headers=_headers(parent["access_token"]),
    ).status_code == 409
