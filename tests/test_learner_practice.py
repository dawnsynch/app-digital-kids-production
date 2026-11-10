from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import func, select

from backend.app.database import SessionLocal
from backend.app.models import AssessmentAttempt, LearnerSession


def _headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _learner(client: TestClient, name: str = "Practice Learner", grade: int = 5) -> tuple[dict, dict, dict]:
    parent = client.post(
        "/auth/register-parent",
        json={"full_name": f"{name} Parent", "email": f"{uuid4().hex}@example.com", "password": "password123"},
    ).json()
    student = client.post(
        "/students",
        json={"name": name, "grade": grade},
        headers=_headers(parent["access_token"]),
    ).json()
    configured = client.post(
        f"/students/{student['id']}/learner-pin",
        json={"parent_password": "password123", "pin": "246810"},
        headers=_headers(parent["access_token"]),
    )
    assert configured.status_code == 200
    handoff = client.post(
        f"/students/{student['id']}/learner-handoff", headers=_headers(parent["access_token"])
    ).json()
    learner = client.post(
        "/auth/learner/redeem", json={"challenge": handoff["challenge"], "pin": "246810"}
    ).json()
    return parent, student, learner


def _payload(request_id: str = "request_1234567890") -> dict:
    return {
        "request_id": request_id,
        "term": 1,
        "subject": "Mathematics",
        "strand": "Fractions",
        "difficulty": "Medium",
        "question_count": 5,
    }


def test_learner_options_generation_idempotency_and_safe_retrieval(client: TestClient):
    parent, student, learner = _learner(client)
    learner_headers = _headers(learner["access_token"])
    options = client.get("/revision/learner/options", headers=learner_headers)
    assert options.status_code == 200
    assert options.json()["grade"] == student["grade"]
    assert options.json()["learner_name"] == student["name"]

    first = client.post("/revision/learner/generate", json=_payload(), headers=learner_headers)
    second = client.post("/revision/learner/generate", json=_payload(), headers=learner_headers)
    assert first.status_code == second.status_code == 200
    assert first.json()["assessment_id"] == second.json()["assessment_id"]
    serialized = str(first.json()).lower()
    assert "expected_answer" not in serialized
    assert "marking_guide" not in serialized
    assert len(first.json()["questions"]) == 5

    retrieved = client.get(f"/revision/learner/{first.json()['assessment_id']}", headers=learner_headers)
    assert retrieved.status_code == 200
    assert retrieved.json() == first.json()
    assert client.post("/revision/generate", json={"student_id": student["id"], **{k: v for k, v in _payload().items() if k not in {"request_id", "strand"}}, "topic": "Fractions"}, headers=learner_headers).status_code == 403
    assert client.get(f"/revision/{first.json()['assessment_id']}", headers=learner_headers).status_code == 403
    answers = [{"question_id": item["id"], "answer": "draft"} for item in first.json()["questions"]]
    assert client.post("/revision/submit", json={"assessment_id": first.json()["assessment_id"], "answers": answers}, headers=learner_headers).status_code == 403
    assert client.post(
        f"/revision/learner/{first.json()['assessment_id']}/submit",
        json={"request_id": "submission_123456789", "answers": answers},
        headers=learner_headers,
    ).status_code == 200
    assert client.post("/revision/submit", json={"assessment_id": first.json()["assessment_id"], "answers": answers}, headers=_headers(parent["access_token"])).status_code == 200
    with SessionLocal() as db:
        assert db.scalar(select(func.count(AssessmentAttempt.id))) == 1


def test_practice_validation_ownership_and_revoked_session(client: TestClient):
    _, _, learner_a = _learner(client, "Learner A", 5)
    _, _, learner_b = _learner(client, "Learner B", 6)
    headers_a = _headers(learner_a["access_token"])
    headers_b = _headers(learner_b["access_token"])
    created = client.post("/revision/learner/generate", json=_payload("request_abcdefghijkl"), headers=headers_a)
    assert created.status_code == 200
    assessment_id = created.json()["assessment_id"]
    assert client.get(f"/revision/learner/{assessment_id}", headers=headers_b).status_code == 403

    invalid_payloads = [
        {**_payload("invalid_subject_123"), "subject": "Not a CBC subject"},
        {**_payload("invalid_strand_123"), "strand": "Not a strand"},
        {**_payload("invalid_term_12345"), "term": 4},
        {**_payload("invalid_difficulty"), "difficulty": "Extreme"},
        {**_payload("invalid_count_123"), "question_count": 11},
        {**_payload("client_grade_1234"), "grade": 6},
        {**_payload("client_student_123"), "student_id": 999},
    ]
    for payload in invalid_payloads:
        assert client.post("/revision/learner/generate", json=payload, headers=headers_a).status_code in {400, 422}

    assert client.post("/auth/learner/logout", headers=headers_a).status_code == 204
    assert client.get("/revision/learner/options", headers=headers_a).status_code == 401
    with SessionLocal() as db:
        session = db.scalar(select(LearnerSession).order_by(LearnerSession.id.desc()))
        assert session is not None
        session.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.commit()


def test_generation_failure_does_not_persist_partial_assessment(client: TestClient, monkeypatch):
    _, _, learner = _learner(client)

    def malformed_generation(**_kwargs):
        return {"questions": [{"id": 1, "question": "Incomplete"}]}

    monkeypatch.setattr("backend.app.routes.revision.generate_revision_questions", malformed_generation)
    response = client.post(
        "/revision/learner/generate",
        json=_payload("malformed_12345678"),
        headers=_headers(learner["access_token"]),
    )
    assert response.status_code == 503
    assert response.json() == {"detail": "Questions could not be generated safely. Please try again."}
    with SessionLocal() as db:
        assert db.scalar(select(func.count(AssessmentAttempt.id))) == 0

    monkeypatch.setattr(
        "backend.app.routes.revision.generate_revision_questions",
        lambda **_kwargs: (_ for _ in ()).throw(RuntimeError("provider secret diagnostic")),
    )
    provider_failure = client.post(
        "/revision/learner/generate",
        json=_payload("provider_failure_12"),
        headers=_headers(learner["access_token"]),
    )
    assert provider_failure.status_code == 503
    assert "provider secret" not in provider_failure.text


def test_generation_rate_limit_is_learner_specific(client: TestClient, monkeypatch):
    _, _, learner = _learner(client)
    monkeypatch.setattr("backend.app.routes.revision.settings.max_ai_requests_per_learner_per_hour", 1)
    headers = _headers(learner["access_token"])
    assert client.post("/revision/learner/generate", json=_payload("rate_limit_first_1"), headers=headers).status_code == 200
    limited = client.post("/revision/learner/generate", json=_payload("rate_limit_second1"), headers=headers)
    assert limited.status_code == 429
    assert limited.json() == {"detail": "Practice generation limit reached. Please try again later."}
