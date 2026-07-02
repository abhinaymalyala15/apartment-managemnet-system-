"""B5: finance — bills, payments, receipts, follow-ups

Revision ID: 004_finance
Revises: 003_auth
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004_finance"
down_revision: Union[str, None] = "003_auth"
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
FLAT_SCOPE = [
    sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
    sa.Column("block_id", sa.String(36), sa.ForeignKey("blocks.id", ondelete="RESTRICT"), nullable=False),
    sa.Column("floor_id", sa.String(36), sa.ForeignKey("floors.id", ondelete="RESTRICT"), nullable=False),
    sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False),
]


def upgrade() -> None:
    op.create_table(
        "maintenance_billing_configs",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("maintenance_rate_per_sqft", sa.Numeric(10, 4), nullable=False),
        sa.Column("default_flat_area_sqft", sa.Numeric(10, 2), nullable=True),
        sa.Column("billing_cycle_day", sa.Integer(), nullable=False),
        sa.Column("late_fee_percent", sa.Numeric(5, 2), nullable=False),
        sa.Column("late_fee_grace_days", sa.Integer(), nullable=False),
        sa.Column("gst_applicable", sa.Boolean(), nullable=False),
        sa.Column("gst_percent", sa.Numeric(5, 2), nullable=False),
        sa.Column("effective_from", sa.Date(), nullable=False),
        sa.Column("effective_to", sa.Date(), nullable=True),
        sa.Column("approved_by", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )

    op.create_table(
        "billing_periods",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("period_key", sa.String(7), nullable=False),
        sa.Column("label", sa.String(50), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("total_billed", sa.Numeric(14, 2), nullable=False),
        sa.Column("total_collected", sa.Numeric(14, 2), nullable=False),
        sa.UniqueConstraint("apartment_id", "period_key", name="uq_billing_period_key"),
    )

    op.create_table(
        "maintenance_bills",
        *BASE,
        *FLAT_SCOPE,
        sa.Column("billing_period_id", sa.String(36), sa.ForeignKey("billing_periods.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("bill_type", sa.String(20), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("paid_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("period_label", sa.String(50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.UniqueConstraint("flat_id", "billing_period_id", "bill_type", name="uq_bill_flat_period_type"),
    )
    op.create_index("ix_maintenance_bills_apartment_status", "maintenance_bills", ["apartment_id", "status"])

    op.create_table(
        "payments",
        *BASE,
        *FLAT_SCOPE,
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_method", sa.String(30), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("reference_number", sa.String(100), nullable=True),
        sa.Column("recorded_by", sa.String(36), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False),
    )

    op.create_table(
        "payment_allocations",
        *BASE,
        sa.Column("payment_id", sa.String(36), sa.ForeignKey("payments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("maintenance_bill_id", sa.String(36), sa.ForeignKey("maintenance_bills.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.UniqueConstraint("payment_id", "maintenance_bill_id", name="uq_payment_bill_allocation"),
    )

    op.create_table(
        "receipts",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("payment_id", sa.String(36), sa.ForeignKey("payments.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("receipt_number", sa.String(30), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("issued_by", sa.String(36), nullable=True),
        sa.Column("pdf_storage_key", sa.String(500), nullable=True),
        sa.UniqueConstraint("payment_id", name="uq_receipt_payment"),
        sa.UniqueConstraint("apartment_id", "receipt_number", name="uq_receipt_number"),
    )

    op.create_table(
        "follow_up_records",
        *BASE,
        *FLAT_SCOPE,
        sa.Column("amount_pending", sa.Numeric(12, 2), nullable=False),
        sa.Column("days_overdue", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("last_contact_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_contact_method", sa.String(20), nullable=True),
        sa.Column("last_outcome", sa.Text(), nullable=True),
        sa.Column("next_follow_up_date", sa.Date(), nullable=True),
        sa.Column("assigned_to", sa.String(255), nullable=True),
        sa.Column("promise_date", sa.Date(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("follow_up_records")
    op.drop_table("receipts")
    op.drop_table("payment_allocations")
    op.drop_table("payments")
    op.drop_table("maintenance_bills")
    op.drop_table("billing_periods")
    op.drop_table("maintenance_billing_configs")
