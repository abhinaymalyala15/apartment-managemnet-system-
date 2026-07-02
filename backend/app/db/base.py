import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    pass


class BaseModelMixin:
    """Shared base fields for every business table."""

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    updated_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_by: Mapped[str | None] = mapped_column(String(36), nullable=True)


class TenantMixin:
    """Mixin for tenant-scoped tables — override apartment_id with FK in each model."""

    apartment_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
