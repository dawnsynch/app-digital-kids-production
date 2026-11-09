from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi.testclient import TestClient
from backend.app.config import get_settings
from backend.app.database import SessionLocal
from backend.app.models import User
from backend.app.security import _encode_jwt, hash_password


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _register_parent(client: TestClient, label: str) -> dict:
    unique = uuid4().hex
    response = client.post(
        "/auth/register-parent",
        json={
            "full_name": label,
            "email": f"{label.lower().replace(' ', '-')}-{unique}@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    return response.json()


def _create_student(client: TestClient, token: str, name: str = "Learner A", grade: int = 5) -> dict:
    response = client.post(
        "/students",
        json={"name": name, "grade": grade, "age_group": "10-12"},
        headers=_auth_headers(token),
    )
    assert response.status_code == 200
    return response.json()


def _create_learner_login(client: TestClient, parent_token: str, student_id: int) -> dict:
    username = f"learner-{uuid4().hex}"
    account = client.post(
        f"/students/{student_id}/learner-account",
        json={"full_name": "Learner A", "username": username, "password": "password123"},
        headers=_auth_headers(parent_token),
    )
    assert account.status_code == 200
    response = client.post("/auth/login", json={"username": username, "password": "password123"})
    assert response.status_code == 200
    return response.json()


def test_health_endpoint_exposes_operational_contract(client: TestClient):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "digital-kids-learning-api",
        "ai_mode": "mock",
        "openai_configured": False,
        "openai_model": "gpt-4.1-mini",
        "mock_reason": "MOCK_AI_MODE or USE_MOCK_AI is enabled",
    }


def test_parent_registration_login_and_me_never_expose_password_hash(client: TestClient):
    email = f"parent-{uuid4().hex}@example.com"
    registration = client.post(
        "/auth/register-parent",
        json={"full_name": "Parent A", "email": email, "password": "password123"},
    )
    assert registration.status_code == 201
    registration_payload = registration.json()
    assert "password_hash" not in registration_payload["user"]

    login = client.post("/auth/login", json={"email": email, "password": "password123"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/auth/me", headers=_auth_headers(token))
    assert me.status_code == 200
    assert me.json()["role"] == "parent"
    assert "password_hash" not in me.json()


def test_duplicate_parent_email_is_rejected_case_insensitively(client: TestClient):
    email = f"duplicate-{uuid4().hex}@example.com"
    payload = {"full_name": "Parent Duplicate", "email": email, "password": "password123"}
    assert client.post("/auth/register-parent", json=payload).status_code == 201
    duplicate = client.post("/auth/register-parent", json={**payload, "email": email.upper()})
    assert duplicate.status_code == 400
    assert duplicate.json() == {"detail": "A parent with this email already exists"}


def test_valid_and_invalid_parent_login(client: TestClient):
    registration = _register_parent(client, "Login Parent")
    email = registration["user"]["email"]

    valid = client.post("/auth/login", json={"email": email, "password": "password123"})
    assert valid.status_code == 200
    assert valid.json()["user"]["role"] == "parent"
    assert client.post("/auth/login", json={"email": email, "password": "wrong-password"}).status_code == 401
    assert client.post("/auth/login", json={"email": "missing@example.com", "password": "password123"}).status_code == 401


def test_me_rejects_missing_invalid_tampered_and_expired_tokens(client: TestClient):
    parent = _register_parent(client, "Token Parent")
    settings = get_settings()
    expired = _encode_jwt(
        {
            "sub": str(parent["user"]["id"]),
            "role": "parent",
            "exp": int((datetime.now(timezone.utc) - timedelta(minutes=1)).timestamp()),
        },
        settings.jwt_secret_key or "",
        settings.jwt_algorithm,
    )
    token = parent["access_token"]
    tampered = f"{token[:-1]}{'a' if token[-1] != 'a' else 'b'}"

    assert client.get("/auth/me").status_code == 401
    assert client.get("/auth/me", headers=_auth_headers("invalid-token")).status_code == 401
    assert client.get("/auth/me", headers=_auth_headers(tampered)).status_code == 401
    assert client.get("/auth/me", headers=_auth_headers(expired)).status_code == 401


def test_me_rejects_token_for_inactive_user(client: TestClient):
    parent = _register_parent(client, "Inactive Parent")
    with SessionLocal() as db:
        user = db.get(User, parent["user"]["id"])
        assert user is not None
        user.is_active = False
        db.commit()

    assert client.get("/auth/me", headers=_auth_headers(parent["access_token"])).status_code == 401


def test_parent_learner_and_admin_roles_remain_separated(client: TestClient):
    parent = _register_parent(client, "Role Parent")
    student = _create_student(client, parent["access_token"])
    learner = _create_learner_login(client, parent["access_token"], student["id"])
    with SessionLocal() as db:
        admin = User(
            full_name="Admin User",
            email=f"admin-{uuid4().hex}@example.com",
            password_hash=hash_password("password123"),
            role="admin",
        )
        db.add(admin)
        db.commit()
        admin_email = admin.email
    admin_login = client.post("/auth/login", json={"email": admin_email, "password": "password123"})
    assert admin_login.status_code == 200

    for auth, role in ((parent, "parent"), (learner, "learner"), (admin_login.json(), "admin")):
        identity = client.get("/auth/me", headers=_auth_headers(auth["access_token"]))
        assert identity.status_code == 200
        assert identity.json()["role"] == role
        assert "password_hash" not in identity.json()

    assert client.get("/admin/summary", headers=_auth_headers(admin_login.json()["access_token"])).status_code == 200
    assert client.post("/students", json={"name": "Denied", "grade": 5}, headers=_auth_headers(learner["access_token"])).status_code == 403
    assert client.post("/students", json={"name": "Denied", "grade": 5}, headers=_auth_headers(admin_login.json()["access_token"])).status_code == 403


def test_parent_and_learner_student_access_is_scoped(client: TestClient):
    parent_a = _register_parent(client, "Parent A")
    parent_b = _register_parent(client, "Parent B")
    student = _create_student(client, parent_a["access_token"])
    learner = _create_learner_login(client, parent_a["access_token"], student["id"])
    parent_b_headers = _auth_headers(parent_b["access_token"])
    learner_headers = _auth_headers(learner["access_token"])

    assert client.get(f"/students/{student['id']}", headers=parent_b_headers).status_code == 403
    assert client.get(f"/progress/student/{student['id']}", headers=parent_b_headers).status_code == 403
    assert client.post(
        f"/students/{student['id']}/learner-account",
        json={"username": f"blocked-{uuid4().hex}", "password": "password123"},
        headers=parent_b_headers,
    ).status_code == 403

    own_profile = client.get(f"/students/{student['id']}", headers=learner_headers)
    assert own_profile.status_code == 200
    assert client.get("/students", headers=learner_headers).json() == [own_profile.json()]
    assert client.post(
        "/students",
        json={"name": "Blocked", "grade": 5},
        headers=learner_headers,
    ).status_code == 403


def test_revision_answer_and_marking_boundaries(client: TestClient):
    parent_a = _register_parent(client, "Parent A")
    parent_b = _register_parent(client, "Parent B")
    student = _create_student(client, parent_a["access_token"])
    learner = _create_learner_login(client, parent_a["access_token"], student["id"])
    parent_a_headers = _auth_headers(parent_a["access_token"])
    parent_b_headers = _auth_headers(parent_b["access_token"])
    learner_headers = _auth_headers(learner["access_token"])

    assessment = client.post(
        "/revision/generate",
        json={
            "student_id": student["id"], "term": 1, "subject": "Mathematics",
            "topic": "Numbers", "difficulty": "Easy", "question_count": 2,
        },
        headers=parent_a_headers,
    )
    assert assessment.status_code == 200
    assessment_id = assessment.json()["assessment_id"]
    answers = [{"question_id": item["id"], "answer": "Test answer"} for item in assessment.json()["questions"]]

    assert client.get(f"/revision/{assessment_id}", headers=parent_b_headers).status_code == 403
    assert client.post(
        "/revision/answers",
        json={"assessment_id": assessment_id, "answers": answers},
        headers=learner_headers,
    ).status_code == 200
    assert client.post(
        "/revision/submit",
        json={"assessment_id": assessment_id, "answers": answers},
        headers=learner_headers,
    ).status_code == 403

    marked = client.post(
        "/revision/submit",
        json={"assessment_id": assessment_id, "answers": answers},
        headers=parent_a_headers,
    )
    assert marked.status_code == 200
    assert marked.json()["assessment_id"] == assessment_id


def test_learner_cannot_request_learning_content_for_another_grade(client: TestClient):
    parent = _register_parent(client, "Parent A")
    student = _create_student(client, parent["access_token"], grade=5)
    learner = _create_learner_login(client, parent["access_token"], student["id"])
    headers = _auth_headers(learner["access_token"])

    assert client.post(
        "/learning/coding",
        json={"grade": 5, "topic": "What is a computer?", "lesson_minutes": 20},
        headers=headers,
    ).status_code == 200
    assert client.post(
        "/learning/spiritual",
        json={"grade": 5, "theme": "Courage", "lesson_minutes": 15},
        headers=headers,
    ).status_code == 200
    assert client.post(
        "/learning/coding",
        json={"grade": 6, "topic": "Variables", "lesson_minutes": 20},
        headers=headers,
    ).status_code == 403


def test_invalid_missing_and_parent_only_access_are_rejected(client: TestClient):
    parent = _register_parent(client, "Parent A")
    student = _create_student(client, parent["access_token"])
    learner = _create_learner_login(client, parent["access_token"], student["id"])

    assert client.get(f"/students/{student['id']}").status_code == 401
    assert client.get(
        f"/students/{student['id']}", headers={"Authorization": "Bearer invalid-token"},
    ).status_code == 401
    assert client.get("/admin/summary", headers=_auth_headers(parent["access_token"])).status_code == 403
    assert client.get("/progress/summary", headers=_auth_headers(learner["access_token"])).status_code == 403
