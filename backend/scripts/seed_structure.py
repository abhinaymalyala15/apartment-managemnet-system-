"""Seed B2 structure from frontend demo JSON (Sylvan Shelter)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from app.db.base import new_uuid  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.structure import Apartment, Block, Flat, Floor  # noqa: E402
from app.repositories.structure_repository import StructureRepository  # noqa: E402

DATA = ROOT / "src" / "data"


def load_json(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def seed() -> None:
    db = SessionLocal()
    repo = StructureRepository(db)

    if repo.list_apartments():
        print("Database already seeded — skipping.")
        db.close()
        return

    apt_data = load_json("apartment.json")
    blocks_data = load_json("blocks.json")
    flats_data = load_json("flats.json")

    apartment = Apartment(
        id=new_uuid(),
        name=apt_data["name"],
        slug=apt_data["slug"],
        tagline=apt_data.get("tagline"),
        address=apt_data.get("address"),
        city=apt_data.get("city"),
        state=apt_data.get("state"),
        pincode=apt_data.get("pincode"),
        phone=apt_data.get("phone"),
        email=apt_data.get("email"),
        registration_number=apt_data.get("registrationNumber"),
        year_established=apt_data.get("yearEstablished"),
        description=apt_data.get("description"),
    )
    db.add(apartment)
    db.commit()
    db.refresh(apartment)
    print(f"Created apartment: {apartment.name} ({apartment.id})")

    block_id_map: dict[str, str] = {}
    for i, b in enumerate(blocks_data):
        block = Block(
            id=new_uuid(),
            apartment_id=apartment.id,
            name=b["name"],
            code=b["code"],
            floor_count=b.get("floorCount", 0),
            total_flats=b.get("totalFlats", 0),
            description=b.get("description"),
            sort_order=i,
        )
        db.add(block)
        db.commit()
        db.refresh(block)
        block_id_map[b["id"]] = block.id
        print(f"  Block: {block.name} ({block.id})")

    floor_id_map: dict[tuple[str, int], str] = {}
    active_block_legacy = "block-a"
    active_block_id = block_id_map[active_block_legacy]
    floor_numbers = sorted({f["floor"] for f in flats_data if f["blockId"] == active_block_legacy})
    for num in floor_numbers:
        label = "Ground Floor" if num == 0 else (f"Floor {num}" if num > 0 else f"Basement {num}")
        floor = Floor(
            id=new_uuid(),
            apartment_id=apartment.id,
            block_id=active_block_id,
            floor_number=num,
            label=label,
            flat_count=0,
        )
        db.add(floor)
        db.commit()
        db.refresh(floor)
        floor_id_map[(active_block_legacy, num)] = floor.id
        print(f"    Floor {num} ({floor.id})")

    for f in flats_data:
        if f["blockId"] != active_block_legacy:
            continue
        floor_key = (f["blockId"], f["floor"])
        flat = Flat(
            id=new_uuid(),
            apartment_id=apartment.id,
            block_id=active_block_id,
            floor_id=floor_id_map[floor_key],
            flat_number=f["flatNumber"],
            floor=f["floor"],
            area_sqft=f.get("areaSqft"),
            bedrooms=f.get("bedrooms"),
            flat_type=f.get("flatType"),
            parking_slots=f.get("parkingSlots"),
            occupancy_status=f.get("occupancyStatus", "vacant"),
        )
        db.add(flat)

    db.commit()
    block = repo.get_block(apartment.id, active_block_id)
    if block:
        repo.refresh_block_counts(block)

    flat_count = len([f for f in flats_data if f["blockId"] == active_block_legacy])
    print(f"Seeded {flat_count} flats for Block A.")
    db.close()


if __name__ == "__main__":
    seed()
