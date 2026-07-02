from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class NoticeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: str | None = None
    category: str = "general"
    priority: str = "medium"
    audience: str = "all"
    is_emergency: bool = False
    author_name: str | None = None
    block_ids: list[str] = Field(default_factory=list)


class NoticeCreate(NoticeBase):
    lifecycle_status: str = "draft"


class NoticeUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=500)
    content: str | None = None
    category: str | None = None
    priority: str | None = None
    audience: str | None = None
    is_emergency: bool | None = None
    author_name: str | None = None
    block_ids: list[str] | None = None


class NoticeRead(NoticeBase, ORMModel):
    id: str
    apartment_id: str
    lifecycle_status: str
    author_user_id: str | None
    scheduled_at: datetime | None
    published_at: datetime | None
    archived_at: datetime | None
    archived_by: str | None
    last_edited_at: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime
    block_ids: list[str] = Field(default_factory=list)


class NoticeScheduleRequest(BaseModel):
    scheduled_at: datetime
    actor_name: str | None = None


class NoticePublishRequest(BaseModel):
    actor_name: str | None = None


class NoticeArchiveRequest(BaseModel):
    actor_name: str | None = None


class EmergencyNoticeCreate(NoticeBase):
    pass


class NoticeHistoryRead(ORMModel):
    id: str
    apartment_id: str
    notice_id: str
    notice_title: str
    action: str
    actor_user_id: str | None
    actor_name: str
    detail: str | None
    occurred_at: datetime


class NotificationRead(ORMModel):
    id: str
    apartment_id: str
    user_id: str | None
    flat_id: str | None
    source_type: str
    source_id: str
    title: str
    body: str | None
    priority: str
    read_at: datetime | None
    delivered_at: datetime | None
    is_active: bool
    created_at: datetime


class TimelineEventRead(ORMModel):
    id: str
    apartment_id: str
    entity_type: str
    entity_id: str
    flat_id: str | None
    asset_id: str | None
    event_type: str
    title: str
    description: str | None
    event_date: datetime
    source_table: str | None
    source_id: str | None
    href: str | None
    actor_user_id: str | None
    created_at: datetime


class CommunicationSummary(BaseModel):
    published_count: int
    draft_count: int
    scheduled_count: int
    archived_count: int
    emergency_count: int
