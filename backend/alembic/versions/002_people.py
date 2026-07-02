"""B3: people — persons, profiles, staff, occupancy history

Revision ID: 002_people
Revises: 001_structure
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_people"
down_revision: Union[str, None] = "001_structure"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TS = sa.text("(CURRENT_TIMESTAMP)")


def upgrade() -> None:
    op.create_table(
        "persons",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("updated_by", sa.String(36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(36), nullable=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("alternate_phone", sa.String(20), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("user_id", sa.String(36), nullable=True),
    )
    op.create_index("ix_persons_apartment_id", "persons", ["apartment_id"])

    op.create_table(
        "owner_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("updated_by", sa.String(36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(36), nullable=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("block_id", sa.String(36), sa.ForeignKey("blocks.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("floor_id", sa.String(36), sa.ForeignKey("floors.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("person_id", sa.String(36), sa.ForeignKey("persons.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("is_primary", sa.Boolean(), nullable=False),
        sa.Column("ownership_start_date", sa.Date(), nullable=True),
        sa.Column("ownership_end_date", sa.Date(), nullable=True),
    )
    op.create_index("ix_owner_profiles_apartment_id", "owner_profiles", ["apartment_id"])
    op.create_index("ix_owner_profiles_flat_id", "owner_profiles", ["flat_id"])
    op.create_index("ix_owner_profiles_person_id", "owner_profiles", ["person_id"])

    op.create_table(
        "tenant_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("updated_by", sa.String(36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(36), nullable=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("block_id", sa.String(36), sa.ForeignKey("blocks.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("floor_id", sa.String(36), sa.ForeignKey("floors.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("person_id", sa.String(36), sa.ForeignKey("persons.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("lease_start_date", sa.Date(), nullable=True),
        sa.Column("lease_end_date", sa.Date(), nullable=True),
    )
    op.create_index("ix_tenant_profiles_apartment_id", "tenant_profiles", ["apartment_id"])
    op.create_index("ix_tenant_profiles_flat_id", "tenant_profiles", ["flat_id"])
    op.create_index("ix_tenant_profiles_person_id", "tenant_profiles", ["person_id"])

    op.create_table(
        "family_member_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("updated_by", sa.String(36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(36), nullable=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("block_id", sa.String(36), sa.ForeignKey("blocks.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("floor_id", sa.String(36), sa.ForeignKey("floors.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("person_id", sa.String(36), sa.ForeignKey("persons.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("relationship", sa.String(50), nullable=False),
        sa.Column("marriage_anniversary", sa.Date(), nullable=True),
        sa.Column("is_emergency_contact", sa.Boolean(), nullable=False),
    )
    op.create_index("ix_family_member_profiles_flat_id", "family_member_profiles", ["flat_id"])

    op.create_table(
        "staff_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("updated_by", sa.String(36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(36), nullable=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("person_id", sa.String(36), sa.ForeignKey("persons.id", ondelete="RESTRICT"), nullable=False, unique=True),
        sa.Column("role_code", sa.String(50), nullable=False),
        sa.Column("department", sa.String(100), nullable=True),
        sa.Column("joined_at", sa.Date(), nullable=True),
    )
    op.create_index("ix_staff_profiles_apartment_id", "staff_profiles", ["apartment_id"])

    op.create_table(
        "staff_block_scopes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("updated_by", sa.String(36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(36), nullable=True),
        sa.Column("staff_id", sa.String(36), sa.ForeignKey("staff_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("block_id", sa.String(36), sa.ForeignKey("blocks.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("staff_id", "block_id", name="uq_staff_block_scope"),
    )

    op.create_table(
        "occupancy_history",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column("updated_by", sa.String(36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(36), nullable=True),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("event_type", sa.String(20), nullable=False),
        sa.Column("person_type", sa.String(20), nullable=False),
        sa.Column("person_id", sa.String(36), sa.ForeignKey("persons.id"), nullable=False),
        sa.Column("profile_id", sa.String(36), nullable=False),
        sa.Column("person_name", sa.String(255), nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("recorded_by", sa.String(36), nullable=True),
    )
    op.create_index("ix_occupancy_history_flat_id", "occupancy_history", ["flat_id"])


def downgrade() -> None:
    op.drop_table("occupancy_history")
    op.drop_table("staff_block_scopes")
    op.drop_table("staff_profiles")
    op.drop_table("family_member_profiles")
    op.drop_table("tenant_profiles")
    op.drop_table("owner_profiles")
    op.drop_table("persons")
