from datetime import datetime, timezone

from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import new_uuid
from app.models.communication import Notice, NoticeHistoryEvent, Notification, TimelineEvent
from app.repositories.communication_repository import CommunicationRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.communication import (
    CommunicationSummary,
    EmergencyNoticeCreate,
    NoticeArchiveRequest,
    NoticeCreate,
    NoticePublishRequest,
    NoticeRead,
    NoticeScheduleRequest,
    NoticeUpdate,
)


class CommunicationService:
    VALID_CATEGORIES = {"general", "maintenance", "event", "emergency"}
    VALID_PRIORITIES = {"low", "medium", "high"}
    VALID_AUDIENCES = {"all", "owners", "tenants", "block"}
    VALID_LIFECYCLE = {"draft", "scheduled", "published", "archived"}
    VALID_HISTORY_ACTIONS = {
        "created",
        "edited",
        "published",
        "scheduled",
        "archived",
        "emergency_sent",
    }
    HISTORY_TO_TIMELINE = {
        "published": "notice_published",
        "emergency_sent": "notice_emergency",
        "archived": "notice_archived",
    }

    def __init__(self, repo: CommunicationRepository, structure_repo: StructureRepository):
        self.repo = repo
        self.structure_repo = structure_repo

    def _get_apartment(self, apartment_id: str):
        apt = self.structure_repo.get_apartment(apartment_id)
        if not apt:
            raise NotFoundError("Apartment not found")
        return apt

    def _validate_notice_fields(
        self,
        category: str,
        priority: str,
        audience: str,
        block_ids: list[str],
        apartment_id: str,
    ) -> None:
        if category not in self.VALID_CATEGORIES:
            raise ConflictError(f"Invalid category: {category}")
        if priority not in self.VALID_PRIORITIES:
            raise ConflictError(f"Invalid priority: {priority}")
        if audience not in self.VALID_AUDIENCES:
            raise ConflictError(f"Invalid audience: {audience}")
        if audience == "block" and not block_ids:
            raise ConflictError("block_ids required when audience is block")
        for block_id in block_ids:
            if not self.repo.get_block(apartment_id, block_id):
                raise NotFoundError(f"Block not found: {block_id}")

    @staticmethod
    def _to_notice_read(notice: Notice) -> NoticeRead:
        data = NoticeRead.model_validate(notice)
        data.block_ids = CommunicationRepository.notice_block_ids(notice)
        return data

    def list_notices(
        self,
        apartment_id: str,
        lifecycle_status: str | None = None,
        category: str | None = None,
        is_emergency: bool | None = None,
    ) -> list[NoticeRead]:
        self._get_apartment(apartment_id)
        notices = self.repo.list_notices(apartment_id, lifecycle_status, category, is_emergency)
        return [self._to_notice_read(n) for n in notices]

    def get_notice(self, apartment_id: str, notice_id: str) -> NoticeRead:
        notice = self.repo.get_notice(apartment_id, notice_id)
        if not notice:
            raise NotFoundError("Notice not found")
        return self._to_notice_read(notice)

    def create_notice(
        self,
        apartment_id: str,
        data: NoticeCreate,
        author_user_id: str | None = None,
    ) -> NoticeRead:
        self._get_apartment(apartment_id)
        if data.lifecycle_status not in self.VALID_LIFECYCLE:
            raise ConflictError(f"Invalid lifecycle_status: {data.lifecycle_status}")
        self._validate_notice_fields(
            data.category, data.priority, data.audience, data.block_ids, apartment_id
        )

        now = datetime.now(timezone.utc)
        notice = Notice(
            id=new_uuid(),
            apartment_id=apartment_id,
            title=data.title,
            content=data.content,
            category=data.category,
            priority=data.priority,
            audience=data.audience,
            lifecycle_status=data.lifecycle_status,
            is_emergency=data.is_emergency,
            author_user_id=author_user_id,
            author_name=data.author_name,
            last_edited_at=now,
        )
        notice = self.repo.create_notice(notice, data.block_ids)

        self._record_history(
            apartment_id,
            notice,
            "created",
            data.author_name or "System",
            author_user_id,
        )
        self.repo.commit()
        return self._to_notice_read(notice)

    def update_notice(
        self,
        apartment_id: str,
        notice_id: str,
        data: NoticeUpdate,
        actor_user_id: str | None = None,
    ) -> NoticeRead:
        notice = self.repo.get_notice(apartment_id, notice_id)
        if not notice:
            raise NotFoundError("Notice not found")
        if notice.lifecycle_status == "archived":
            raise ConflictError("Archived notices cannot be edited")

        updates = data.model_dump(exclude_unset=True)
        block_ids = updates.pop("block_ids", None)
        for key, value in updates.items():
            setattr(notice, key, value)

        category = notice.category
        priority = notice.priority
        audience = notice.audience
        ids = block_ids if block_ids is not None else self.repo.notice_block_ids(notice)
        self._validate_notice_fields(category, priority, audience, ids, apartment_id)

        notice.last_edited_at = datetime.now(timezone.utc)
        notice = self.repo.update_notice(notice, block_ids)

        actor_name = data.author_name or notice.author_name or "System"
        self._record_history(apartment_id, notice, "edited", actor_name, actor_user_id)
        self.repo.commit()
        return self._to_notice_read(notice)

    def schedule_notice(
        self,
        apartment_id: str,
        notice_id: str,
        data: NoticeScheduleRequest,
        actor_user_id: str | None = None,
    ) -> NoticeRead:
        notice = self.repo.get_notice(apartment_id, notice_id)
        if not notice:
            raise NotFoundError("Notice not found")
        if notice.lifecycle_status not in {"draft", "scheduled"}:
            raise ConflictError("Only draft notices can be scheduled")

        notice.lifecycle_status = "scheduled"
        notice.scheduled_at = data.scheduled_at
        notice.last_edited_at = datetime.now(timezone.utc)

        actor_name = data.actor_name or notice.author_name or "System"
        detail = f"Scheduled for {data.scheduled_at.isoformat()}"
        self._record_history(apartment_id, notice, "scheduled", actor_name, actor_user_id, detail)
        self.repo.commit()
        return self._to_notice_read(notice)

    def publish_notice(
        self,
        apartment_id: str,
        notice_id: str,
        data: NoticePublishRequest,
        actor_user_id: str | None = None,
    ) -> NoticeRead:
        notice = self.repo.get_notice(apartment_id, notice_id)
        if not notice:
            raise NotFoundError("Notice not found")
        if notice.lifecycle_status not in {"draft", "scheduled"}:
            raise ConflictError("Only draft or scheduled notices can be published")

        now = datetime.now(timezone.utc)
        notice.lifecycle_status = "published"
        notice.published_at = now
        notice.last_edited_at = now

        actor_name = data.actor_name or notice.author_name or "System"
        action = "emergency_sent" if notice.is_emergency else "published"
        detail = "Emergency notice published to all residents" if notice.is_emergency else None
        self._record_history(apartment_id, notice, action, actor_name, actor_user_id, detail)
        self._record_timeline(apartment_id, notice, action, actor_user_id)
        self._dispatch_notifications(apartment_id, notice)
        self.repo.commit()
        return self._to_notice_read(notice)

    def publish_emergency(
        self,
        apartment_id: str,
        data: EmergencyNoticeCreate,
        author_user_id: str | None = None,
    ) -> NoticeRead:
        create_data = NoticeCreate(
            **data.model_dump(),
            lifecycle_status="draft",
            is_emergency=True,
            category=data.category if data.category != "general" else "emergency",
        )
        notice_read = self.create_notice(apartment_id, create_data, author_user_id)
        return self.publish_notice(
            apartment_id,
            notice_read.id,
            NoticePublishRequest(actor_name=data.author_name),
            author_user_id,
        )

    def archive_notice(
        self,
        apartment_id: str,
        notice_id: str,
        data: NoticeArchiveRequest,
        actor_user_id: str | None = None,
    ) -> NoticeRead:
        notice = self.repo.get_notice(apartment_id, notice_id)
        if not notice:
            raise NotFoundError("Notice not found")
        if notice.lifecycle_status != "published":
            raise ConflictError("Only published notices can be archived")

        now = datetime.now(timezone.utc)
        notice.lifecycle_status = "archived"
        notice.archived_at = now
        notice.archived_by = actor_user_id
        notice.last_edited_at = now

        actor_name = data.actor_name or notice.author_name or "System"
        self._record_history(apartment_id, notice, "archived", actor_name, actor_user_id)
        self._record_timeline(apartment_id, notice, "archived", actor_user_id)
        self.repo.commit()
        return self._to_notice_read(notice)

    def list_history(self, apartment_id: str, notice_id: str | None = None):
        self._get_apartment(apartment_id)
        return self.repo.list_history(apartment_id, notice_id)

    def get_summary(self, apartment_id: str) -> CommunicationSummary:
        self._get_apartment(apartment_id)
        counts = self.repo.count_notices_by_status(apartment_id)
        return CommunicationSummary(
            published_count=counts.get("published", 0),
            draft_count=counts.get("draft", 0),
            scheduled_count=counts.get("scheduled", 0),
            archived_count=counts.get("archived", 0),
            emergency_count=self.repo.count_emergency_published(apartment_id),
        )

    def list_notifications(
        self,
        apartment_id: str,
        user_id: str | None = None,
        flat_id: str | None = None,
        unread_only: bool = False,
    ):
        self._get_apartment(apartment_id)
        return self.repo.list_notifications(apartment_id, user_id, flat_id, unread_only)

    def mark_notification_read(self, apartment_id: str, notification_id: str):
        notification = self.repo.get_notification(apartment_id, notification_id)
        if not notification:
            raise NotFoundError("Notification not found")
        if not notification.read_at:
            notification.read_at = datetime.now(timezone.utc)
            self.repo.commit()
        return notification

    def list_timeline(
        self,
        apartment_id: str,
        flat_id: str | None = None,
        entity_type: str | None = None,
        limit: int = 50,
    ):
        self._get_apartment(apartment_id)
        return self.repo.list_timeline(apartment_id, flat_id, entity_type, limit)

    def _record_history(
        self,
        apartment_id: str,
        notice: Notice,
        action: str,
        actor_name: str,
        actor_user_id: str | None = None,
        detail: str | None = None,
    ) -> None:
        if action not in self.VALID_HISTORY_ACTIONS:
            raise ConflictError(f"Invalid history action: {action}")
        self.repo.add_history(
            NoticeHistoryEvent(
                id=new_uuid(),
                apartment_id=apartment_id,
                notice_id=notice.id,
                notice_title=notice.title,
                action=action,
                actor_user_id=actor_user_id,
                actor_name=actor_name,
                detail=detail,
                occurred_at=datetime.now(timezone.utc),
            )
        )

    def _record_timeline(
        self,
        apartment_id: str,
        notice: Notice,
        action: str,
        actor_user_id: str | None = None,
    ) -> None:
        event_type = self.HISTORY_TO_TIMELINE.get(action)
        if not event_type:
            return
        self.repo.add_timeline(
            TimelineEvent(
                id=new_uuid(),
                apartment_id=apartment_id,
                entity_type="notice",
                entity_id=notice.id,
                flat_id=None,
                event_type=event_type,
                title=notice.title,
                description=notice.content,
                event_date=datetime.now(timezone.utc),
                source_table="notices",
                source_id=notice.id,
                href=f"/resident/notices",
                actor_user_id=actor_user_id,
            )
        )

    def _dispatch_notifications(self, apartment_id: str, notice: Notice) -> None:
        block_ids = self.repo.notice_block_ids(notice)
        now = datetime.now(timezone.utc)
        priority = "high" if notice.is_emergency or notice.priority == "high" else notice.priority

        for user, membership in self.repo.list_membership_users(apartment_id):
            if not self._user_in_audience(
                apartment_id, user.id, membership.role, notice.audience, block_ids
            ):
                continue
            flat_id = self.repo.user_flat_id(apartment_id, user.id)
            self.repo.add_notification(
                Notification(
                    id=new_uuid(),
                    apartment_id=apartment_id,
                    user_id=user.id,
                    flat_id=flat_id,
                    source_type="notice",
                    source_id=notice.id,
                    title=notice.title,
                    body=notice.content,
                    priority=priority,
                    delivered_at=now,
                )
            )

    def _user_in_audience(
        self,
        apartment_id: str,
        user_id: str,
        role: str,
        audience: str,
        block_ids: list[str],
    ) -> bool:
        if audience == "all":
            return role in {"admin", "inspector", "resident"}
        if audience == "owners":
            return role in {"admin", "inspector"} or self._user_is_owner(apartment_id, user_id)
        if audience == "tenants":
            return role in {"admin", "inspector"} or self._user_is_tenant(apartment_id, user_id)
        if audience == "block":
            flat_id = self.repo.user_flat_id(apartment_id, user_id)
            if role in {"admin", "inspector"}:
                return True
            return flat_id is not None and self.repo.flat_in_blocks(flat_id, block_ids)
        return False

    def _user_is_owner(self, apartment_id: str, user_id: str) -> bool:
        flat_id = self.repo.user_flat_id(apartment_id, user_id)
        if not flat_id:
            return False
        from sqlalchemy import select
        from app.models.people import OwnerProfile

        return bool(
            self.repo.db.scalar(
                select(OwnerProfile.id).where(
                    OwnerProfile.flat_id == flat_id,
                    OwnerProfile.apartment_id == apartment_id,
                    OwnerProfile.ownership_end_date.is_(None),
                    OwnerProfile.deleted_at.is_(None),
                )
            )
        )

    def _user_is_tenant(self, apartment_id: str, user_id: str) -> bool:
        flat_id = self.repo.user_flat_id(apartment_id, user_id)
        if not flat_id:
            return False
        from sqlalchemy import select
        from app.models.people import TenantProfile

        return bool(
            self.repo.db.scalar(
                select(TenantProfile.id).where(
                    TenantProfile.flat_id == flat_id,
                    TenantProfile.apartment_id == apartment_id,
                    TenantProfile.lease_end_date.is_(None),
                    TenantProfile.deleted_at.is_(None),
                )
            )
        )
