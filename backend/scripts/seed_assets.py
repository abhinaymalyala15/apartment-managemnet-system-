"""Seed B7 assets from demo JSON."""

from __future__ import annotations

import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from sqlalchemy import select  # noqa: E402

from app.db.base import new_uuid  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.assets import (  # noqa: E402
    AssetAmcRecord,
    AssetInternalNote,
    AssetServiceRecord,
    AssetVendorLink,
    CommunityAsset,
    FacilityVendor,
    ServiceSchedule,
)
from app.models.structure import Apartment, Block, Flat  # noqa: E402

DATA = ROOT / "src" / "data"


def load_json(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value)


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

    if db.scalar(select(CommunityAsset).limit(1)):
        print("Assets already seeded — skipping.")
        db.close()
        return

    blocks = db.scalars(select(Block).where(Block.apartment_id == apartment.id)).all()
    block_by_legacy = {f"block-{b.code.lower()}": b for b in blocks}

    flats = db.scalars(select(Flat).where(Flat.apartment_id == apartment.id)).all()
    flat_by_legacy = {f"flat-{f.flat_number}": f for f in flats}

    vendor_id_map: dict[str, str] = {}
    asset_id_map: dict[str, str] = {}

    for row in load_json("asset-vendors.json"):
        vendor = FacilityVendor(
            id=new_uuid(),
            apartment_id=apartment.id,
            name=row["name"],
            category=row["category"],
            phone=row.get("phone"),
            email=row.get("email"),
            contact_person=row.get("contactPerson"),
        )
        db.add(vendor)
        db.flush()
        vendor_id_map[row["id"]] = vendor.id

    for row in load_json("community-assets.json"):
        block_id = None
        if row.get("blockId"):
            block = block_by_legacy.get(row["blockId"])
            block_id = block.id if block else None
        vendor_id = vendor_id_map.get(row.get("vendorId", ""))

        asset = CommunityAsset(
            id=new_uuid(),
            apartment_id=apartment.id,
            block_id=block_id,
            name=row["name"],
            asset_type=row["assetType"],
            scope=row.get("scope", "community"),
            location=row.get("location"),
            primary_vendor_id=vendor_id,
            installation_date=parse_date(row.get("installationDate")),
            warranty_expiry=parse_date(row.get("warrantyExpiry")),
            last_service_date=parse_date(row.get("lastServiceDate")),
            next_service_date=parse_date(row.get("nextServiceDate")),
            amc_expiry_date=parse_date(row.get("amcExpiryDate")),
            status=row.get("status", "active"),
        )
        db.add(asset)
        db.flush()
        asset_id_map[row["id"]] = asset.id
        if vendor_id:
            db.add(
                AssetVendorLink(
                    id=new_uuid(),
                    asset_id=asset.id,
                    vendor_id=vendor_id,
                    link_type="service",
                )
            )

    for row in load_json("asset-amc.json"):
        asset_id = asset_id_map.get(row["assetId"])
        vendor_id = vendor_id_map.get(row["vendorId"])
        if not asset_id or not vendor_id:
            continue
        db.add(
            AssetAmcRecord(
                id=new_uuid(),
                apartment_id=apartment.id,
                asset_id=asset_id,
                vendor_id=vendor_id,
                start_date=parse_date(row["startDate"]),
                end_date=parse_date(row["endDate"]),
                renewal_reminder_days=row.get("renewalReminderDays", 30),
                contact_person=row.get("contactPerson"),
                phone=row.get("phone"),
                email=row.get("email"),
                is_current=True,
            )
        )

    asset_service_count = 0
    for row in load_json("asset-services.json"):
        asset_id = asset_id_map.get(row.get("assetId", ""))
        vendor_id = vendor_id_map.get(row.get("vendorId", "")) if row.get("vendorId") else None
        flat_id = None
        if row.get("flatId"):
            flat = flat_by_legacy.get(row["flatId"])
            flat_id = flat.id if flat else None

        db.add(
            AssetServiceRecord(
                id=new_uuid(),
                apartment_id=apartment.id,
                asset_id=asset_id,
                flat_id=flat_id,
                scope=row.get("scope", "community"),
                title=row["title"],
                description=row.get("description"),
                service_type=row["serviceType"],
                scheduled_date=parse_date(row["scheduledDate"]),
                scheduled_time=row.get("scheduledTime"),
                completed_date=parse_date(row.get("completedDate")),
                vendor_id=vendor_id,
                technician=row.get("technician"),
                status=row.get("status", "scheduled"),
                frequency=row.get("frequency"),
                next_due_date=parse_date(row.get("nextDueDate")),
                remarks=row.get("remarks"),
            )
        )
        asset_service_count += 1

    schedule_count = 0
    for row in load_json("services.json"):
        flat_id = None
        if row.get("flatId"):
            flat = flat_by_legacy.get(row["flatId"])
            flat_id = flat.id if flat else None
        vendor_id = None
        vendor_name = row.get("vendor")
        for legacy_vid, vid in vendor_id_map.items():
            vendor = db.get(FacilityVendor, vid)
            if vendor and vendor.name == vendor_name:
                vendor_id = vid
                break

        db.add(
            ServiceSchedule(
                id=new_uuid(),
                apartment_id=apartment.id,
                flat_id=flat_id,
                title=row["title"],
                description=row.get("description"),
                service_type=row["serviceType"],
                scheduled_date=parse_date(row["scheduledDate"]),
                scheduled_time=row.get("scheduledTime"),
                vendor_name=vendor_name,
                vendor_id=vendor_id,
                status=row.get("status", "scheduled"),
                last_service_date=parse_date(row.get("lastServiceDate")),
                next_due_date=parse_date(row.get("nextDueDate")),
                frequency=row.get("frequency"),
            )
        )
        schedule_count += 1

    note_count = 0
    for row in load_json("asset-internal-notes.json"):
        asset_id = asset_id_map.get(row["assetId"])
        if not asset_id:
            continue
        note = AssetInternalNote(
            id=new_uuid(),
            apartment_id=apartment.id,
            asset_id=asset_id,
            author_name=row["author"],
            content=row["content"],
        )
        note.created_at = parse_dt(row["createdAt"])
        db.add(note)
        note_count += 1

    db.commit()
    print(
        f"Seeded assets: {len(vendor_id_map)} vendors, {len(asset_id_map)} assets, "
        f"{len(load_json('asset-amc.json'))} AMC records, {asset_service_count} asset services, "
        f"{schedule_count} service schedules, {note_count} notes."
    )
    db.close()


if __name__ == "__main__":
    seed()
