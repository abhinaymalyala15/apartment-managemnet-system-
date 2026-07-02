from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, BaseModelMixin

if TYPE_CHECKING:
    from app.models.people import FamilyMemberProfile, OwnerProfile, TenantProfile


class Apartment(Base, BaseModelMixin):
    __tablename__ = "apartments"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    tagline: Mapped[str | None] = mapped_column(String(500), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pincode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    registration_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    year_established: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    blocks: Mapped[list["Block"]] = relationship(back_populates="apartment")
    flats: Mapped[list["Flat"]] = relationship(back_populates="apartment")


class Block(Base, BaseModelMixin):
    __tablename__ = "blocks"
    __table_args__ = (UniqueConstraint("apartment_id", "code", name="uq_blocks_apartment_code"),)

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    floor_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_flats: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    apartment: Mapped["Apartment"] = relationship(back_populates="blocks")
    floors: Mapped[list["Floor"]] = relationship(back_populates="block")
    flats: Mapped[list["Flat"]] = relationship(back_populates="block")


class Floor(Base, BaseModelMixin):
    __tablename__ = "floors"
    __table_args__ = (UniqueConstraint("block_id", "floor_number", name="uq_floors_block_number"),)

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    block_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("blocks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    floor_number: Mapped[int] = mapped_column(Integer, nullable=False)
    label: Mapped[str | None] = mapped_column(String(50), nullable=True)
    flat_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    block: Mapped["Block"] = relationship(back_populates="floors")
    flats: Mapped[list["Flat"]] = relationship(back_populates="floor_rel")


class Flat(Base, BaseModelMixin):
    __tablename__ = "flats"
    __table_args__ = (
        UniqueConstraint("apartment_id", "block_id", "flat_number", name="uq_flats_block_number"),
    )

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    block_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("blocks.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    floor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("floors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    flat_number: Mapped[str] = mapped_column(String(20), nullable=False)
    floor: Mapped[int] = mapped_column(Integer, nullable=False)
    area_sqft: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    flat_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    parking_slots: Mapped[int | None] = mapped_column(Integer, nullable=True)
    occupancy_status: Mapped[str] = mapped_column(String(20), default="vacant", nullable=False)

    apartment: Mapped["Apartment"] = relationship(back_populates="flats")
    block: Mapped["Block"] = relationship(back_populates="flats")
    floor_rel: Mapped["Floor"] = relationship(back_populates="flats")
    owner_profiles: Mapped[list[OwnerProfile]] = relationship(
        "OwnerProfile", back_populates="flat"
    )
    tenant_profiles: Mapped[list[TenantProfile]] = relationship(
        "TenantProfile", back_populates="flat"
    )
    family_profiles: Mapped[list[FamilyMemberProfile]] = relationship(
        "FamilyMemberProfile", back_populates="flat"
    )
