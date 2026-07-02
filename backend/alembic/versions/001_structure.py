"""B2: apartment structure tables

Revision ID: 001_structure
Revises:
Create Date: 2026-07-02
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_structure"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "apartments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("created_by", sa.String(length=36), nullable=True),
        sa.Column("updated_by", sa.String(length=36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(length=36), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("tagline", sa.String(length=500), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("state", sa.String(length=100), nullable=True),
        sa.Column("pincode", sa.String(length=10), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("registration_number", sa.String(length=100), nullable=True),
        sa.Column("year_established", sa.Integer(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_apartments_slug", "apartments", ["slug"])

    op.create_table(
        "blocks",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("created_by", sa.String(length=36), nullable=True),
        sa.Column("updated_by", sa.String(length=36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(length=36), nullable=True),
        sa.Column("apartment_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("floor_count", sa.Integer(), nullable=False),
        sa.Column("total_flats", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["apartment_id"], ["apartments.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("apartment_id", "code", name="uq_blocks_apartment_code"),
    )
    op.create_index("ix_blocks_apartment_id", "blocks", ["apartment_id"])

    op.create_table(
        "floors",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("created_by", sa.String(length=36), nullable=True),
        sa.Column("updated_by", sa.String(length=36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(length=36), nullable=True),
        sa.Column("apartment_id", sa.String(length=36), nullable=False),
        sa.Column("block_id", sa.String(length=36), nullable=False),
        sa.Column("floor_number", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=50), nullable=True),
        sa.Column("flat_count", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["apartment_id"], ["apartments.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["block_id"], ["blocks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("block_id", "floor_number", name="uq_floors_block_number"),
    )
    op.create_index("ix_floors_apartment_id", "floors", ["apartment_id"])
    op.create_index("ix_floors_block_id", "floors", ["block_id"])

    op.create_table(
        "flats",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("created_by", sa.String(length=36), nullable=True),
        sa.Column("updated_by", sa.String(length=36), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deleted_by", sa.String(length=36), nullable=True),
        sa.Column("apartment_id", sa.String(length=36), nullable=False),
        sa.Column("block_id", sa.String(length=36), nullable=False),
        sa.Column("floor_id", sa.String(length=36), nullable=False),
        sa.Column("flat_number", sa.String(length=20), nullable=False),
        sa.Column("floor", sa.Integer(), nullable=False),
        sa.Column("area_sqft", sa.Numeric(10, 2), nullable=True),
        sa.Column("bedrooms", sa.Integer(), nullable=True),
        sa.Column("flat_type", sa.String(length=50), nullable=True),
        sa.Column("parking_slots", sa.Integer(), nullable=True),
        sa.Column("occupancy_status", sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(["apartment_id"], ["apartments.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["block_id"], ["blocks.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["floor_id"], ["floors.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("apartment_id", "block_id", "flat_number", name="uq_flats_block_number"),
    )
    op.create_index("ix_flats_apartment_id", "flats", ["apartment_id"])
    op.create_index("ix_flats_block_id", "flats", ["block_id"])
    op.create_index("ix_flats_floor_id", "flats", ["floor_id"])
    op.create_index("ix_flats_apartment_block_floor", "flats", ["apartment_id", "block_id", "floor_id"])


def downgrade() -> None:
    op.drop_table("flats")
    op.drop_table("floors")
    op.drop_table("blocks")
    op.drop_table("apartments")
