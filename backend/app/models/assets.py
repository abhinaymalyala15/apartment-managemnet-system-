from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, BaseModelMixin, new_uuid


class FacilityVendor(Base, BaseModelMixin):
    __tablename__ = "facility_vendors"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True)

    asset_links: Mapped[list["AssetVendorLink"]] = relationship(back_populates="vendor")
    assets: Mapped[list["CommunityAsset"]] = relationship(
        back_populates="primary_vendor", foreign_keys="CommunityAsset.primary_vendor_id"
    )


class CommunityAsset(Base, BaseModelMixin):
    __tablename__ = "community_assets"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    block_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("blocks.id", ondelete="SET NULL"), nullable=True, index=True
    )
    flat_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_type: Mapped[str] = mapped_column(String(30), nullable=False)
    scope: Mapped[str] = mapped_column(String(20), default="community", nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    primary_vendor_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("facility_vendors.id", ondelete="SET NULL"), nullable=True
    )
    installation_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    warranty_expiry: Mapped[date | None] = mapped_column(Date, nullable=True)
    last_service_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_service_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    amc_expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)

    primary_vendor: Mapped["FacilityVendor | None"] = relationship(
        back_populates="assets", foreign_keys=[primary_vendor_id]
    )
    vendor_links: Mapped[list["AssetVendorLink"]] = relationship(back_populates="asset")
    amc_records: Mapped[list["AssetAmcRecord"]] = relationship(back_populates="asset")
    service_records: Mapped[list["AssetServiceRecord"]] = relationship(back_populates="asset")
    internal_notes: Mapped[list["AssetInternalNote"]] = relationship(back_populates="asset")


class AssetVendorLink(Base):
    __tablename__ = "asset_vendor_links"
    __table_args__ = (UniqueConstraint("asset_id", "vendor_id", "link_type", name="uq_asset_vendor_link"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    asset_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("community_assets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vendor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("facility_vendors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    link_type: Mapped[str] = mapped_column(String(30), default="service", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    asset: Mapped["CommunityAsset"] = relationship(back_populates="vendor_links")
    vendor: Mapped["FacilityVendor"] = relationship(back_populates="asset_links")


class AssetAmcRecord(Base, BaseModelMixin):
    __tablename__ = "asset_amc_records"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    asset_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("community_assets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vendor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("facility_vendors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    renewal_reminder_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_current: Mapped[bool] = mapped_column(default=True, nullable=False)

    asset: Mapped["CommunityAsset"] = relationship(back_populates="amc_records")
    vendor: Mapped["FacilityVendor"] = relationship("FacilityVendor")


class AssetServiceRecord(Base, BaseModelMixin):
    __tablename__ = "asset_service_records"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    asset_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("community_assets.id", ondelete="SET NULL"), nullable=True, index=True
    )
    flat_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="SET NULL"), nullable=True, index=True
    )
    scope: Mapped[str] = mapped_column(String(20), default="community", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    service_type: Mapped[str] = mapped_column(String(100), nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    vendor_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("facility_vendors.id", ondelete="SET NULL"), nullable=True
    )
    technician: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="scheduled", nullable=False)
    frequency: Mapped[str | None] = mapped_column(String(50), nullable=True)
    next_due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

    asset: Mapped["CommunityAsset | None"] = relationship(back_populates="service_records")
    vendor: Mapped["FacilityVendor | None"] = relationship("FacilityVendor")


class ServiceSchedule(Base, BaseModelMixin):
    __tablename__ = "service_schedules"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    flat_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    service_type: Mapped[str] = mapped_column(String(100), nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    vendor_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    vendor_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("facility_vendors.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(20), default="scheduled", nullable=False)
    last_service_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    frequency: Mapped[str | None] = mapped_column(String(50), nullable=True)

    vendor: Mapped["FacilityVendor | None"] = relationship("FacilityVendor")
    flat: Mapped["Flat | None"] = relationship("Flat")


class AssetInternalNote(Base):
    __tablename__ = "asset_internal_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    asset_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("community_assets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    author_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    author_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    asset: Mapped["CommunityAsset"] = relationship(back_populates="internal_notes")


from app.models.structure import Flat  # noqa: E402
