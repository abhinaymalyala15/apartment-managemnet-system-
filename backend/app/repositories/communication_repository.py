from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.db.base import new_uuid
from app.models.auth import ApartmentMembership, User
from app.models.communication import (
    Notice,
    NoticeBlockTarget,
    NoticeHistoryEvent,
    Notification,
    TimelineEvent,
)
from app.models.people import OwnerProfile, TenantProfile
from app.models.structure import Block, Flat


def _active(model):
    return model.deleted_at.is_(None)


class CommunicationRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_notices(
        self,
        apartment_id: str,
        lifecycle_status: str | None = None,
        category: str | None = None,
        is_emergency: bool | None = None,
    ) -> list[Notice]:
        stmt = (
            select(Notice)
            .options(joinedload(Notice.block_targets))
            .where(Notice.apartment_id == apartment_id, _active(Notice))
        )
        if lifecycle_status:
            stmt = stmt.where(Notice.lifecycle_status == lifecycle_status)
        if category:
            stmt = stmt.where(Notice.category == category)
        if is_emergency is not None:
            stmt = stmt.where(Notice.is_emergency == is_emergency)
        stmt = stmt.order_by(
            Notice.published_at.desc().nullslast(),
            Notice.last_edited_at.desc(),
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_notice(self, apartment_id: str, notice_id: str) -> Notice | None:
        return self.db.scalar(
            select(Notice)
            .options(joinedload(Notice.block_targets))
            .where(
                Notice.id == notice_id,
                Notice.apartment_id == apartment_id,
                _active(Notice),
            )
        )

    def create_notice(self, notice: Notice, block_ids: list[str]) -> Notice:
        self._set_block_targets(notice, block_ids)
        self.db.add(notice)
        self.db.commit()
        self.db.refresh(notice)
        return notice

    def update_notice(self, notice: Notice, block_ids: list[str] | None = None) -> Notice:
        if block_ids is not None:
            notice.block_targets.clear()
            self._set_block_targets(notice, block_ids)
        self.db.commit()
        self.db.refresh(notice)
        return notice

    def _set_block_targets(self, notice: Notice, block_ids: list[str]) -> None:
        for block_id in block_ids:
            notice.block_targets.append(
                NoticeBlockTarget(id=new_uuid(), notice_id=notice.id, block_id=block_id)
            )

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, obj):
        self.db.refresh(obj)
        return obj

    def add_history(self, event: NoticeHistoryEvent) -> NoticeHistoryEvent:
        self.db.add(event)
        return event

    def add_timeline(self, event: TimelineEvent) -> TimelineEvent:
        self.db.add(event)
        return event

    def add_notification(self, notification: Notification) -> Notification:
        self.db.add(notification)
        return notification

    def list_history(self, apartment_id: str, notice_id: str | None = None) -> list[NoticeHistoryEvent]:
        stmt = select(NoticeHistoryEvent).where(NoticeHistoryEvent.apartment_id == apartment_id)
        if notice_id:
            stmt = stmt.where(NoticeHistoryEvent.notice_id == notice_id)
        stmt = stmt.order_by(NoticeHistoryEvent.occurred_at.desc())
        return list(self.db.scalars(stmt).all())

    def list_notifications(
        self,
        apartment_id: str,
        user_id: str | None = None,
        flat_id: str | None = None,
        unread_only: bool = False,
    ) -> list[Notification]:
        stmt = select(Notification).where(
            Notification.apartment_id == apartment_id,
            _active(Notification),
        )
        if user_id:
            stmt = stmt.where(Notification.user_id == user_id)
        if flat_id:
            stmt = stmt.where(Notification.flat_id == flat_id)
        if unread_only:
            stmt = stmt.where(Notification.read_at.is_(None))
        stmt = stmt.order_by(Notification.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def get_notification(self, apartment_id: str, notification_id: str) -> Notification | None:
        return self.db.scalar(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.apartment_id == apartment_id,
                _active(Notification),
            )
        )

    def list_timeline(
        self,
        apartment_id: str,
        flat_id: str | None = None,
        entity_type: str | None = None,
        limit: int = 50,
    ) -> list[TimelineEvent]:
        stmt = select(TimelineEvent).where(TimelineEvent.apartment_id == apartment_id)
        if flat_id:
            stmt = stmt.where(TimelineEvent.flat_id == flat_id)
        if entity_type:
            stmt = stmt.where(TimelineEvent.entity_type == entity_type)
        stmt = stmt.order_by(TimelineEvent.event_date.desc()).limit(limit)
        return list(self.db.scalars(stmt).all())

    def count_notices_by_status(self, apartment_id: str) -> dict[str, int]:
        rows = self.db.execute(
            select(Notice.lifecycle_status, func.count())
            .where(Notice.apartment_id == apartment_id, _active(Notice))
            .group_by(Notice.lifecycle_status)
        ).all()
        return {status: count for status, count in rows}

    def count_emergency_published(self, apartment_id: str) -> int:
        return self.db.scalar(
            select(func.count())
            .select_from(Notice)
            .where(
                Notice.apartment_id == apartment_id,
                Notice.lifecycle_status == "published",
                Notice.is_emergency.is_(True),
                _active(Notice),
            )
        ) or 0

    def get_block(self, apartment_id: str, block_id: str) -> Block | None:
        return self.db.scalar(
            select(Block).where(
                Block.id == block_id,
                Block.apartment_id == apartment_id,
                _active(Block),
            )
        )

    def list_membership_users(self, apartment_id: str) -> list[tuple[User, ApartmentMembership]]:
        rows = self.db.execute(
            select(User, ApartmentMembership)
            .join(ApartmentMembership, ApartmentMembership.user_id == User.id)
            .where(
                ApartmentMembership.apartment_id == apartment_id,
                ApartmentMembership.is_active.is_(True),
                User.is_active.is_(True),
                _active(User),
                _active(ApartmentMembership),
            )
        ).all()
        return list(rows)

    def user_flat_id(self, apartment_id: str, user_id: str) -> str | None:
        membership = self.db.scalar(
            select(ApartmentMembership).where(
                ApartmentMembership.user_id == user_id,
                ApartmentMembership.apartment_id == apartment_id,
                _active(ApartmentMembership),
            )
        )
        if membership and membership.flat_id:
            return membership.flat_id

        user = self.db.scalar(select(User).where(User.id == user_id))
        if not user or not user.person_id:
            return None
        owner = self.db.scalar(
            select(OwnerProfile.flat_id).where(
                OwnerProfile.person_id == user.person_id,
                OwnerProfile.apartment_id == apartment_id,
                OwnerProfile.ownership_end_date.is_(None),
                _active(OwnerProfile),
            )
        )
        if owner:
            return owner
        return self.db.scalar(
            select(TenantProfile.flat_id).where(
                TenantProfile.person_id == user.person_id,
                TenantProfile.apartment_id == apartment_id,
                TenantProfile.lease_end_date.is_(None),
                _active(TenantProfile),
            )
        )

    def flat_in_blocks(self, flat_id: str, block_ids: list[str]) -> bool:
        block_id = self.db.scalar(select(Flat.block_id).where(Flat.id == flat_id))
        return block_id in block_ids if block_id else False

    @staticmethod
    def notice_block_ids(notice: Notice) -> list[str]:
        return [t.block_id for t in notice.block_targets]
