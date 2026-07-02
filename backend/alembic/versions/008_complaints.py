"""B9: complaints — resident requests

Revision ID: 008_complaints
Revises: 007_visitors
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "008_complaints"
down_revision: Union[str, None] = "007_visitors"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TS = sa.text("(CURRENT_TIMESTAMP)")
BASE = [
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
    sa.Column("created_by", sa.String(36), nullable=True),
    sa.Column("updated_by", sa.String(36), nullable=True),
    sa.Column("is_active", sa.Boolean(), nullable=False),
    sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    sa.Column("deleted_by", sa.String(36), nullable=True),
]


def upgrade() -> None:
    op.create_table(
        "resident_requests",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("priority", sa.String(10), nullable=False),
        sa.Column("assigned_to", sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_resident_requests_apartment_status",
        "resident_requests",
        ["apartment_id", "status", "created_at"],
    )


def downgrade() -> None:
    op.drop_table("resident_requests")
