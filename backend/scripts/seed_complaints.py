"""Seed B9 complaints from resident-requests.json."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from sqlalchemy import select  # noqa: E402

from app.db.base import new_uuid  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.complaints import ResidentRequest  # noqa: E402
from app.models.structure import Apartment, Flat  # noqa: E402

DATA = ROOT / "src" / "data"


def load_json(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def parse_dt(value: str) -> datetime:
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def seed() -> None:
    db = SessionLocal()

    apartment = db.scalar(
        select(Apartment).where(Apartment.slug == "sylvan-shelter-apartment")
    )
    if not apartment:
        print("Run seed_structure.py first.")
        db.close()
        return

    if db.scalar(select(ResidentRequest).limit(1)):
        print("Complaints already seeded — skipping.")
        db.close()
        return

    flats = db.scalars(select(Flat).where(Flat.apartment_id == apartment.id)).all()
    flat_by_legacy = {f"flat-{f.flat_number}": f for f in flats}

    count = 0
    for row in load_json("resident-requests.json"):
        flat = flat_by_legacy.get(row["flatId"])
        if not flat:
            continue
        req = ResidentRequest(
            id=new_uuid(),
            apartment_id=apartment.id,
            flat_id=flat.id,
            title=row["title"],
            description=row["description"],
            status=row.get("status", "open"),
            priority=row.get("priority", "medium"),
        )
        req.created_at = parse_dt(row["createdAt"])
        req.updated_at = req.created_at
        db.add(req)
        count += 1

    db.commit()
    print(f"Seeded complaints: {count} resident requests.")
    db.close()


if __name__ == "__main__":
    seed()
