from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class BillingConfigBase(BaseModel):
    maintenance_rate_per_sqft: float = Field(..., gt=0)
    default_flat_area_sqft: float | None = None
    billing_cycle_day: int = Field(1, ge=1, le=28)
    late_fee_percent: float = Field(0, ge=0)
    late_fee_grace_days: int = Field(0, ge=0)
    gst_applicable: bool = False
    gst_percent: float = Field(0, ge=0)
    effective_from: date
    effective_to: date | None = None
    approved_by: str | None = None
    notes: str | None = None


class BillingConfigCreate(BillingConfigBase):
    pass


class BillingConfigRead(BillingConfigBase, ORMModel):
    id: str
    apartment_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class BillingPeriodBase(BaseModel):
    period_key: str = Field(..., pattern=r"^\d{4}-\d{2}$")
    label: str
    due_date: date
    status: str = "open"


class BillingPeriodCreate(BillingPeriodBase):
    pass


class BillingPeriodUpdate(BaseModel):
    status: str | None = None
    due_date: date | None = None


class BillingPeriodRead(BillingPeriodBase, ORMModel):
    id: str
    apartment_id: str
    total_billed: float
    total_collected: float
    created_at: datetime
    updated_at: datetime


class BillBase(BaseModel):
    bill_type: str = "maintenance"
    amount: float = Field(..., gt=0)
    due_date: date
    notes: str | None = None


class BillCreate(BillBase):
    billing_period_id: str


class BillRead(BillBase, ORMModel):
    id: str
    apartment_id: str
    block_id: str
    floor_id: str
    flat_id: str
    billing_period_id: str
    period_label: str | None = None
    status: str
    paid_amount: float
    generated_at: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AllocationInput(BaseModel):
    bill_id: str
    amount: float = Field(..., gt=0)


class PaymentCreate(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = "cash"
    payment_date: date
    reference_number: str | None = None
    notes: str | None = None
    receipt_number: str | None = None
    allocations: list[AllocationInput]

    @model_validator(mode="after")
    def validate_allocations(self):
        if not self.allocations:
            raise ValueError("At least one bill allocation is required")
        total = sum(a.amount for a in self.allocations)
        if total > self.amount + 0.01:
            raise ValueError("Allocation total exceeds payment amount")
        return self


class AllocationRead(ORMModel):
    id: str
    payment_id: str
    maintenance_bill_id: str
    amount: float
    created_at: datetime


class PaymentRead(ORMModel):
    id: str
    apartment_id: str
    block_id: str
    floor_id: str
    flat_id: str
    amount: float
    payment_method: str
    payment_date: date
    reference_number: str | None
    notes: str | None
    status: str
    recorded_by: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    allocations: list[AllocationRead] = Field(default_factory=list)
    receipt: "ReceiptRead | None" = None


class ReceiptRead(ORMModel):
    id: str
    apartment_id: str
    payment_id: str
    receipt_number: str
    issued_at: datetime
    issued_by: str | None
    created_at: datetime


class FollowUpBase(BaseModel):
    amount_pending: float = Field(..., ge=0)
    days_overdue: int = Field(0, ge=0)
    status: str = "open"
    last_contact_at: datetime | None = None
    last_contact_method: str | None = None
    last_outcome: str | None = None
    next_follow_up_date: date | None = None
    assigned_to: str | None = None
    promise_date: date | None = None


class FollowUpCreate(FollowUpBase):
    flat_id: str


class FollowUpUpdate(BaseModel):
    amount_pending: float | None = None
    days_overdue: int | None = None
    status: str | None = None
    last_contact_at: datetime | None = None
    last_contact_method: str | None = None
    last_outcome: str | None = None
    next_follow_up_date: date | None = None
    assigned_to: str | None = None
    promise_date: date | None = None
    is_active: bool | None = None


class FollowUpRead(FollowUpBase, ORMModel):
    id: str
    apartment_id: str
    block_id: str
    floor_id: str
    flat_id: str
    resolved_at: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class FlatFinanceSummary(BaseModel):
    flat_id: str
    flat_number: str
    total_outstanding: float
    overdue_count: int
    pending_count: int
    last_payment_date: date | None
    bills: list[BillRead]
    payments: list[PaymentRead]
    receipts: list[ReceiptRead]
