"""Seed B3 people from frontend demo JSON."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from sqlalchemy import select  # noqa: E402

from app.db.base import new_uuid  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.people import (  # noqa: E402
    FamilyMemberProfile,
    OwnerProfile,
    Person,
    StaffBlockScope,
    StaffProfile,
    TenantProfile,
)
from app.models.structure import Apartment, Block, Flat  # noqa: E402
from app.repositories.people_repository import PeopleRepository  # noqa: E402

DATA = ROOT / "src" / "data"
LEGACY_BLOCK = "block-a"


def load_json(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


def seed() -> None:
    db = SessionLocal()
    people_repo = PeopleRepository(db)

    apartment = db.scalar(
        select(Apartment).where(Apartment.slug == "sylvan-shelter-apartment")
    )
    if not apartment:
        print("Run seed_structure.py first.")
        db.close()
        return

    if people_repo.list_persons(apartment.id):
        print("People already seeded — skipping.")
        db.close()
        return

    blocks = db.scalars(select(Block).where(Block.apartment_id == apartment.id)).all()
    block_by_code = {b.code.upper(): b for b in blocks}
    block_by_legacy = {}
    for b in blocks:
        legacy = f"block-{b.code.lower()}"
        block_by_legacy[legacy] = b

    block_a = block_by_legacy.get(LEGACY_BLOCK) or block_by_code.get("A")
    if not block_a:
        print("Block A not found.")
        db.close()
        return

    flats = db.scalars(
        select(Flat).where(Flat.apartment_id == apartment.id, Flat.block_id == block_a.id)
    ).all()
    flat_by_legacy: dict[str, Flat] = {}
    for flat in flats:
        legacy = f"flat-{flat.flat_number}"
        flat_by_legacy[legacy] = flat

    def flat_scope(flat: Flat) -> dict[str, str]:
        return {
            "apartment_id": flat.apartment_id,
            "block_id": flat.block_id,
            "floor_id": flat.floor_id,
            "flat_id": flat.id,
        }

    owners_data = load_json("owners.json")
    for row in owners_data:
        flat = flat_by_legacy.get(row["flatId"])
        if not flat:
            continue
        person = Person(
            id=new_uuid(),
            apartment_id=apartment.id,
            full_name=row["fullName"],
            email=row.get("email"),
            phone=row.get("phone"),
            alternate_phone=row.get("alternatePhone"),
        )
        db.add(person)
        db.flush()
        db.add(
            OwnerProfile(
                id=new_uuid(),
                person_id=person.id,
                is_primary=row.get("isPrimary", False),
                ownership_start_date=parse_date(row.get("ownershipStartDate")),
                **flat_scope(flat),
            )
        )

    tenants_data = load_json("tenants.json")
    for row in tenants_data:
        flat = flat_by_legacy.get(row["flatId"])
        if not flat:
            continue
        person = Person(
            id=new_uuid(),
            apartment_id=apartment.id,
            full_name=row["fullName"],
            email=row.get("email"),
            phone=row.get("phone"),
        )
        db.add(person)
        db.flush()
        db.add(
            TenantProfile(
                id=new_uuid(),
                person_id=person.id,
                is_active=row.get("isActive", True),
                lease_start_date=parse_date(row.get("leaseStartDate")),
                lease_end_date=parse_date(row.get("leaseEndDate")),
                **flat_scope(flat),
            )
        )
        flat.occupancy_status = "tenant_occupied"

    family_data = load_json("family-members.json")
    for row in family_data:
        flat = flat_by_legacy.get(row["flatId"])
        if not flat:
            continue
        person = Person(
            id=new_uuid(),
            apartment_id=apartment.id,
            full_name=row["fullName"],
            phone=row.get("phone"),
            email=row.get("email"),
            date_of_birth=parse_date(row.get("dateOfBirth")),
        )
        db.add(person)
        db.flush()
        db.add(
            FamilyMemberProfile(
                id=new_uuid(),
                person_id=person.id,
                relation_type=row["relationship"],
                marriage_anniversary=parse_date(row.get("marriageAnniversary")),
                is_emergency_contact=row.get("relationship", "").lower() in {"spouse", "father", "mother"},
                **flat_scope(flat),
            )
        )

    staff_data = load_json("staff.json")
    for row in staff_data:
        person = Person(
            id=new_uuid(),
            apartment_id=apartment.id,
            full_name=row["fullName"],
            email=row.get("email"),
            phone=row.get("phone"),
        )
        db.add(person)
        db.flush()
        staff = StaffProfile(
            id=new_uuid(),
            apartment_id=apartment.id,
            person_id=person.id,
            role_code=row["roleId"],
            department=row.get("department"),
            joined_at=parse_date(row.get("joinedAt")),
            is_active=row.get("isActive", True),
        )
        db.add(staff)
        db.flush()
        for legacy_block_id in row.get("blockIds", []):
            block = block_by_legacy.get(legacy_block_id)
            if block:
                db.add(StaffBlockScope(id=new_uuid(), staff_id=staff.id, block_id=block.id))

    db.commit()

    # Recompute occupancy for flats without tenants
    tenant_flat_ids = {flat_by_legacy[r["flatId"]].id for r in tenants_data if r["flatId"] in flat_by_legacy}
    for flat in flats:
        if flat.id not in tenant_flat_ids and flat.occupancy_status != "vacant":
            owners_on_flat = [o for o in owners_data if o["flatId"] == f"flat-{flat.flat_number}"]
            flat.occupancy_status = "owner_occupied" if owners_on_flat else "vacant"
    db.commit()

    print(
        f"Seeded people: {len(owners_data)} owners, {len(tenants_data)} tenants, "
        f"{len(family_data)} family, {len(staff_data)} staff."
    )
    db.close()


if __name__ == "__main__":
    seed()
