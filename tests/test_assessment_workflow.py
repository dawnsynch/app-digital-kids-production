from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import select

from backend.app.database import SessionLocal
from backend.app.models import AssessmentAttempt, AssessmentAuditEvent


def _headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _family(client: TestClient, label: str, grade: int = 5) -> tuple[dict, dict, dict]:
    parent_response = client.post(
        "/auth/register-parent",
        json={"full_name": f"{label} Parent", "email": f"{uuid4().hex}@example.com", "password": "password123"},
    )
    assert parent_response.status_code == 201
    parent = parent_response.json()
    student_response = client.post(
        "/students",
        json={"name": f"{label} Learner", "grade": grade},
        headers=_headers(parent["access_token"]),
    )
    assert student_response.status_code == 200
    student = student_response.json()
    assert client.post(
        f"/students/{student['id']}/learner-pin",
        json={"parent_password": "password123", "pin": "246810"},
        headers=_headers(parent["access_token"]),
    ).status_code == 200
    handoff = client.post(
        f"/students/{student['id']}/learner-handoff", headers=_headers(parent["access_token"])
    ).json()
    learner_response = client.post("/auth/learner/redeem", json={"challenge": handoff["challenge"], "pin": "246810"})
    assert learner_response.status_code == 200
    return parent, student, learner_response.json()


def _assessment(client: TestClient, learner: dict, request_id: str | None = None) -> dict:
    response = client.post(
        "/revision/learner/generate",
        json={
            "request_id": request_id or f"generation_{uuid4().hex}",
            "term": 1,
            "subject": "Mathematics",
            "strand": "Fractions",
            "difficulty": "Medium",
            "question_count": 5,
        },
        headers=_headers(learner["access_token"]),
    )
    assert response.status_code == 200
    return response.json()


def _answers(assessment: dict, suffix: str = "complete answer") -> list[dict]:
    return [{"question_id": question["id"], "answer": f"{suffix} {question['id']}"} for question in assessment["questions"]]


def test_full_submission_mark_review_release_and_audit_lifecycle(client: TestClient):
    parent, _, learner = _family(client, "Lifecycle")
    assessment = _assessment(client, learner)
    assessment_id = assessment["assessment_id"]
    learner_headers = _headers(learner["access_token"])
    parent_headers = _headers(parent["access_token"])
    answers = _answers(assessment)

    submitted = client.post(
        f"/revision/learner/{assessment_id}/submit",
        json={"request_id": f"submission_{uuid4().hex}", "answers": answers},
        headers=learner_headers,
    )
    assert submitted.status_code == 200
    assert submitted.json()["status"] == "submitted"
    assert submitted.json()["submission_version"] == 1
    assert submitted.json()["unanswered_count"] == 0
    assert client.get(f"/revision/learner/{assessment_id}/feedback", headers=learner_headers).status_code == 403

    listed = client.get("/revision/parent/assessments?status=submitted", headers=parent_headers)
    assert listed.status_code == 200
    assert [item["assessment_id"] for item in listed.json()] == [assessment_id]
    detail = client.get(f"/revision/parent/assessments/{assessment_id}", headers=parent_headers)
    assert detail.status_code == 200
    assert detail.json()["answers"] == answers
    assert detail.json()["result"] is None

    marked = client.post(
        f"/revision/parent/assessments/{assessment_id}/mark",
        json={"request_id": f"marking_{uuid4().hex}"},
        headers=parent_headers,
    )
    assert marked.status_code == 200
    assert marked.json()["status"] == "needs_review"
    assert marked.json()["result"]["marked_questions"][0]["student_answer"] == answers[0]["answer"]
    duplicate_mark = client.post(
        f"/revision/parent/assessments/{assessment_id}/mark",
        json={"request_id": f"duplicate_{uuid4().hex}"},
        headers=parent_headers,
    )
    assert duplicate_mark.status_code == 200
    assert duplicate_mark.json()["result"] == marked.json()["result"]

    assert client.post(
        f"/revision/parent/assessments/{assessment_id}/release",
        json={"request_id": f"release_early_{uuid4().hex}"},
        headers=parent_headers,
    ).status_code == 409
    reviewed = client.post(
        f"/revision/parent/assessments/{assessment_id}/review",
        json={"request_id": f"review_{uuid4().hex}"},
        headers=parent_headers,
    )
    assert reviewed.status_code == 200
    assert reviewed.json()["status"] == "marked"
    released = client.post(
        f"/revision/parent/assessments/{assessment_id}/release",
        json={"request_id": f"release_{uuid4().hex}"},
        headers=parent_headers,
    )
    assert released.status_code == 200
    assert released.json()["status"] == "released"
    assert client.post(
        f"/revision/parent/assessments/{assessment_id}/release",
        json={"request_id": f"release_again_{uuid4().hex}"},
        headers=parent_headers,
    ).json()["status"] == "released"

    feedback = client.get(f"/revision/learner/{assessment_id}/feedback", headers=learner_headers)
    assert feedback.status_code == 200
    assert feedback.json()["result"]["assessment_id"] == assessment_id
    assert "expected_answer" in feedback.text

    with SessionLocal() as db:
        attempt = db.get(AssessmentAttempt, assessment_id)
        assert attempt is not None
        assert attempt.status == "released"
        assert attempt.submission_version == 1
        assert attempt.marking_version == 1
        events = db.scalars(
            select(AssessmentAuditEvent).where(AssessmentAuditEvent.assessment_id == assessment_id).order_by(AssessmentAuditEvent.id)
        ).all()
        assert [event.event_type for event in events] == [
            "assessment_created", "answers_submitted", "marking_requested", "marking_completed",
            "marking_reviewed", "results_released",
        ]
        assert all("token" not in (event.metadata_json or "").lower() for event in events)


def test_partial_submission_idempotency_validation_and_locking(client: TestClient):
    _, _, learner = _family(client, "Submission")
    assessment = _assessment(client, learner)
    assessment_id = assessment["assessment_id"]
    headers = _headers(learner["access_token"])
    request_id = f"submission_{uuid4().hex}"
    partial = [{"question_id": assessment["questions"][0]["id"], "answer": "one answer"}]
    first = client.post(
        f"/revision/learner/{assessment_id}/submit",
        json={"request_id": request_id, "answers": partial},
        headers=headers,
    )
    assert first.status_code == 200
    assert first.json()["answered_count"] == 1
    assert first.json()["unanswered_count"] == 4
    repeated = client.post(
        f"/revision/learner/{assessment_id}/submit",
        json={"request_id": request_id, "answers": partial},
        headers=headers,
    )
    assert repeated.status_code == 200
    assert repeated.json() == first.json()
    same_content_new_key = client.post(
        f"/revision/learner/{assessment_id}/submit",
        json={"request_id": f"submission_{uuid4().hex}", "answers": partial},
        headers=headers,
    )
    assert same_content_new_key.status_code == 200
    conflicting = client.post(
        f"/revision/learner/{assessment_id}/submit",
        json={"request_id": request_id, "answers": [{"question_id": 1, "answer": "changed"}]},
        headers=headers,
    )
    assert conflicting.status_code == 409
    assert "locked" in conflicting.json()["detail"]
    assert client.post(
        f"/revision/learner/{assessment_id}/submit",
        json={"request_id": f"duplicate_answers_{uuid4().hex}", "answers": [partial[0], partial[0]]},
        headers=headers,
    ).status_code == 422

    another = _assessment(client, learner)
    unknown = client.post(
        f"/revision/learner/{another['assessment_id']}/submit",
        json={"request_id": f"unknown_question_{uuid4().hex}", "answers": [{"question_id": 999, "answer": "bad"}]},
        headers=headers,
    )
    assert unknown.status_code == 422
    replay = client.post(
        f"/revision/learner/{another['assessment_id']}/submit",
        json={"request_id": request_id, "answers": []},
        headers=headers,
    )
    assert replay.status_code == 409


def test_cross_family_role_and_pre_submission_boundaries(client: TestClient):
    parent_a, _, learner_a = _family(client, "Owner")
    parent_b, _, learner_b = _family(client, "Other")
    assessment = _assessment(client, learner_a)
    assessment_id = assessment["assessment_id"]
    answers = _answers(assessment)

    assert client.post(
        f"/revision/learner/{assessment_id}/submit",
        json={"request_id": f"cross_{uuid4().hex}", "answers": answers},
        headers=_headers(learner_b["access_token"]),
    ).status_code == 403
    assert client.post(
        f"/revision/learner/{assessment_id}/submit",
        json={"request_id": f"parent_{uuid4().hex}", "answers": answers},
        headers=_headers(parent_a["access_token"]),
    ).status_code == 403
    assert client.post(
        f"/revision/parent/assessments/{assessment_id}/mark",
        json={"request_id": f"before_submit_{uuid4().hex}"},
        headers=_headers(parent_a["access_token"]),
    ).status_code == 409
    assert client.get(
        f"/revision/parent/assessments/{assessment_id}", headers=_headers(parent_b["access_token"])
    ).status_code == 404
    assert client.post(
        f"/revision/parent/assessments/{assessment_id}/mark",
        json={"request_id": f"learner_mark_{uuid4().hex}"},
        headers=_headers(learner_a["access_token"]),
    ).status_code == 403


def test_marking_failure_invalid_output_and_retry(client: TestClient, monkeypatch):
    parent, _, learner = _family(client, "Retry")
    assessment = _assessment(client, learner)
    assessment_id = assessment["assessment_id"]
    answers = _answers(assessment)
    assert client.post(
        f"/revision/learner/{assessment_id}/submit",
        json={"request_id": f"submission_{uuid4().hex}", "answers": answers},
        headers=_headers(learner["access_token"]),
    ).status_code == 200
    parent_headers = _headers(parent["access_token"])

    monkeypatch.setattr("backend.app.routes.assessment_workflow.mark_revision_answers", lambda *_args: {"score": "invalid"})
    failed_key = f"marking_{uuid4().hex}"
    failed = client.post(
        f"/revision/parent/assessments/{assessment_id}/mark",
        json={"request_id": failed_key},
        headers=parent_headers,
    )
    assert failed.status_code == 503
    with SessionLocal() as db:
        attempt = db.get(AssessmentAttempt, assessment_id)
        assert attempt is not None
        assert attempt.status == "marking_failed"
        assert attempt.result_json is None
    assert client.post(
        f"/revision/parent/assessments/{assessment_id}/mark",
        json={"request_id": failed_key},
        headers=parent_headers,
    ).status_code == 409

    from backend.app.services.fallback_service import mock_marking
    monkeypatch.setattr("backend.app.routes.assessment_workflow.mark_revision_answers", mock_marking)
    retried = client.post(
        f"/revision/parent/assessments/{assessment_id}/mark",
        json={"request_id": f"retry_{uuid4().hex}"},
        headers=parent_headers,
    )
    assert retried.status_code == 200
    assert retried.json()["status"] == "needs_review"
    with SessionLocal() as db:
        events = db.scalars(select(AssessmentAuditEvent).where(AssessmentAuditEvent.assessment_id == assessment_id)).all()
        assert [event.event_type for event in events].count("marking_failed") == 1
        assert [event.event_type for event in events].count("marking_completed") == 1
