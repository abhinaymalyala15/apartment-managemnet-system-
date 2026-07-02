"""Seed B10 settings, documents, gallery from demo JSON."""

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
from app.models.assets import CommunityAsset  # noqa: E402
from app.models.documents import Document, FlatInternalNote  # noqa: E402
from app.models.settings import (  # noqa: E402
    CommitteeMember,
    EmergencyContact,
    GalleryImage,
    IntegrationSetting,
    OfficeContact,
    SystemPreference,
)
from app.models.structure import Apartment, Flat  # noqa: E402

DATA = ROOT / "src" / "data"


def load_json(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def parse_date(value: str) -> datetime:
    if "T" not in value:
        value = f"{value}T00:00:00"
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

    if db.scalar(select(SystemPreference).limit(1)):
        print("Settings already seeded — skipping.")
        db.close()
        return

    flats = db.scalars(select(Flat).where(Flat.apartment_id == apartment.id)).all()
    flat_by_legacy = {f"flat-{f.flat_number}": f for f in flats}

    assets = db.scalars(select(CommunityAsset).where(CommunityAsset.apartment_id == apartment.id)).all()
    asset_by_name: dict[str, CommunityAsset] = {}
    for row in load_json("community-assets.json"):
        for a in assets:
            if a.name == row["name"]:
                asset_by_name[row["id"]] = a

    settings_data = load_json("apartment-settings.json")
    prefs = settings_data["preferences"]
    db.add(
        SystemPreference(
            id=new_uuid(),
            apartment_id=apartment.id,
            timezone=prefs["timezone"],
            date_format=prefs["dateFormat"],
            currency=prefs["currency"],
            locale=prefs["locale"],
            fiscal_year_start_month=prefs["fiscalYearStartMonth"],
            default_notice_channel=prefs["defaultNoticeChannel"],
            auto_archive_notices_days=prefs["autoArchiveNoticesDays"],
        )
    )

    contacts = load_json("committee-contacts.json")
    for i, row in enumerate(contacts["committee"]):
        db.add(
            CommitteeMember(
                id=new_uuid(),
                apartment_id=apartment.id,
                name=row["name"],
                role=row["role"],
                phone=row.get("phone"),
                email=row.get("email"),
                sort_order=i,
            )
        )
    for i, row in enumerate(contacts["emergency"]):
        db.add(
            EmergencyContact(
                id=new_uuid(),
                apartment_id=apartment.id,
                label=row["label"],
                phone=row["phone"],
                hours=row.get("hours"),
                role=row.get("role"),
                sort_order=i,
            )
        )
    office = contacts["office"]
    db.add(
        OfficeContact(
            id=new_uuid(),
            apartment_id=apartment.id,
            label=office["label"],
            phone=office.get("phone"),
            email=office.get("email"),
            hours=office.get("hours"),
        )
    )

    for row in settings_data["integrations"]:
        db.add(
            IntegrationSetting(
                id=new_uuid(),
                apartment_id=apartment.id,
                integration_code=row["id"],
                label=row["label"],
                description=row.get("description"),
                enabled=row.get("enabled", False),
                phase=row.get("phase"),
            )
        )

    doc_count = 0
    for row in load_json("documents.json"):
        flat = flat_by_legacy.get(row.get("flatId", ""))
        if not flat:
            continue
        db.add(
            Document(
                id=new_uuid(),
                apartment_id=apartment.id,
                entity_type="flat",
                entity_id=flat.id,
                title=row["title"],
                category=row["category"],
                file_label=row["fileLabel"],
                uploaded_at=parse_date(row["uploadedAt"]),
            )
        )
        doc_count += 1

    for row in load_json("asset-documents.json"):
        asset = asset_by_name.get(row.get("assetId", ""))
        if not asset:
            continue
        db.add(
            Document(
                id=new_uuid(),
                apartment_id=apartment.id,
                entity_type="asset",
                entity_id=asset.id,
                title=row["title"],
                category=row["category"],
                file_label=row["fileLabel"],
                uploaded_at=parse_date(row["uploadedAt"]),
            )
        )
        doc_count += 1

    note_count = 0
    for row in load_json("flat-internal-notes.json"):
        flat = flat_by_legacy.get(row["flatId"])
        if not flat:
            continue
        note = FlatInternalNote(
            id=new_uuid(),
            apartment_id=apartment.id,
            flat_id=flat.id,
            author_name=row["author"],
            content=row["content"],
        )
        note.created_at = parse_date(row["createdAt"])
        db.add(note)
        note_count += 1

    gallery_count = 0
    for i, row in enumerate(load_json("gallery.json")):
        db.add(
            GalleryImage(
                id=new_uuid(),
                apartment_id=apartment.id,
                title=row["title"],
                category=row.get("category"),
                image_url=row["imageUrl"],
                caption=row.get("caption"),
                sort_order=i,
            )
        )
        gallery_count += 1

    db.commit()
    print(
        f"Seeded settings: preferences, {len(contacts['committee'])} committee, "
        f"{len(contacts['emergency'])} emergency, office, {len(settings_data['integrations'])} integrations, "
        f"{doc_count} documents, {note_count} flat notes, {gallery_count} gallery images."
    )
    db.close()


if __name__ == "__main__":
    seed()
