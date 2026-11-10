"""Add answer submission, marking lifecycle, release, and audit fields."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "20261110_03"
down_revision = "20261109_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("assessment_attempts")}
    actor_reference = lambda name: sa.Column(  # noqa: E731 - keeps dialect-specific column construction local
        name,
        sa.Integer(),
        *(() if bind.dialect.name == "sqlite" else (sa.ForeignKey("users.id"),)),
        nullable=True,
    )
    additions = (
        ("submission_request_id", sa.Column("submission_request_id", sa.String(64), nullable=True)),
        ("submission_version", sa.Column("submission_version", sa.Integer(), nullable=False, server_default="0")),
        ("submitted_at", sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True)),
        ("marking_request_id", sa.Column("marking_request_id", sa.String(64), nullable=True)),
        ("marking_version", sa.Column("marking_version", sa.Integer(), nullable=False, server_default="0")),
        ("marking_requested_at", sa.Column("marking_requested_at", sa.DateTime(timezone=True), nullable=True)),
        ("marking_completed_at", sa.Column("marking_completed_at", sa.DateTime(timezone=True), nullable=True)),
        ("marking_error", sa.Column("marking_error", sa.String(240), nullable=True)),
        ("reviewed_at", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True)),
        ("reviewed_by_user_id", actor_reference("reviewed_by_user_id")),
        ("released_at", sa.Column("released_at", sa.DateTime(timezone=True), nullable=True)),
        ("released_by_user_id", actor_reference("released_by_user_id")),
    )
    for name, column in additions:
        if name not in columns:
            op.add_column("assessment_attempts", column)

    indexes = {index["name"] for index in inspect(bind).get_indexes("assessment_attempts")}
    if "ix_assessment_attempts_submission_request_id" not in indexes:
        op.create_index("ix_assessment_attempts_submission_request_id", "assessment_attempts", ["submission_request_id"], unique=True)
    if "ix_assessment_attempts_marking_request_id" not in indexes:
        op.create_index("ix_assessment_attempts_marking_request_id", "assessment_attempts", ["marking_request_id"], unique=True)

    if "assessment_audit_events" not in inspect(bind).get_table_names():
        op.create_table(
            "assessment_audit_events",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("assessment_attempts.id"), nullable=False),
            sa.Column("actor_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("actor_role", sa.String(20), nullable=False),
            sa.Column("event_type", sa.String(40), nullable=False),
            sa.Column("previous_status", sa.String(20), nullable=True),
            sa.Column("new_status", sa.String(20), nullable=False),
            sa.Column("version", sa.Integer(), nullable=True),
            sa.Column("metadata_json", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_assessment_audit_events_assessment_id", "assessment_audit_events", ["assessment_id"])
        op.create_index("ix_assessment_audit_events_actor_user_id", "assessment_audit_events", ["actor_user_id"])
        op.create_index("ix_assessment_audit_events_event_type", "assessment_audit_events", ["event_type"])


def downgrade() -> None:
    op.drop_table("assessment_audit_events")
    op.drop_index("ix_assessment_attempts_marking_request_id", table_name="assessment_attempts")
    op.drop_index("ix_assessment_attempts_submission_request_id", table_name="assessment_attempts")
    with op.batch_alter_table("assessment_attempts") as batch:
        for name in (
            "released_by_user_id", "released_at", "reviewed_by_user_id", "reviewed_at",
            "marking_error", "marking_completed_at", "marking_requested_at", "marking_version",
            "marking_request_id", "submitted_at", "submission_version", "submission_request_id",
        ):
            batch.drop_column(name)
