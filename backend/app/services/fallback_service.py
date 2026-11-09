from __future__ import annotations


def mock_revision_questions(grade: int, term: int, subject: str, topic: str, difficulty: str, count: int) -> dict:
    questions = []
    for i in range(1, count + 1):
        questions.append(
            {
                "id": i,
                "question": f"Grade {grade} {subject}: Explain one key idea about {topic}. Give one example.",
                "expected_answer": f"The learner should explain a correct idea about {topic} and give a simple example.",
                "marking_guide": "Award 1 mark for a correct explanation and 1 mark for a relevant example.",
                "marks": 2,
                "skill_tested": "Understanding and application",
            }
        )
    return {"questions": questions}


def mock_marking(questions: list[dict], answers: list[dict]) -> dict:
    answer_map = {item["question_id"]: item["answer"] for item in answers}
    marked = []
    score = 0.0
    total = 0.0

    for question in questions:
        qid = question["id"]
        total_marks = float(question.get("marks", 2))
        answer = answer_map.get(qid, "").strip()
        awarded = total_marks if len(answer) > 20 else (total_marks / 2 if answer else 0)
        score += awarded
        total += total_marks
        marked.append(
            {
                "question_id": qid,
                "question": question["question"],
                "student_answer": answer,
                "expected_answer": question["expected_answer"],
                "marks_awarded": awarded,
                "total_marks": total_marks,
                "feedback": "Good attempt. Add clearer explanation and examples to improve." if answer else "No answer provided.",
            }
        )

    percentage = round((score / total) * 100, 2) if total else 0
    return {
        "score": score,
        "total_marks": total,
        "percentage": percentage,
        "overall_feedback": "This is a mock marking result. Connect OpenAI for richer feedback.",
        "weak_areas": ["Give fuller answers", "Use examples"],
        "strengths": ["Attempted the questions"],
        "recommendations": ["Revise the topic again", "Try 3 more practice questions"],
        "marked_questions": marked,
    }


def mock_coding_lesson(grade: int, topic: str, minutes: int) -> dict:
    return {
        "title": f"Coding Lesson: {topic}",
        "explanation": f"Today we learn {topic} in a simple way suitable for Grade {grade}.",
        "real_life_example": "Think of a computer program like a recipe. The computer follows each instruction step by step.",
        "activity": "Write five step-by-step instructions for making a cup of tea. This teaches algorithm thinking.",
        "quiz": ["What is an instruction?", "Why must steps be in order?", "Give one example of an algorithm at home."],
        "parent_notes": f"Spend about {minutes} minutes. Focus on simple examples before code syntax.",
    }


def mock_spiritual_lesson(grade: int, theme: str, minutes: int) -> dict:
    return {
        "title": f"Spiritual Lesson: {theme}",
        "bible_reference": "John 14:27",
        "memory_verse_summary": "Jesus teaches that His peace helps us not to be afraid.",
        "story_lesson": "When children face exams or worries, they can pray, trust God, and do their best.",
        "reflection_questions": ["What can make a child worried?", "How can prayer help?", "What is one peaceful action you can take today?"],
        "practical_activity": "Write one worry on paper, pray about it, and write one positive action you will take.",
        "prayer": "Dear God, help me to trust You, learn well, and live with peace and courage. Amen.",
    }


def mock_hobby_activity(
    grade: int,
    category: str,
    difficulty: str,
    available_time_minutes: int,
    available_materials: str,
    activity_type: str,
) -> dict:
    return {
        "title": f"{category} Creative Challenge",
        "objective": f"Help a Grade {grade} learner practice {category.lower()} through a simple {activity_type.lower()} activity.",
        "materials": [item.strip() for item in available_materials.split(",") if item.strip()] or ["Paper", "Pencil"],
        "steps": [
            "Choose one simple idea you want to create.",
            "Plan it with a quick sketch, rhythm, or list of parts.",
            "Create your first version slowly and carefully.",
            "Improve one detail to make it clearer or more interesting.",
            "Share what you made and explain your favorite part.",
        ],
        "estimated_time": f"{available_time_minutes} minutes",
        "reflection_questions": [
            "What did you enjoy most?",
            "What was tricky, and how did you solve it?",
            "What would you change next time?",
        ],
        "parent_involvement": "A parent can encourage the learner, ask questions, and help gather safe materials.",
        "follow_up_activity": f"Try a slightly harder {category.lower()} activity tomorrow using one new idea.",
    }
