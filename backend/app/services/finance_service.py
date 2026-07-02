from datetime import date, datetime, timezone
from decimal import Decimal

from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import new_uuid
from app.models.finance import (
    BillingPeriod,
    FollowUpRecord,
    MaintenanceBill,
    MaintenanceBillingConfig,
    Payment,
    PaymentAllocation,
    Receipt,
)
from app.models.structure import Flat
from app.repositories.finance_repository import FinanceRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.finance import (
    BillCreate,
    BillingConfigCreate,
    BillingPeriodCreate,
    BillingPeriodUpdate,
    FollowUpCreate,
    FollowUpUpdate,
    PaymentCreate,
)


class FinanceService:
    VALID_BILL_TYPES = {"maintenance", "penalty", "special_levy"}
    VALID_BILL_STATUS = {"pending", "paid", "overdue", "waived", "cancelled"}
    VALID_PAYMENT_METHODS = {"cash", "cheque", "bank_transfer", "upi", "other"}
    VALID_FOLLOW_UP_STATUS = {"open", "promised", "escalated", "resolved"}

    def __init__(self, repo: FinanceRepository, structure_repo: StructureRepository):
        self.repo = repo
        self.structure_repo = structure_repo

    def _get_apartment(self, apartment_id: str):
        apt = self.structure_repo.get_apartment(apartment_id)
        if not apt:
            raise NotFoundError("Apartment not found")
        return apt

    def _get_flat(self, apartment_id: str, flat_id: str) -> Flat:
        flat = self.repo.get_flat(apartment_id, flat_id)
        if not flat:
            raise NotFoundError("Flat not found")
        return flat

    @staticmethod
    def _recompute_bill_status(bill: MaintenanceBill) -> None:
        if bill.status in {"waived", "cancelled"}:
            return
        if float(bill.paid_amount) >= float(bill.amount):
            bill.status = "paid"
        elif bill.due_date < date.today():
            bill.status = "overdue"
        else:
            bill.status = "pending"

    def get_current_billing_config(self, apartment_id: str) -> MaintenanceBillingConfig | None:
        self._get_apartment(apartment_id)
        return self.repo.get_current_billing_config(apartment_id)

    def create_billing_config(self, apartment_id: str, data: BillingConfigCreate) -> MaintenanceBillingConfig:
        self._get_apartment(apartment_id)
        current = self.repo.get_current_billing_config(apartment_id)
        if current and data.effective_from >= current.effective_from:
            current.effective_to = data.effective_from
            self.repo.update_billing_config(current)
        config = MaintenanceBillingConfig(
            id=new_uuid(),
            apartment_id=apartment_id,
            **data.model_dump(),
        )
        return self.repo.create_billing_config(config)

    def list_billing_periods(self, apartment_id: str) -> list[BillingPeriod]:
        self._get_apartment(apartment_id)
        return self.repo.list_billing_periods(apartment_id)

    def create_billing_period(self, apartment_id: str, data: BillingPeriodCreate) -> BillingPeriod:
        self._get_apartment(apartment_id)
        if self.repo.get_billing_period_by_key(apartment_id, data.period_key):
            raise ConflictError(f"Billing period {data.period_key} already exists")
        period = BillingPeriod(id=new_uuid(), apartment_id=apartment_id, **data.model_dump())
        return self.repo.create_billing_period(period)

    def update_billing_period(
        self, apartment_id: str, period_id: str, data: BillingPeriodUpdate
    ) -> BillingPeriod:
        period = self.repo.get_billing_period(apartment_id, period_id)
        if not period:
            raise NotFoundError("Billing period not found")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(period, key, value)
        return self.repo.update_billing_period(period)

    def list_bills(
        self,
        apartment_id: str,
        flat_id: str | None = None,
        period_id: str | None = None,
        status: str | None = None,
    ) -> list[MaintenanceBill]:
        self._get_apartment(apartment_id)
        if flat_id:
            self._get_flat(apartment_id, flat_id)
        bills = self.repo.list_bills(apartment_id, flat_id, period_id, status)
        for bill in bills:
            self._recompute_bill_status(bill)
        return bills

    def create_bill(self, apartment_id: str, flat_id: str, data: BillCreate) -> MaintenanceBill:
        if data.bill_type not in self.VALID_BILL_TYPES:
            raise ConflictError(f"Invalid bill_type: {data.bill_type}")
        flat = self._get_flat(apartment_id, flat_id)
        period = self.repo.get_billing_period(apartment_id, data.billing_period_id)
        if not period:
            raise NotFoundError("Billing period not found")

        bill = MaintenanceBill(
            id=new_uuid(),
            billing_period_id=data.billing_period_id,
            bill_type=data.bill_type,
            amount=data.amount,
            due_date=data.due_date,
            status="pending",
            paid_amount=0,
            generated_at=datetime.now(timezone.utc),
            period_label=period.label,
            notes=data.notes,
            **self.repo.flat_scope(flat),
        )
        bill = self.repo.create_bill(bill)
        self.repo.refresh_period_totals(period.id)
        return bill

    def record_payment(
        self,
        apartment_id: str,
        flat_id: str,
        data: PaymentCreate,
        recorded_by: str | None = None,
    ) -> Payment:
        if data.payment_method not in self.VALID_PAYMENT_METHODS:
            raise ConflictError(f"Invalid payment_method: {data.payment_method}")

        flat = self._get_flat(apartment_id, flat_id)
        bills_to_update: list[MaintenanceBill] = []
        allocations: list[PaymentAllocation] = []

        for item in data.allocations:
            bill = self.repo.get_bill(apartment_id, item.bill_id)
            if not bill or bill.flat_id != flat_id:
                raise NotFoundError(f"Bill not found: {item.bill_id}")
            if bill.status in {"paid", "waived", "cancelled"}:
                raise ConflictError(f"Bill {item.bill_id} cannot accept payment")
            remaining = float(bill.amount) - float(bill.paid_amount)
            if item.amount > remaining + 0.01:
                raise ConflictError(f"Allocation exceeds remaining balance on bill {item.bill_id}")
            allocations.append(
                PaymentAllocation(
                    id=new_uuid(),
                    maintenance_bill_id=bill.id,
                    amount=item.amount,
                )
            )
            bill.paid_amount = float(Decimal(str(bill.paid_amount)) + Decimal(str(item.amount)))
            self._recompute_bill_status(bill)
            bills_to_update.append(bill)

        payment = Payment(
            id=new_uuid(),
            amount=data.amount,
            payment_method=data.payment_method,
            payment_date=data.payment_date,
            reference_number=data.reference_number,
            notes=data.notes,
            recorded_by=recorded_by,
            status="confirmed",
            **self.repo.flat_scope(flat),
        )

        receipt = Receipt(
            id=new_uuid(),
            apartment_id=apartment_id,
            receipt_number=data.receipt_number or self._generate_receipt_number(apartment_id, flat, data.payment_date),
            issued_at=datetime.now(timezone.utc),
            issued_by=recorded_by,
        )

        payment = self.repo.create_payment(payment, allocations, receipt)

        for bill in bills_to_update:
            self.repo.update_bill(bill)
            self.repo.refresh_period_totals(bill.billing_period_id)

        return payment

    def _generate_receipt_number(self, apartment_id: str, flat: Flat, payment_date: date) -> str:
        count = len(self.repo.list_receipts(apartment_id)) + 1
        return f"SSA/{payment_date.year}/{payment_date.month:02d}/{flat.flat_number}/{count:03d}"

    def void_payment(self, apartment_id: str, payment_id: str) -> Payment:
        payment = self.repo.get_payment(apartment_id, payment_id)
        if not payment:
            raise NotFoundError("Payment not found")
        if payment.status == "voided":
            raise ConflictError("Payment already voided")

        for alloc in payment.allocations:
            bill = self.repo.get_bill(apartment_id, alloc.maintenance_bill_id)
            if bill:
                bill.paid_amount = max(0, float(bill.paid_amount) - float(alloc.amount))
                self._recompute_bill_status(bill)
                self.repo.update_bill(bill)
                self.repo.refresh_period_totals(bill.billing_period_id)

        payment.status = "voided"
        return self.repo.update_payment(payment)

    def list_payments(self, apartment_id: str, flat_id: str | None = None) -> list[Payment]:
        self._get_apartment(apartment_id)
        if flat_id:
            self._get_flat(apartment_id, flat_id)
        return self.repo.list_payments(apartment_id, flat_id)

    def get_payment(self, apartment_id: str, payment_id: str) -> Payment:
        payment = self.repo.get_payment(apartment_id, payment_id)
        if not payment:
            raise NotFoundError("Payment not found")
        return payment

    def list_receipts(self, apartment_id: str, flat_id: str | None = None) -> list[Receipt]:
        self._get_apartment(apartment_id)
        if flat_id:
            self._get_flat(apartment_id, flat_id)
        return self.repo.list_receipts(apartment_id, flat_id)

    def get_receipt(self, apartment_id: str, receipt_id: str) -> Receipt:
        receipt = self.repo.get_receipt(apartment_id, receipt_id)
        if not receipt:
            raise NotFoundError("Receipt not found")
        return receipt

    def get_flat_finance_summary(self, apartment_id: str, flat_id: str) -> dict:
        flat = self._get_flat(apartment_id, flat_id)
        bills = self.list_bills(apartment_id, flat_id=flat_id)
        payments = self.repo.list_payments(apartment_id, flat_id)
        receipts = self.repo.list_receipts(apartment_id, flat_id)

        outstanding = sum(
            float(b.amount) - float(b.paid_amount)
            for b in bills
            if b.status in {"pending", "overdue"}
        )
        overdue_count = sum(1 for b in bills if b.status == "overdue")
        pending_count = sum(1 for b in bills if b.status == "pending")
        last_payment = max((p.payment_date for p in payments if p.status == "confirmed"), default=None)

        return {
            "flat_id": flat.id,
            "flat_number": flat.flat_number,
            "total_outstanding": outstanding,
            "overdue_count": overdue_count,
            "pending_count": pending_count,
            "last_payment_date": last_payment,
            "bills": bills,
            "payments": payments,
            "receipts": receipts,
        }

    def list_follow_ups(self, apartment_id: str, flat_id: str | None = None) -> list[FollowUpRecord]:
        self._get_apartment(apartment_id)
        if flat_id:
            self._get_flat(apartment_id, flat_id)
        return self.repo.list_follow_ups(apartment_id, flat_id)

    def create_follow_up(self, apartment_id: str, data: FollowUpCreate) -> FollowUpRecord:
        flat = self._get_flat(apartment_id, data.flat_id)
        if data.status not in self.VALID_FOLLOW_UP_STATUS:
            raise ConflictError(f"Invalid status: {data.status}")
        payload = data.model_dump()
        flat_id = payload.pop("flat_id")
        record = FollowUpRecord(id=new_uuid(), **payload, **self.repo.flat_scope(flat))
        return self.repo.create_follow_up(record)

    def update_follow_up(
        self, apartment_id: str, follow_up_id: str, data: FollowUpUpdate
    ) -> FollowUpRecord:
        record = self.repo.get_follow_up(apartment_id, follow_up_id)
        if not record:
            raise NotFoundError("Follow-up not found")
        updates = data.model_dump(exclude_unset=True)
        if updates.get("status") == "resolved":
            record.resolved_at = datetime.now(timezone.utc)
        for key, value in updates.items():
            setattr(record, key, value)
        return self.repo.update_follow_up(record)
