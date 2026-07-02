"""B8: visitors — pre-approved guest entries

Revision ID: 007_visitors
Revises: 006_assets
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "007_visitors"
down_revision: Union[str, None] = "006_assets"
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
        "visitor_records",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("guest_name", sa.String(255), nullable=False),
        sa.Column("purpose", sa.String(500), nullable=True),
        sa.Column("expected_date", sa.Date(), nullable=False),
        sa.Column("expected_time", sa.Time(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("approved_by", sa.String(36), nullable=True),
    )
    op.create_index(
        "ix_visitor_records_apartment_date_status",
        "visitor_records",
        ["apartment_id", "expected_date", "status"],
    )


def downgrade() -> None:
    op.drop_table("visitor_records")
