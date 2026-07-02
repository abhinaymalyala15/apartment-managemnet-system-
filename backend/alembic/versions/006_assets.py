"""B7: assets — vendors, community assets, AMC, services

Revision ID: 006_assets
Revises: 005_communication
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006_assets"
down_revision: Union[str, None] = "005_communication"
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
        "facility_vendors",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("contact_person", sa.String(255), nullable=True),
    )

    op.create_table(
        "community_assets",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("block_id", sa.String(36), sa.ForeignKey("blocks.id", ondelete="SET NULL"), nullable=True),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("asset_type", sa.String(30), nullable=False),
        sa.Column("scope", sa.String(20), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("primary_vendor_id", sa.String(36), sa.ForeignKey("facility_vendors.id", ondelete="SET NULL"), nullable=True),
        sa.Column("installation_date", sa.Date(), nullable=True),
        sa.Column("warranty_expiry", sa.Date(), nullable=True),
        sa.Column("last_service_date", sa.Date(), nullable=True),
        sa.Column("next_service_date", sa.Date(), nullable=True),
        sa.Column("amc_expiry_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(30), nullable=False),
    )
    op.create_index("ix_community_assets_apartment_status", "community_assets", ["apartment_id", "status"])

    op.create_table(
        "asset_vendor_links",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("asset_id", sa.String(36), sa.ForeignKey("community_assets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("vendor_id", sa.String(36), sa.ForeignKey("facility_vendors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("link_type", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.UniqueConstraint("asset_id", "vendor_id", "link_type", name="uq_asset_vendor_link"),
    )

    op.create_table(
        "asset_amc_records",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("asset_id", sa.String(36), sa.ForeignKey("community_assets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("vendor_id", sa.String(36), sa.ForeignKey("facility_vendors.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("renewal_reminder_days", sa.Integer(), nullable=False),
        sa.Column("contact_person", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("is_current", sa.Boolean(), nullable=False),
    )

    op.create_table(
        "asset_service_records",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("asset_id", sa.String(36), sa.ForeignKey("community_assets.id", ondelete="SET NULL"), nullable=True),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="SET NULL"), nullable=True),
        sa.Column("scope", sa.String(20), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("service_type", sa.String(100), nullable=False),
        sa.Column("scheduled_date", sa.Date(), nullable=False),
        sa.Column("scheduled_time", sa.String(50), nullable=True),
        sa.Column("completed_date", sa.Date(), nullable=True),
        sa.Column("vendor_id", sa.String(36), sa.ForeignKey("facility_vendors.id", ondelete="SET NULL"), nullable=True),
        sa.Column("technician", sa.String(255), nullable=True),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("frequency", sa.String(50), nullable=True),
        sa.Column("next_due_date", sa.Date(), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
    )

    op.create_table(
        "service_schedules",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("service_type", sa.String(100), nullable=False),
        sa.Column("scheduled_date", sa.Date(), nullable=False),
        sa.Column("scheduled_time", sa.String(50), nullable=True),
        sa.Column("vendor_name", sa.String(255), nullable=True),
        sa.Column("vendor_id", sa.String(36), sa.ForeignKey("facility_vendors.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("last_service_date", sa.Date(), nullable=True),
        sa.Column("next_due_date", sa.Date(), nullable=True),
        sa.Column("frequency", sa.String(50), nullable=True),
    )

    op.create_table(
        "asset_internal_notes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("asset_id", sa.String(36), sa.ForeignKey("community_assets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("author_user_id", sa.String(36), nullable=True),
        sa.Column("author_name", sa.String(255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("asset_internal_notes")
    op.drop_table("service_schedules")
    op.drop_table("asset_service_records")
    op.drop_table("asset_amc_records")
    op.drop_table("asset_vendor_links")
    op.drop_table("community_assets")
    op.drop_table("facility_vendors")
