from __future__ import annotations

import json
from typing import Any
from openai import OpenAI
from ..config import get_settings
from .fallback_service import (
    mock_coding_lesson,
    mock_hobby_activity,
    mock_marking,
    mock_revision_questions,
    mock_spiritual_lesson,
)
from .safety_service import validate_child_safe_text

settings = get_settings()


def _client() -> OpenAI | None:
    if settings.mock_ai_mode or not settings.openai_api_key or settings.openai_api_key.startswith("replace"):
        return None
    return OpenAI(
        api_key=settings.openai_api_key,
        timeout=settings.openai_timeout_seconds,
        max_retries=settings.openai_retry_count,
    )


def _safe_json_loads(raw: str) -> dict[str, Any]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Extra safety for rare cases where the model returns surrounding text.
        start = raw.find("{")
        end = raw.rfind("}")
        if start >= 0 and end >= start:
            return json.loads(raw[start : end + 1])
        raise


REVISION_SCHEMA = {
    "type": "object",
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "question": {"type": "string"},
                    "expected_answer": {"type": "string"},
                    "marking_guide": {"type": "string"},
                    "marks": {"type": "integer"},
                    "skill_tested": {"type": "string"},
                },
                "required": ["id", "question", "expected_answer", "marking_guide", "marks", "skill_tested"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["questions"],
    "additionalProperties": False,
}

MARKING_SCHEMA = {
    "type": "object",
    "properties": {
        "score": {"type": "number"},
        "total_marks": {"type": "number"},
        "percentage": {"type": "number"},
        "overall_feedback": {"type": "string"},
        "weak_areas": {"type": "array", "items": {"type": "string"}},
        "strengths": {"type": "array", "items": {"type": "string"}},
        "recommendations": {"type": "array", "items": {"type": "string"}},
        "marked_questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question_id": {"type": "integer"},
                    "question": {"type": "string"},
                    "student_answer": {"type": "string"},
                    "expected_answer": {"type": "string"},
                    "marks_awarded": {"type": "number"},
                    "total_marks": {"type": "number"},
                    "feedback": {"type": "string"},
                },
                "required": [
                    "question_id",
                    "question",
                    "student_answer",
                    "expected_answer",
                    "marks_awarded",
                    "total_marks",
                    "feedback",
                ],
                "additionalProperties": False,
            },
        },
    },
    "required": [
        "score",
        "total_marks",
        "percentage",
        "overall_feedback",
        "weak_areas",
        "strengths",
        "recommendations",
        "marked_questions",
    ],
    "additionalProperties": False,
}

CODING_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "explanation": {"type": "string"},
        "real_life_example": {"type": "string"},
        "activity": {"type": "string"},
        "quiz": {"type": "array", "items": {"type": "string"}},
        "parent_notes": {"type": "string"},
    },
    "required": ["title", "explanation", "real_life_example", "activity", "quiz", "parent_notes"],
    "additionalProperties": False,
}

SPIRITUAL_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "bible_reference": {"type": "string"},
        "memory_verse_summary": {"type": "string"},
        "story_lesson": {"type": "string"},
        "reflection_questions": {"type": "array", "items": {"type": "string"}},
        "practical_activity": {"type": "string"},
        "prayer": {"type": "string"},
    },
    "required": [
        "title",
        "bible_reference",
        "memory_verse_summary",
        "story_lesson",
        "reflection_questions",
        "practical_activity",
        "prayer",
    ],
    "additionalProperties": False,
}

HOBBY_ACTIVITY_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "objective": {"type": "string"},
        "materials": {"type": "array", "items": {"type": "string"}},
        "steps": {"type": "array", "items": {"type": "string"}},
        "estimated_time": {"type": "string"},
        "reflection_questions": {"type": "array", "items": {"type": "string"}},
        "parent_involvement": {"type": "string"},
        "follow_up_activity": {"type": "string"},
    },
    "required": [
        "title",
        "objective",
        "materials",
        "steps",
        "estimated_time",
        "reflection_questions",
        "parent_involvement",
        "follow_up_activity",
    ],
    "additionalProperties": False,
}


def _responses_json(system_prompt: str, user_prompt: str, schema_name: str, schema: dict[str, Any]) -> dict[str, Any]:
    client = _client()
    if client is None:
        raise RuntimeError("OpenAI client is not configured. Set OPENAI_API_KEY or enable MOCK_AI_MODE.")

    response = client.responses.create(
        model=settings.openai_model,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": schema_name,
                "schema": schema,
                "strict": True,
            }
        },
    )
    return _safe_json_loads(response.output_text)


def generate_revision_questions(grade: int, term: int, subject: str, topic: str, difficulty: str, count: int) -> dict:
    validate_child_safe_text(f"{subject} {topic}")
    client = _client()
    if client is None:
        return mock_revision_questions(grade, term, subject, topic, difficulty, count)

    system_prompt = (
        "You are a careful CBC Kenya revision assistant for upper primary learners. "
        "Create child-safe, age-appropriate revision questions. "
        "Do not include adult content, harmful content, politics, insults, or scary details. "
        "Use simple language. Avoid long paragraphs. "
        "Return only valid JSON matching the schema."
    )
    user_prompt = f"""
Create {count} revision questions for CBC Kenya.
Grade: {grade}
Term: {term}
Subject: {subject}
Topic: {topic}
Difficulty: {difficulty}

Rules:
- Questions should be suitable for paper-based answering.
- Mix short answer and explanation questions.
- Each question should have marks between 1 and 5.
- Include an expected answer and marking guide for the parent/teacher.
- Number question ids from 1 to {count}.
"""
    return _responses_json(system_prompt, user_prompt, "revision_questions", REVISION_SCHEMA)


def mark_revision_answers(questions: list[dict], answers: list[dict]) -> dict:
    client = _client()
    if client is None:
        return mock_marking(questions, answers)

    system_prompt = (
        "You are a fair and encouraging CBC Kenya revision marker. "
        "Mark according to the marking guide. Give child-friendly feedback. "
        "Do not shame the learner. Tell the learner exactly how to improve. "
        "Return only valid JSON matching the schema."
    )
    user_prompt = json.dumps(
        {
            "instructions": "Mark the student's answers. Award partial marks where reasonable.",
            "questions": questions,
            "answers": answers,
        },
        ensure_ascii=False,
    )
    return _responses_json(system_prompt, user_prompt, "marked_revision", MARKING_SCHEMA)


def generate_coding_lesson(grade: int, topic: str, minutes: int) -> dict:
    validate_child_safe_text(topic)
    client = _client()
    if client is None:
        return mock_coding_lesson(grade, topic, minutes)

    system_prompt = (
        "You are a friendly children's technology teacher. "
        "Explain IT, coding, and AI concepts using everyday examples. "
        "Keep it child-safe, practical, and simple. Return only valid JSON matching the schema."
    )
    user_prompt = f"""
Create a {minutes}-minute basic IT/coding/AI lesson.
Grade: {grade}
Topic: {topic}

Include:
- simple explanation
- real-life example
- one hands-on activity without needing paid tools
- three quiz questions
- parent notes
"""
    return _responses_json(system_prompt, user_prompt, "coding_lesson", CODING_SCHEMA)


def generate_spiritual_lesson(grade: int, theme: str, minutes: int) -> dict:
    validate_child_safe_text(theme)
    client = _client()
    if client is None:
        return mock_spiritual_lesson(grade, theme, minutes)

    system_prompt = (
        "You are a Christian children's spiritual guide. "
        "Create gentle, age-appropriate Bible lessons for children. "
        "Use Bible references and summarize verses instead of quoting long copyrighted Bible text. "
        "Avoid fear-based language. Encourage faith, kindness, obedience, wisdom, courage, and prayer. "
        "Return only valid JSON matching the schema."
    )
    user_prompt = f"""
Create a {minutes}-minute spiritual lesson.
Grade: {grade}
Theme: {theme}

Include:
- a title
- one Bible reference
- a short memory verse summary, not a long direct quote
- simple lesson story
- three reflection questions
- one practical activity
- a short child-friendly prayer
"""
    return _responses_json(system_prompt, user_prompt, "spiritual_lesson", SPIRITUAL_SCHEMA)


def generate_hobby_activity(
    grade: int,
    category: str,
    difficulty: str,
    available_time_minutes: int,
    available_materials: str,
    activity_type: str,
) -> dict:
    validate_child_safe_text(f"{category} {difficulty} {available_materials} {activity_type}")
    client = _client()
    if client is None:
        return mock_hobby_activity(
            grade,
            category,
            difficulty,
            available_time_minutes,
            available_materials,
            activity_type,
        )

    system_prompt = (
        "You are a warm children's hobbies and creativity coach. "
        "Create safe, age-appropriate creative activities for upper primary learners. "
        "Use common household or school materials where possible. "
        "Avoid unsafe tools, adult themes, expensive requirements, and long complicated instructions. "
        "Return only valid JSON matching the schema."
    )
    user_prompt = f"""
Create a structured hobby and creativity activity.
Grade: {grade}
Category: {category}
Difficulty: {difficulty}
Available time: {available_time_minutes} minutes
Available materials: {available_materials}
Activity type: {activity_type}

Include:
- a short fun title
- a clear objective
- materials list using the available materials where possible
- 5 to 8 simple steps
- estimated time
- three reflection questions
- parent involvement guidance
- one follow-up activity
"""
    return _responses_json(system_prompt, user_prompt, "hobby_activity", HOBBY_ACTIVITY_SCHEMA)
