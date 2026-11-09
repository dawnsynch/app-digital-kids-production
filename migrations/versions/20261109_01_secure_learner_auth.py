"""Add secure learner handoffs, PIN state, and revocable sessions."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "20261109_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    tables = set(inspect(bind).get_table_names())
    if "users" not in tables:
        from backend.app.database import Base
        from backend.app import models  # noqa: F401

        Base.metadata.create_all(bind=bind)
        return

    user_columns = {column["name"] for column in inspect(bind).get_columns("users")}
    additions = (
        ("learner_pin_hash", sa.Column("learner_pin_hash", sa.String(length=255), nullable=True)),
        ("learner_access_enabled", sa.Column("learner_access_enabled", sa.Boolean(), nullable=False, server_default=sa.false())),
        ("learner_session_version", sa.Column("learner_session_version", sa.Integer(), nullable=False, server_default="0")),
        ("pin_failed_attempts", sa.Column("pin_failed_attempts", sa.Integer(), nullable=False, server_default="0")),
        ("pin_locked_until", sa.Column("pin_locked_until", sa.DateTime(timezone=True), nullable=True)),
    )
    for name, column in additions:
        if name not in user_columns:
            op.add_column("users", column)

    tables = set(inspect(bind).get_table_names())
    if "learner_handoffs" not in tables:
        op.create_table(
            "learner_handoffs",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("challenge_hash", sa.String(length=64), nullable=False),
            sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id"), nullable=False),
            sa.Column("parent_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("failed_attempts", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_learner_handoffs_challenge_hash", "learner_handoffs", ["challenge_hash"], unique=True)
        op.create_index("ix_learner_handoffs_student_id", "learner_handoffs", ["student_id"])
        op.create_index("ix_learner_handoffs_parent_id", "learner_handoffs", ["parent_id"])
        op.create_index("ix_learner_handoffs_expires_at", "learner_handoffs", ["expires_at"])

    if "learner_sessions" not in tables:
        op.create_table(
            "learner_sessions",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("token_id", sa.String(length=64), nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id"), nullable=False),
            sa.Column("credential_version", sa.Integer(), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_learner_sessions_token_id", "learner_sessions", ["token_id"], unique=True)
        op.create_index("ix_learner_sessions_user_id", "learner_sessions", ["user_id"])
        op.create_index("ix_learner_sessions_student_id", "learner_sessions", ["student_id"])
        op.create_index("ix_learner_sessions_expires_at", "learner_sessions", ["expires_at"])


def downgrade() -> None:
    op.drop_table("learner_sessions")
    op.drop_table("learner_handoffs")
    with op.batch_alter_table("users") as batch:
        batch.drop_column("pin_locked_until")
        batch.drop_column("pin_failed_attempts")
        batch.drop_column("learner_session_version")
        batch.drop_column("learner_access_enabled")
        batch.drop_column("learner_pin_hash")
