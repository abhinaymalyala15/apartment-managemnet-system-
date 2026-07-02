"""Seed B6 communication from notice JSON files."""

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
from app.models.auth import User  # noqa: E402
from app.models.communication import (  # noqa: E402
    Notice,
    NoticeBlockTarget,
    NoticeHistoryEvent,
    Notification,
    TimelineEvent,
)
from app.models.structure import Apartment, Block  # noqa: E402
from app.repositories.communication_repository import CommunicationRepository  # noqa: E402
from app.repositories.structure_repository import StructureRepository  # noqa: E402
from app.services.communication_service import CommunicationService  # noqa: E402

DATA = ROOT / "src" / "data"
LEGACY_BLOCK = "block-a"


def load_json(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


def parse_dt(value: str) -> datetime:
    if "T" in value:
        dt = datetime.fromisoformat(value)
    else:
        dt = datetime.fromisoformat(f"{value}T00:00:00")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def seed() -> None:
    db = SessionLocal()
    repo = CommunicationRepository(db)

    apartment = db.scalar(
        select(Apartment).where(Apartment.slug == "sylvan-shelter-apartment")
    )
    if not apartment:
        print("Run seed_structure.py first.")
        db.close()
        return

    if db.scalar(select(Notice).limit(1)):
        print("Communication already seeded — skipping.")
        db.close()
        return

    blocks = db.scalars(select(Block).where(Block.apartment_id == apartment.id)).all()
    block_by_legacy = {f"block-{b.code.lower()}": b for b in blocks}

    notice_id_map: dict[str, str] = {}
    notice_count = 0

    def add_notice(
        row: dict,
        lifecycle_status: str,
        *,
        published_at: datetime | None = None,
        scheduled_at: datetime | None = None,
        archived_at: datetime | None = None,
        archived_by: str | None = None,
        last_edited_at: datetime | None = None,
    ) -> Notice:
        nonlocal notice_count
        legacy_id = row["id"]
        audience = row.get("audience", "all")
        block_ids_legacy = row.get("blockIds", [])
        block_ids = [block_by_legacy[b].id for b in block_ids_legacy if b in block_by_legacy]

        notice = Notice(
            id=new_uuid(),
            apartment_id=apartment.id,
            title=row["title"],
            content=row.get("content"),
            category=row.get("category", "general"),
            priority=row.get("priority", "medium"),
            audience=audience,
            lifecycle_status=lifecycle_status,
            is_emergency=row.get("isEmergency", False) or row.get("category") == "emergency",
            author_name=row.get("author"),
            scheduled_at=scheduled_at,
            published_at=published_at,
            archived_at=archived_at,
            archived_by=archived_by,
            last_edited_at=last_edited_at or datetime.now(timezone.utc),
        )
        db.add(notice)
        db.flush()
        for block_id in block_ids:
            db.add(NoticeBlockTarget(id=new_uuid(), notice_id=notice.id, block_id=block_id))
        notice_id_map[legacy_id] = notice.id
        notice_count += 1
        return notice

    for row in load_json("notices.json"):
        add_notice(
            row,
            "published",
            published_at=parse_dt(row["publishedAt"]),
        )

    for row in load_json("notice-drafts.json"):
        add_notice(
            row,
            "draft",
            last_edited_at=parse_dt(row["lastEditedAt"]),
        )

    for row in load_json("notice-scheduled.json"):
        add_notice(
            row,
            "scheduled",
            scheduled_at=parse_dt(row["scheduledAt"]),
            last_edited_at=parse_dt(row["lastEditedAt"]),
        )

    for row in load_json("notice-archived.json"):
        add_notice(
            row,
            "archived",
            published_at=parse_dt(row["publishedAt"]),
            archived_at=parse_dt(row["archivedAt"]),
            archived_by=row.get("archivedBy"),
        )

    history_count = 0
    timeline_count = 0
    for row in load_json("notice-history.json"):
        legacy_notice_id = row["noticeId"]
        notice_id = notice_id_map.get(legacy_notice_id)
        if not notice_id:
            continue
        db.add(
            NoticeHistoryEvent(
                id=new_uuid(),
                apartment_id=apartment.id,
                notice_id=notice_id,
                notice_title=row["noticeTitle"],
                action=row["action"],
                actor_name=row["actor"],
                detail=row.get("detail"),
                occurred_at=parse_dt(row["occurredAt"]),
            )
        )
        history_count += 1

        event_type = CommunicationService.HISTORY_TO_TIMELINE.get(row["action"])
        if event_type:
            db.add(
                TimelineEvent(
                    id=new_uuid(),
                    apartment_id=apartment.id,
                    entity_type="notice",
                    entity_id=notice_id,
                    event_type=event_type,
                    title=row["noticeTitle"],
                    event_date=parse_dt(row["occurredAt"]),
                    source_table="notices",
                    source_id=notice_id,
                    href="/resident/notices",
                )
            )
            timeline_count += 1

    db.commit()

    service = CommunicationService(repo, StructureRepository(db))
    published = repo.list_notices(apartment.id, lifecycle_status="published")
    for notice in published:
        service._dispatch_notifications(apartment.id, notice)  # noqa: SLF001
    db.commit()

    notification_count = len(repo.list_notifications(apartment.id))

    print(
        f"Seeded communication: {notice_count} notices, {history_count} history events, "
        f"{timeline_count} timeline events, {notification_count} notifications."
    )
    db.close()


if __name__ == "__main__":
    seed()
