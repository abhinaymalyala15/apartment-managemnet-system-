"""Seed B5 finance from demo JSON."""

from __future__ import annotations

import json
import sys
from calendar import month_name
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from sqlalchemy import select  # noqa: E402

from app.db.base import new_uuid  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.finance import (  # noqa: E402
    BillingPeriod,
    FollowUpRecord,
    MaintenanceBill,
    MaintenanceBillingConfig,
    Payment,
    PaymentAllocation,
    Receipt,
)
from app.models.structure import Apartment, Flat  # noqa: E402
from app.repositories.finance_repository import FinanceRepository  # noqa: E402

DATA = ROOT / "src" / "data"
MONTH_MAP = {name: i for i, name in enumerate(month_name) if name}


def load_json(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def parse_date(value: str) -> date:
    return date.fromisoformat(value)


def period_key_from_label(label: str) -> str:
    parts = label.strip().split()
    if len(parts) != 2:
        raise ValueError(f"Bad period label: {label}")
    month_name_str, year_str = parts[0], parts[1]
    month = MONTH_MAP.get(month_name_str)
    if not month:
        raise ValueError(f"Unknown month: {month_name_str}")
    return f"{year_str}-{month:02d}"


def flat_scope(flat: Flat) -> dict[str, str]:
    return {
        "apartment_id": flat.apartment_id,
        "block_id": flat.block_id,
        "floor_id": flat.floor_id,
        "flat_id": flat.id,
    }


def seed() -> None:
    db = SessionLocal()
    repo = FinanceRepository(db)

    apartment = db.scalar(
        select(Apartment).where(Apartment.slug == "sylvan-shelter-apartment")
    )
    if not apartment:
        print("Run seed_structure.py first.")
        db.close()
        return

    if db.scalar(select(MaintenanceBill).limit(1)):
        print("Finance already seeded — skipping.")
        db.close()
        return

    flats = db.scalars(select(Flat).where(Flat.apartment_id == apartment.id)).all()
    flat_by_legacy = {f"flat-{f.flat_number}": f for f in flats}

    config_data = load_json("maintenance-config.json")
    db.add(
        MaintenanceBillingConfig(
            id=new_uuid(),
            apartment_id=apartment.id,
            maintenance_rate_per_sqft=config_data["maintenanceRatePerSqft"],
            default_flat_area_sqft=config_data.get("defaultFlatAreaSqft"),
            billing_cycle_day=config_data.get("billingCycleDay", 1),
            late_fee_percent=config_data.get("lateFeePercent", 0),
            late_fee_grace_days=config_data.get("lateFeeGraceDays", 0),
            gst_applicable=config_data.get("gstApplicable", False),
            gst_percent=config_data.get("gstPercent", 0),
            effective_from=parse_date(config_data["effectiveFrom"]),
            approved_by=config_data.get("approvedBy"),
            notes=config_data.get("notes"),
        )
    )
    db.commit()

    payments_data = load_json("payments.json")
    period_cache: dict[str, BillingPeriod] = {}

    bill_count = 0
    payment_count = 0

    for row in payments_data:
        flat = flat_by_legacy.get(row["flatId"])
        if not flat:
            continue

        label = row["period"]
        pkey = period_key_from_label(label)
        if pkey not in period_cache:
            period = BillingPeriod(
                id=new_uuid(),
                apartment_id=apartment.id,
                period_key=pkey,
                label=label,
                due_date=parse_date(row["dueDate"]),
                status="open",
                total_billed=0,
                total_collected=0,
            )
            db.add(period)
            db.flush()
            period_cache[pkey] = period
        period = period_cache[pkey]

        bill_status = row["status"]
        if bill_status == "paid":
            db_status = "paid"
            paid_amount = row["amount"]
        elif bill_status == "overdue":
            db_status = "overdue"
            paid_amount = 0
        else:
            db_status = "pending"
            paid_amount = 0

        bill = MaintenanceBill(
            id=new_uuid(),
            billing_period_id=period.id,
            bill_type=row.get("type", "maintenance"),
            amount=row["amount"],
            due_date=parse_date(row["dueDate"]),
            status=db_status,
            paid_amount=paid_amount,
            generated_at=datetime.now(timezone.utc),
            period_label=label,
            **flat_scope(flat),
        )
        db.add(bill)
        db.flush()
        bill_count += 1

        if row["status"] == "paid" and row.get("paidDate"):
            payment = Payment(
                id=new_uuid(),
                amount=row["amount"],
                payment_method="cash",
                payment_date=parse_date(row["paidDate"]),
                status="confirmed",
                **flat_scope(flat),
            )
            db.add(payment)
            db.flush()
            db.add(
                PaymentAllocation(
                    id=new_uuid(),
                    payment_id=payment.id,
                    maintenance_bill_id=bill.id,
                    amount=row["amount"],
                )
            )
            db.add(
                Receipt(
                    id=new_uuid(),
                    apartment_id=apartment.id,
                    payment_id=payment.id,
                    receipt_number=row.get("receiptNumber", f"SSA/SEED/{bill.id[:8]}"),
                    issued_at=datetime.now(timezone.utc),
                )
            )
            payment_count += 1

    for period in period_cache.values():
        repo.refresh_period_totals(period.id)

    follow_ups = load_json("follow-ups.json")
    for row in follow_ups:
        flat = flat_by_legacy.get(row["flatId"])
        if not flat:
            continue
        db.add(
            FollowUpRecord(
                id=new_uuid(),
                amount_pending=row["amountPending"],
                days_overdue=row["daysOverdue"],
                status=row["status"],
                last_contact_at=datetime.fromisoformat(row["lastContactAt"]),
                last_contact_method=row.get("lastContactMethod"),
                last_outcome=row.get("lastOutcome"),
                next_follow_up_date=parse_date(row["nextFollowUpDate"]),
                assigned_to=row.get("assignedTo"),
                **flat_scope(flat),
            )
        )

    db.commit()
    print(
        f"Seeded finance: {len(period_cache)} periods, {bill_count} bills, "
        f"{payment_count} payments/receipts, {len(follow_ups)} follow-ups."
    )
    db.close()


if __name__ == "__main__":
    seed()
