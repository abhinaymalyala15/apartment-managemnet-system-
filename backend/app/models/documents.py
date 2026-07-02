import json
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, BaseModelMixin, new_uuid


class Document(Base, BaseModelMixin):
    __tablename__ = "documents"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    entity_type: Mapped[str] = mapped_column(String(30), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    file_label: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    uploaded_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class FlatInternalNote(Base):
    __tablename__ = "flat_internal_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    flat_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    author_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    author_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    apartment_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="SET NULL"), nullable=True, index=True
    )
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    old_values: Mapped[str | None] = mapped_column(Text, nullable=True)
    new_values: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    @staticmethod
    def dump_json(data: dict | None) -> str | None:
        return json.dumps(data) if data is not None else None
