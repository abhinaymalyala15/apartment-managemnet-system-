from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, BaseModelMixin
from app.models.people import FlatScopeMixin


class MaintenanceBillingConfig(Base, BaseModelMixin):
    __tablename__ = "maintenance_billing_configs"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    maintenance_rate_per_sqft: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    default_flat_area_sqft: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    billing_cycle_day: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    late_fee_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    late_fee_grace_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    gst_applicable: Mapped[bool] = mapped_column(default=False, nullable=False)
    gst_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class BillingPeriod(Base, BaseModelMixin):
    __tablename__ = "billing_periods"
    __table_args__ = (UniqueConstraint("apartment_id", "period_key", name="uq_billing_period_key"),)

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    period_key: Mapped[str] = mapped_column(String(7), nullable=False)
    label: Mapped[str] = mapped_column(String(50), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="open", nullable=False)
    total_billed: Mapped[float] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    total_collected: Mapped[float] = mapped_column(Numeric(14, 2), default=0, nullable=False)

    bills: Mapped[list["MaintenanceBill"]] = relationship(back_populates="billing_period")


class MaintenanceBill(Base, BaseModelMixin, FlatScopeMixin):
    __tablename__ = "maintenance_bills"
    __table_args__ = (
        UniqueConstraint("flat_id", "billing_period_id", "bill_type", name="uq_bill_flat_period_type"),
    )

    billing_period_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("billing_periods.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    bill_type: Mapped[str] = mapped_column(String(20), default="maintenance", nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    period_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    billing_period: Mapped["BillingPeriod"] = relationship(back_populates="bills")
    allocations: Mapped[list["PaymentAllocation"]] = relationship(back_populates="bill")
    flat: Mapped["Flat"] = relationship("Flat")


class Payment(Base, BaseModelMixin, FlatScopeMixin):
    __tablename__ = "payments"

    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), default="cash", nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    recorded_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="confirmed", nullable=False)

    allocations: Mapped[list["PaymentAllocation"]] = relationship(back_populates="payment")
    receipt: Mapped["Receipt | None"] = relationship(back_populates="payment")
    flat: Mapped["Flat"] = relationship("Flat")


class PaymentAllocation(Base, BaseModelMixin):
    __tablename__ = "payment_allocations"
    __table_args__ = (
        UniqueConstraint("payment_id", "maintenance_bill_id", name="uq_payment_bill_allocation"),
    )

    payment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    maintenance_bill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("maintenance_bills.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    payment: Mapped["Payment"] = relationship(back_populates="allocations")
    bill: Mapped["MaintenanceBill"] = relationship(back_populates="allocations")


class Receipt(Base, BaseModelMixin):
    __tablename__ = "receipts"
    __table_args__ = (
        UniqueConstraint("payment_id", name="uq_receipt_payment"),
        UniqueConstraint("apartment_id", "receipt_number", name="uq_receipt_number"),
    )

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    payment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("payments.id", ondelete="RESTRICT"), nullable=False, unique=True
    )
    receipt_number: Mapped[str] = mapped_column(String(30), nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    issued_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    pdf_storage_key: Mapped[str | None] = mapped_column(String(500), nullable=True)

    payment: Mapped["Payment"] = relationship(back_populates="receipt")


class FollowUpRecord(Base, BaseModelMixin, FlatScopeMixin):
    __tablename__ = "follow_up_records"

    amount_pending: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    days_overdue: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="open", nullable=False)
    last_contact_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_contact_method: Mapped[str | None] = mapped_column(String(20), nullable=True)
    last_outcome: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_follow_up_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    promise_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    flat: Mapped["Flat"] = relationship("Flat")


from app.models.structure import Flat  # noqa: E402
