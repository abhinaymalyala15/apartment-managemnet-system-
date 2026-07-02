"""B6: communication — notices, notifications, timeline

Revision ID: 005_communication
Revises: 004_finance
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "005_communication"
down_revision: Union[str, None] = "004_finance"
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
        "notices",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("priority", sa.String(10), nullable=False),
        sa.Column("audience", sa.String(20), nullable=False),
        sa.Column("lifecycle_status", sa.String(20), nullable=False),
        sa.Column("is_emergency", sa.Boolean(), nullable=False),
        sa.Column("author_user_id", sa.String(36), nullable=True),
        sa.Column("author_name", sa.String(255), nullable=True),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_by", sa.String(36), nullable=True),
        sa.Column("last_edited_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
    )
    op.create_index(
        "ix_notices_apartment_lifecycle",
        "notices",
        ["apartment_id", "lifecycle_status", "published_at"],
    )

    op.create_table(
        "notice_block_targets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("notice_id", sa.String(36), sa.ForeignKey("notices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("block_id", sa.String(36), sa.ForeignKey("blocks.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.UniqueConstraint("notice_id", "block_id", name="uq_notice_block_target"),
    )

    op.create_table(
        "notice_history_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("notice_id", sa.String(36), sa.ForeignKey("notices.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("notice_title", sa.String(500), nullable=False),
        sa.Column("action", sa.String(30), nullable=False),
        sa.Column("actor_user_id", sa.String(36), nullable=True),
        sa.Column("actor_name", sa.String(255), nullable=False),
        sa.Column("detail", sa.Text(), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "notifications",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="SET NULL"), nullable=True),
        sa.Column("source_type", sa.String(30), nullable=False),
        sa.Column("source_id", sa.String(36), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("priority", sa.String(10), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_notifications_user_unread", "notifications", ["apartment_id", "user_id", "read_at"])

    op.create_table(
        "timeline_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("entity_type", sa.String(30), nullable=False),
        sa.Column("entity_id", sa.String(36), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="SET NULL"), nullable=True),
        sa.Column("asset_id", sa.String(36), nullable=True),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("event_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source_table", sa.String(50), nullable=True),
        sa.Column("source_id", sa.String(36), nullable=True),
        sa.Column("href", sa.String(500), nullable=True),
        sa.Column("actor_user_id", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
    )
    op.create_index("ix_timeline_apartment_date", "timeline_events", ["apartment_id", "event_date"])
    op.create_index("ix_timeline_flat_date", "timeline_events", ["apartment_id", "flat_id", "event_date"])


def downgrade() -> None:
    op.drop_table("timeline_events")
    op.drop_table("notifications")
    op.drop_table("notice_history_events")
    op.drop_table("notice_block_targets")
    op.drop_table("notices")
