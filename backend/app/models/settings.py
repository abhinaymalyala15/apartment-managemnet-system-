from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, BaseModelMixin, new_uuid


class SystemPreference(Base, BaseModelMixin):
    __tablename__ = "system_preferences"
    __table_args__ = (UniqueConstraint("apartment_id", name="uq_system_preferences_apartment"),)

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata", nullable=False)
    date_format: Mapped[str] = mapped_column(String(20), default="DD/MM/YYYY", nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    locale: Mapped[str] = mapped_column(String(10), default="en-IN", nullable=False)
    fiscal_year_start_month: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    default_notice_channel: Mapped[str] = mapped_column(String(20), default="app", nullable=False)
    auto_archive_notices_days: Mapped[int] = mapped_column(Integer, default=90, nullable=False)


class CommitteeMember(Base, BaseModelMixin):
    __tablename__ = "committee_members"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class EmergencyContact(Base, BaseModelMixin):
    __tablename__ = "emergency_contacts"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    hours: Mapped[str | None] = mapped_column(String(100), nullable=True)
    role: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class OfficeContact(Base, BaseModelMixin):
    __tablename__ = "office_contacts"
    __table_args__ = (UniqueConstraint("apartment_id", name="uq_office_contacts_apartment"),)

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(255), default="Society Office", nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hours: Mapped[str | None] = mapped_column(String(100), nullable=True)


class IntegrationSetting(Base, BaseModelMixin):
    __tablename__ = "integration_settings"
    __table_args__ = (UniqueConstraint("apartment_id", "integration_code", name="uq_integration_code"),)

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    integration_code: Mapped[str] = mapped_column(String(50), nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    config_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    phase: Mapped[str | None] = mapped_column(String(50), nullable=True)


class GalleryImage(Base, BaseModelMixin):
    __tablename__ = "gallery_images"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
