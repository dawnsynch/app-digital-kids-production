from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    grade: Mapped[int] = mapped_column(Integer, nullable=False)
    age_group: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    parent: Mapped["User | None"] = relationship(back_populates="students", foreign_keys=[parent_id])
    learner_account: Mapped["User | None"] = relationship(
        back_populates="student",
        foreign_keys="User.student_id",
        uselist=False,
    )
    attempts: Mapped[list["AssessmentAttempt"]] = relationship(back_populates="student")
    learning_interactions: Mapped[list["LearningInteraction"]] = relationship(back_populates="student")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    username: Mapped[str | None] = mapped_column(String(80), unique=True, nullable=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    student_id: Mapped[int | None] = mapped_column(ForeignKey("students.id"), unique=True, nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    parent: Mapped["User | None"] = relationship(remote_side=[id], foreign_keys=[parent_id])
    students: Mapped[list[Student]] = relationship(back_populates="parent", foreign_keys=[Student.parent_id])
    student: Mapped[Student | None] = relationship(back_populates="learner_account", foreign_keys=[student_id])
    learning_interactions: Mapped[list["LearningInteraction"]] = relationship(back_populates="user", foreign_keys="LearningInteraction.user_id")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False)
    grade: Mapped[int] = mapped_column(Integer, nullable=False)
    term: Mapped[int] = mapped_column(Integer, nullable=False)
    subject: Mapped[str] = mapped_column(String(120), nullable=False)
    topic: Mapped[str] = mapped_column(String(200), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)
    question_count: Mapped[int] = mapped_column(Integer, nullable=False)
    questions_json: Mapped[str] = mapped_column(Text, nullable=False)
    student_answers_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_marks: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    student: Mapped[Student] = relationship(back_populates="attempts")


class LearningInteraction(Base):
    __tablename__ = "learning_interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    module_name: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    topic: Mapped[str | None] = mapped_column(String(200), nullable=True)
    title: Mapped[str | None] = mapped_column(String(240), nullable=True)
    content_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    assignment_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    learner_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="generated", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    student: Mapped[Student] = relationship(back_populates="learning_interactions")
    user: Mapped[User] = relationship(back_populates="learning_interactions", foreign_keys=[user_id])
