"""Seed B8 visitors from demo JSON."""

from __future__ import annotations

import json
import sys
from datetime import date, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from sqlalchemy import select  # noqa: E402

from app.db.base import new_uuid  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.structure import Apartment, Flat  # noqa: E402
from app.models.visitors import VisitorRecord  # noqa: E402

DATA = ROOT / "src" / "data"


def load_json(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def parse_time(value: str | None) -> time | None:
    if not value:
        return None
    parts = value.split(":")
    return time(int(parts[0]), int(parts[1]))


def seed() -> None:
    db = SessionLocal()

    apartment = db.scalar(
        select(Apartment).where(Apartment.slug == "sylvan-shelter-apartment")
    )
    if not apartment:
        print("Run seed_structure.py first.")
        db.close()
        return

    if db.scalar(select(VisitorRecord).limit(1)):
        print("Visitors already seeded — skipping.")
        db.close()
        return

    flats = db.scalars(select(Flat).where(Flat.apartment_id == apartment.id)).all()
    flat_by_legacy = {f"flat-{f.flat_number}": f for f in flats}

    count = 0
    for row in load_json("visitors.json"):
        flat = flat_by_legacy.get(row["flatId"])
        if not flat:
            continue
        db.add(
            VisitorRecord(
                id=new_uuid(),
                apartment_id=apartment.id,
                flat_id=flat.id,
                guest_name=row["guestName"],
                purpose=row.get("purpose"),
                expected_date=date.fromisoformat(row["expectedDate"]),
                expected_time=parse_time(row.get("expectedTime")),
                status=row.get("status", "pending"),
            )
        )
        count += 1

    db.commit()
    print(f"Seeded visitors: {count} records.")
    db.close()


if __name__ == "__main__":
    seed()
