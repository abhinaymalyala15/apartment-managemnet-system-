from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

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


def _active(model):
    return model.deleted_at.is_(None)


class FinanceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_flat(self, apartment_id: str, flat_id: str) -> Flat | None:
        return self.db.scalar(
            select(Flat).where(
                Flat.id == flat_id,
                Flat.apartment_id == apartment_id,
                _active(Flat),
            )
        )

    @staticmethod
    def flat_scope(flat: Flat) -> dict[str, str]:
        return {
            "apartment_id": flat.apartment_id,
            "block_id": flat.block_id,
            "floor_id": flat.floor_id,
            "flat_id": flat.id,
        }

    # --- Billing config ---

    def get_current_billing_config(self, apartment_id: str) -> MaintenanceBillingConfig | None:
        return self.db.scalar(
            select(MaintenanceBillingConfig)
            .where(
                MaintenanceBillingConfig.apartment_id == apartment_id,
                MaintenanceBillingConfig.effective_to.is_(None),
                _active(MaintenanceBillingConfig),
            )
            .order_by(MaintenanceBillingConfig.effective_from.desc())
        )

    def create_billing_config(self, config: MaintenanceBillingConfig) -> MaintenanceBillingConfig:
        self.db.add(config)
        self.db.commit()
        self.db.refresh(config)
        return config

    def update_billing_config(self, config: MaintenanceBillingConfig) -> MaintenanceBillingConfig:
        self.db.commit()
        self.db.refresh(config)
        return config

    # --- Billing periods ---

    def list_billing_periods(self, apartment_id: str) -> list[BillingPeriod]:
        return list(
            self.db.scalars(
                select(BillingPeriod)
                .where(BillingPeriod.apartment_id == apartment_id, _active(BillingPeriod))
                .order_by(BillingPeriod.period_key.desc())
            ).all()
        )

    def get_billing_period(self, apartment_id: str, period_id: str) -> BillingPeriod | None:
        return self.db.scalar(
            select(BillingPeriod).where(
                BillingPeriod.id == period_id,
                BillingPeriod.apartment_id == apartment_id,
                _active(BillingPeriod),
            )
        )

    def get_billing_period_by_key(self, apartment_id: str, period_key: str) -> BillingPeriod | None:
        return self.db.scalar(
            select(BillingPeriod).where(
                BillingPeriod.apartment_id == apartment_id,
                BillingPeriod.period_key == period_key,
                _active(BillingPeriod),
            )
        )

    def create_billing_period(self, period: BillingPeriod) -> BillingPeriod:
        self.db.add(period)
        self.db.commit()
        self.db.refresh(period)
        return period

    def update_billing_period(self, period: BillingPeriod) -> BillingPeriod:
        self.db.commit()
        self.db.refresh(period)
        return period

    # --- Bills ---

    def list_bills(
        self,
        apartment_id: str,
        flat_id: str | None = None,
        period_id: str | None = None,
        status: str | None = None,
    ) -> list[MaintenanceBill]:
        stmt = select(MaintenanceBill).where(
            MaintenanceBill.apartment_id == apartment_id, _active(MaintenanceBill)
        )
        if flat_id:
            stmt = stmt.where(MaintenanceBill.flat_id == flat_id)
        if period_id:
            stmt = stmt.where(MaintenanceBill.billing_period_id == period_id)
        if status:
            stmt = stmt.where(MaintenanceBill.status == status)
        return list(self.db.scalars(stmt.order_by(MaintenanceBill.due_date.desc())).all())

    def get_bill(self, apartment_id: str, bill_id: str) -> MaintenanceBill | None:
        return self.db.scalar(
            select(MaintenanceBill).where(
                MaintenanceBill.id == bill_id,
                MaintenanceBill.apartment_id == apartment_id,
                _active(MaintenanceBill),
            )
        )

    def create_bill(self, bill: MaintenanceBill) -> MaintenanceBill:
        self.db.add(bill)
        self.db.commit()
        self.db.refresh(bill)
        return bill

    def update_bill(self, bill: MaintenanceBill) -> MaintenanceBill:
        self.db.commit()
        self.db.refresh(bill)
        return bill

    # --- Payments ---

    def list_payments(self, apartment_id: str, flat_id: str | None = None) -> list[Payment]:
        stmt = (
            select(Payment)
            .options(
                joinedload(Payment.allocations),
                joinedload(Payment.receipt),
            )
            .where(Payment.apartment_id == apartment_id, _active(Payment))
        )
        if flat_id:
            stmt = stmt.where(Payment.flat_id == flat_id)
        return list(self.db.scalars(stmt.order_by(Payment.payment_date.desc())).unique().all())

    def get_payment(self, apartment_id: str, payment_id: str) -> Payment | None:
        return self.db.execute(
            select(Payment)
            .options(joinedload(Payment.allocations), joinedload(Payment.receipt))
            .where(
                Payment.id == payment_id,
                Payment.apartment_id == apartment_id,
                _active(Payment),
            )
        ).unique().scalar_one_or_none()

    def create_payment(self, payment: Payment, allocations: list[PaymentAllocation], receipt: Receipt | None) -> Payment:
        self.db.add(payment)
        self.db.flush()
        for alloc in allocations:
            alloc.payment_id = payment.id
            self.db.add(alloc)
        if receipt:
            receipt.payment_id = payment.id
            self.db.add(receipt)
        self.db.commit()
        return self.get_payment(payment.apartment_id, payment.id)  # type: ignore[return-value]

    def update_payment(self, payment: Payment) -> Payment:
        self.db.commit()
        self.db.refresh(payment)
        return payment

    # --- Receipts ---

    def list_receipts(self, apartment_id: str, flat_id: str | None = None) -> list[Receipt]:
        stmt = (
            select(Receipt)
            .join(Payment, Receipt.payment_id == Payment.id)
            .where(Receipt.apartment_id == apartment_id, _active(Receipt), _active(Payment))
        )
        if flat_id:
            stmt = stmt.where(Payment.flat_id == flat_id)
        return list(self.db.scalars(stmt.order_by(Receipt.issued_at.desc())).all())

    def get_receipt(self, apartment_id: str, receipt_id: str) -> Receipt | None:
        return self.db.scalar(
            select(Receipt).where(
                Receipt.id == receipt_id,
                Receipt.apartment_id == apartment_id,
                _active(Receipt),
            )
        )

    # --- Follow-ups ---

    def list_follow_ups(self, apartment_id: str, flat_id: str | None = None) -> list[FollowUpRecord]:
        stmt = select(FollowUpRecord).where(
            FollowUpRecord.apartment_id == apartment_id, _active(FollowUpRecord)
        )
        if flat_id:
            stmt = stmt.where(FollowUpRecord.flat_id == flat_id)
        return list(self.db.scalars(stmt.order_by(FollowUpRecord.next_follow_up_date)).all())

    def get_follow_up(self, apartment_id: str, follow_up_id: str) -> FollowUpRecord | None:
        return self.db.scalar(
            select(FollowUpRecord).where(
                FollowUpRecord.id == follow_up_id,
                FollowUpRecord.apartment_id == apartment_id,
                _active(FollowUpRecord),
            )
        )

    def create_follow_up(self, record: FollowUpRecord) -> FollowUpRecord:
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def update_follow_up(self, record: FollowUpRecord) -> FollowUpRecord:
        self.db.commit()
        self.db.refresh(record)
        return record

    def refresh_period_totals(self, period_id: str) -> None:
        period = self.db.get(BillingPeriod, period_id)
        if not period:
            return
        bills = self.list_bills(period.apartment_id, period_id=period_id)
        period.total_billed = float(sum(Decimal(str(b.amount)) for b in bills))
        period.total_collected = float(sum(Decimal(str(b.paid_amount)) for b in bills))
        self.db.commit()
