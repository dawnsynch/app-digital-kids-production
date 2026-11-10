from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator


class ParentRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=255, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Full name must contain at least 2 characters")
        return normalized

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class LoginRequest(BaseModel):
    email: str | None = Field(default=None, max_length=255)
    username: str | None = Field(default=None, max_length=80)
    password: str = Field(..., min_length=1, max_length=128)


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str | None = None
    username: str | None = None
    role: str
    parent_id: int | None = None
    student_id: int | None = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LearnerPinConfigureRequest(BaseModel):
    parent_password: str = Field(..., min_length=1, max_length=128)
    pin: str = Field(..., pattern=r"^\d{6}$")


class ParentPasswordRequest(BaseModel):
    parent_password: str = Field(..., min_length=1, max_length=128)


class LearnerAccessStatus(BaseModel):
    student_id: int
    pin_configured: bool
    access_enabled: bool


class LearnerHandoffOut(BaseModel):
    challenge: str
    expires_in_seconds: int
    learner: "StudentOut"


class LearnerRedeemRequest(BaseModel):
    challenge: str = Field(..., min_length=32, max_length=256)
    pin: str = Field(..., pattern=r"^\d{6}$")


class StudentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    grade: int = Field(..., ge=5, le=7)
    age_group: str | None = Field(default=None, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Learner name must contain at least 2 characters")
        return normalized

    @field_validator("age_group")
    @classmethod
    def normalize_age_group(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class StudentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    grade: int | None = Field(default=None, ge=5, le=7)
    age_group: str | None = Field(default=None, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Learner name must contain at least 2 characters")
        return normalized

    @field_validator("age_group")
    @classmethod
    def normalize_age_group(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None

    @model_validator(mode="after")
    def require_update_field(self):
        if not self.model_fields_set:
            raise ValueError("At least one learner profile field is required")
        return self


class StudentOut(BaseModel):
    id: int
    parent_id: int | None = None
    name: str
    grade: int
    age_group: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LearnerIdentityOut(BaseModel):
    user: UserOut
    learner: StudentOut


class LearnerAccountCreate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    username: str = Field(..., min_length=3, max_length=80, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(..., min_length=8, max_length=128)


class RevisionGenerateRequest(BaseModel):
    student_id: int
    term: int = Field(..., ge=1, le=3)
    subject: str = Field(..., min_length=2, max_length=120)
    topic: str = Field(default="General Revision", min_length=2, max_length=200)
    difficulty: str = Field(default="Medium", pattern="^(Easy|Medium|Hard)$")
    question_count: int = Field(default=5, ge=1, le=10)


class RevisionQuestion(BaseModel):
    id: int
    question: str
    expected_answer: str
    marking_guide: str
    marks: int
    skill_tested: str


class RevisionGenerateResponse(BaseModel):
    assessment_id: int
    student_id: int
    grade: int
    term: int
    subject: str
    topic: str
    difficulty: str
    questions: list[RevisionQuestion]


class LearnerPracticeSubject(BaseModel):
    name: str
    strands: list[str]


class LearnerPracticeOptions(BaseModel):
    learner_name: str
    grade: int
    terms: list[int]
    subjects: list[LearnerPracticeSubject]
    difficulty: list[str]
    question_counts: list[int]


class LearnerPracticeGenerateRequest(BaseModel):
    request_id: str = Field(..., min_length=16, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    term: int = Field(..., ge=1, le=3)
    subject: str = Field(..., min_length=2, max_length=120)
    strand: str = Field(..., min_length=2, max_length=200)
    difficulty: str = Field(default="Medium", pattern="^(Easy|Medium|Hard)$")
    question_count: int = Field(default=5, ge=1, le=10)

    model_config = {"extra": "forbid"}


class LearnerPracticeQuestion(BaseModel):
    id: int
    question: str
    marks: int
    skill_tested: str
    question_type: str = "text"


class LearnerPracticeAssessment(BaseModel):
    assessment_id: int
    grade: int
    term: int
    subject: str
    strand: str
    difficulty: str
    status: str
    questions: list[LearnerPracticeQuestion]


class AnswerItem(BaseModel):
    question_id: int
    answer: str = Field(..., max_length=2000)


class RevisionSubmitRequest(BaseModel):
    assessment_id: int
    answers: list[AnswerItem]


class RevisionAnswersResponse(BaseModel):
    assessment_id: int
    answers_count: int
    message: str


class MarkedQuestion(BaseModel):
    question_id: int
    question: str
    student_answer: str
    expected_answer: str
    marks_awarded: float
    total_marks: float
    feedback: str


class RevisionSubmitResponse(BaseModel):
    assessment_id: int
    score: float
    total_marks: float
    percentage: float
    overall_feedback: str
    weak_areas: list[str]
    strengths: list[str]
    recommendations: list[str]
    marked_questions: list[MarkedQuestion]


class CodingLessonRequest(BaseModel):
    grade: int = Field(..., ge=5, le=7)
    topic: str = Field(default="What is a computer?", min_length=2, max_length=200)
    lesson_minutes: int = Field(default=20, ge=5, le=45)


class CodingLessonResponse(BaseModel):
    title: str
    explanation: str
    real_life_example: str
    activity: str
    quiz: list[str]
    parent_notes: str


class SpiritualLessonRequest(BaseModel):
    grade: int = Field(..., ge=5, le=7)
    theme: str = Field(default="Peace and courage", min_length=2, max_length=200)
    lesson_minutes: int = Field(default=15, ge=5, le=45)


class SpiritualLessonResponse(BaseModel):
    title: str
    bible_reference: str
    memory_verse_summary: str
    story_lesson: str
    reflection_questions: list[str]
    practical_activity: str
    prayer: str


class HobbyActivityRequest(BaseModel):
    student_id: int
    category: str = Field(..., pattern="^(Music|Drawing|Creativity)$")
    difficulty: str = Field(default="Beginner", pattern="^(Beginner|Intermediate|Challenge)$")
    available_time_minutes: int = Field(default=30, ge=10, le=120)
    available_materials: str = Field(default="Paper, pencil, and household items", max_length=300)
    activity_type: str = Field(default="Hands-on project", max_length=120)


class HobbyActivityResponse(BaseModel):
    title: str
    objective: str
    materials: list[str]
    steps: list[str]
    estimated_time: str
    reflection_questions: list[str]
    parent_involvement: str
    follow_up_activity: str


class LearningInteractionCreate(BaseModel):
    student_id: int
    module_name: str = Field(..., pattern="^(coding_ai|spiritual_guide|hobbies_creativity)$")
    category: str | None = Field(default=None, max_length=120)
    topic: str | None = Field(default=None, max_length=200)
    title: str | None = Field(default=None, max_length=240)
    content_json: dict | list | None = None
    assignment_json: dict | list | None = None
    learner_response: str | None = None
    status: str = Field(default="generated", pattern="^(generated|assigned|completed|reviewed)$")


class LearningInteractionUpdate(BaseModel):
    learner_response: str | None = None
    status: str | None = Field(default=None, pattern="^(generated|assigned|completed|reviewed)$")
    assignment_json: dict | list | None = None


class LearningInteractionOut(BaseModel):
    id: int
    student_id: int
    user_id: int
    module_name: str
    category: str | None = None
    topic: str | None = None
    title: str | None = None
    content_json: dict | list | None = None
    assignment_json: dict | list | None = None
    learner_response: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime


class ProgressItem(BaseModel):
    assessment_id: int
    date: datetime
    grade: int
    term: int
    subject: str
    topic: str
    has_answers: bool = False
    is_marked: bool = False
    status: str
    score: float | None
    total_marks: float | None
    percentage: float | None


class ProgressSummary(BaseModel):
    student: StudentOut
    attempts_count: int
    average_percentage: float | None
    recent_attempts: list[ProgressItem]
    learning_interactions: list[LearningInteractionOut] = Field(default_factory=list)
