from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, BaseModelMixin, new_uuid


class Notice(Base, BaseModelMixin):
    __tablename__ = "notices"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(20), default="general", nullable=False)
    priority: Mapped[str] = mapped_column(String(10), default="medium", nullable=False)
    audience: Mapped[str] = mapped_column(String(20), default="all", nullable=False)
    lifecycle_status: Mapped[str] = mapped_column(String(20), default="draft", nullable=False)
    is_emergency: Mapped[bool] = mapped_column(default=False, nullable=False)
    author_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    author_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    archived_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    last_edited_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    block_targets: Mapped[list["NoticeBlockTarget"]] = relationship(
        back_populates="notice", cascade="all, delete-orphan"
    )


class NoticeBlockTarget(Base):
    __tablename__ = "notice_block_targets"
    __table_args__ = (UniqueConstraint("notice_id", "block_id", name="uq_notice_block_target"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    notice_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("notices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    block_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("blocks.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    notice: Mapped["Notice"] = relationship(back_populates="block_targets")


class NoticeHistoryEvent(Base):
    __tablename__ = "notice_history_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    notice_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("notices.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    notice_title: Mapped[str] = mapped_column(String(500), nullable=False)
    action: Mapped[str] = mapped_column(String(30), nullable=False)
    actor_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    actor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Notification(Base, BaseModelMixin):
    __tablename__ = "notifications"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    flat_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="SET NULL"), nullable=True, index=True
    )
    source_type: Mapped[str] = mapped_column(String(30), nullable=False)
    source_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(10), default="medium", nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    entity_type: Mapped[str] = mapped_column(String(30), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False)
    flat_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="SET NULL"), nullable=True, index=True
    )
    asset_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source_table: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    href: Mapped[str | None] = mapped_column(String(500), nullable=True)
    actor_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
