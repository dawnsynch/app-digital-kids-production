"""Add idempotent learner practice lifecycle fields."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "20261109_02"
down_revision = "20261109_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    columns = {column["name"] for column in inspect(bind).get_columns("assessment_attempts")}
    if "request_id" not in columns:
        op.add_column("assessment_attempts", sa.Column("request_id", sa.String(length=64), nullable=True))
    if "status" not in columns:
        op.add_column(
            "assessment_attempts",
            sa.Column("status", sa.String(length=20), nullable=False, server_default="ready"),
        )
    indexes = {index["name"] for index in inspect(bind).get_indexes("assessment_attempts")}
    if "ix_assessment_attempts_request_id" not in indexes:
        op.create_index("ix_assessment_attempts_request_id", "assessment_attempts", ["request_id"], unique=True)
    if "ix_assessment_attempts_status" not in indexes:
        op.create_index("ix_assessment_attempts_status", "assessment_attempts", ["status"])


def downgrade() -> None:
    op.drop_index("ix_assessment_attempts_status", table_name="assessment_attempts")
    op.drop_index("ix_assessment_attempts_request_id", table_name="assessment_attempts")
    with op.batch_alter_table("assessment_attempts") as batch:
        batch.drop_column("status")
        batch.drop_column("request_id")
