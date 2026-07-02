"""B10: reports & settings — documents, audit, preferences, contacts

Revision ID: 009_settings
Revises: 008_complaints
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "009_settings"
down_revision: Union[str, None] = "008_complaints"
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
        "documents",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("entity_type", sa.String(30), nullable=False),
        sa.Column("entity_id", sa.String(36), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("file_label", sa.String(255), nullable=False),
        sa.Column("storage_key", sa.String(500), nullable=True),
        sa.Column("mime_type", sa.String(100), nullable=True),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("uploaded_by", sa.String(36), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "flat_internal_notes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("author_user_id", sa.String(36), nullable=True),
        sa.Column("author_name", sa.String(255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="SET NULL"), nullable=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.String(36), nullable=True),
        sa.Column("old_values", sa.Text(), nullable=True),
        sa.Column("new_values", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("request_id", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
    )

    op.create_table(
        "system_preferences",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("timezone", sa.String(50), nullable=False),
        sa.Column("date_format", sa.String(20), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("locale", sa.String(10), nullable=False),
        sa.Column("fiscal_year_start_month", sa.Integer(), nullable=False),
        sa.Column("default_notice_channel", sa.String(20), nullable=False),
        sa.Column("auto_archive_notices_days", sa.Integer(), nullable=False),
        sa.UniqueConstraint("apartment_id", name="uq_system_preferences_apartment"),
    )

    op.create_table(
        "committee_members",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("role", sa.String(100), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
    )

    op.create_table(
        "emergency_contacts",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("hours", sa.String(100), nullable=True),
        sa.Column("role", sa.String(100), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
    )

    op.create_table(
        "office_contacts",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("hours", sa.String(100), nullable=True),
        sa.UniqueConstraint("apartment_id", name="uq_office_contacts_apartment"),
    )

    op.create_table(
        "integration_settings",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("integration_code", sa.String(50), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("config_json", sa.Text(), nullable=True),
        sa.Column("phase", sa.String(50), nullable=True),
        sa.UniqueConstraint("apartment_id", "integration_code", name="uq_integration_code"),
    )

    op.create_table(
        "gallery_images",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("gallery_images")
    op.drop_table("integration_settings")
    op.drop_table("office_contacts")
    op.drop_table("emergency_contacts")
    op.drop_table("committee_members")
    op.drop_table("system_preferences")
    op.drop_table("audit_logs")
    op.drop_table("flat_internal_notes")
    op.drop_table("documents")
