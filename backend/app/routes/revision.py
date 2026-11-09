import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..access import ensure_assessment_access, ensure_student_access
from ..config import get_settings
from ..database import get_db
from ..models import AssessmentAttempt, User
from ..schemas import (
    RevisionAnswersResponse,
    RevisionGenerateRequest,
    RevisionGenerateResponse,
    RevisionSubmitRequest,
    RevisionSubmitResponse,
)
from ..security import get_current_user, require_parent
from ..services.openai_service import generate_revision_questions, mark_revision_answers

router = APIRouter(prefix="/revision", tags=["revision"])
settings = get_settings()

CBC_SUBJECTS = {
    5: [
        "Mathematics",
        "English",
        "Kiswahili",
        "Science and Technology",
        "Social Studies",
        "CRE",
        "Agriculture and Nutrition",
        "Creative Arts",
    ],
    6: [
        "Mathematics",
        "English",
        "Kiswahili",
        "Science and Technology",
        "Social Studies",
        "CRE",
        "Agriculture and Nutrition",
        "Creative Arts",
    ],
    7: [
        "Mathematics",
        "English",
        "Kiswahili",
        "Integrated Science",
        "Social Studies",
        "CRE",
        "Agriculture and Nutrition",
        "Pre-Technical Studies",
        "Creative Arts and Sports",
    ],
}


@router.get("/options")
def revision_options(current_user: User = Depends(get_current_user)):
    return {
        "grades": [5, 6, 7],
        "terms": [1, 2, 3],
        "subjects": CBC_SUBJECTS,
        "difficulty": ["Easy", "Medium", "Hard"],
    }


@router.post("/generate", response_model=RevisionGenerateResponse)
def generate_revision(
    payload: RevisionGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.question_count > settings.max_questions_per_request:
        raise HTTPException(
            status_code=400,
            detail=f"Question count cannot exceed {settings.max_questions_per_request}",
        )
    student = ensure_student_access(db, current_user, payload.student_id)
    questions_payload = generate_revision_questions(
        grade=student.grade,
        term=payload.term,
        subject=payload.subject,
        topic=payload.topic,
        difficulty=payload.difficulty,
        count=payload.question_count,
    )
    questions = questions_payload["questions"]

    attempt = AssessmentAttempt(
        student_id=student.id,
        grade=student.grade,
        term=payload.term,
        subject=payload.subject,
        topic=payload.topic,
        difficulty=payload.difficulty,
        question_count=payload.question_count,
        questions_json=json.dumps(questions, ensure_ascii=False),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "assessment_id": attempt.id,
        "student_id": student.id,
        "grade": student.grade,
        "term": payload.term,
        "subject": payload.subject,
        "topic": payload.topic,
        "difficulty": payload.difficulty,
        "questions": questions,
    }


@router.post("/answers", response_model=RevisionAnswersResponse)
def save_revision_answers(
    payload: RevisionSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attempt = ensure_assessment_access(db, current_user, payload.assessment_id)
    for item in payload.answers:
        if len(item.answer) > settings.max_answer_length:
            raise HTTPException(
                status_code=400,
                detail=f"Answers cannot exceed {settings.max_answer_length} characters",
            )
    answers = [item.model_dump() for item in payload.answers]
    attempt.student_answers_json = json.dumps(answers, ensure_ascii=False)
    db.add(attempt)
    db.commit()
    return {
        "assessment_id": attempt.id,
        "answers_count": len(answers),
        "message": "Answers submitted successfully. A parent can review and mark them.",
    }


@router.get("/{assessment_id}")
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attempt = ensure_assessment_access(db, current_user, assessment_id)
    return {
        "assessment_id": attempt.id,
        "student_id": attempt.student_id,
        "grade": attempt.grade,
        "term": attempt.term,
        "subject": attempt.subject,
        "topic": attempt.topic,
        "difficulty": attempt.difficulty,
        "questions": json.loads(attempt.questions_json),
        "answers": json.loads(attempt.student_answers_json) if attempt.student_answers_json else None,
        "result": json.loads(attempt.result_json) if attempt.result_json else None,
    }


@router.post("/submit", response_model=RevisionSubmitResponse)
def submit_revision(
    payload: RevisionSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    attempt = ensure_assessment_access(db, current_user, payload.assessment_id)
    for item in payload.answers:
        if len(item.answer) > settings.max_answer_length:
            raise HTTPException(
                status_code=400,
                detail=f"Answers cannot exceed {settings.max_answer_length} characters",
            )
    questions = json.loads(attempt.questions_json)
    answers = [item.model_dump() for item in payload.answers]
    result = mark_revision_answers(questions, answers)

    attempt.student_answers_json = json.dumps(answers, ensure_ascii=False)
    attempt.result_json = json.dumps(result, ensure_ascii=False)
    attempt.score = float(result["score"])
    attempt.total_marks = float(result["total_marks"])
    db.add(attempt)
    db.commit()

    return {"assessment_id": attempt.id, **result}
