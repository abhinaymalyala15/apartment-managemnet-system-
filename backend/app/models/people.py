from datetime import date, datetime, timezone

from sqlalchemy import Date, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, BaseModelMixin


class FlatScopeMixin:
    """Denormalized flat hierarchy for fast tenant-scoped queries."""

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    block_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("blocks.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    floor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("floors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    flat_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False, index=True
    )


class Person(Base, BaseModelMixin):
    """Canonical identity — one row per human within an apartment."""

    __tablename__ = "persons"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    alternate_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    owner_profiles: Mapped[list["OwnerProfile"]] = relationship(back_populates="person")
    tenant_profiles: Mapped[list["TenantProfile"]] = relationship(back_populates="person")
    family_profiles: Mapped[list["FamilyMemberProfile"]] = relationship(back_populates="person")
    staff_profile: Mapped["StaffProfile | None"] = relationship(back_populates="person")


class OwnerProfile(Base, BaseModelMixin, FlatScopeMixin):
    __tablename__ = "owner_profiles"

    person_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("persons.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    is_primary: Mapped[bool] = mapped_column(default=False, nullable=False)
    ownership_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    ownership_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    person: Mapped["Person"] = relationship(back_populates="owner_profiles")
    flat: Mapped["Flat"] = relationship("Flat", back_populates="owner_profiles")


class TenantProfile(Base, BaseModelMixin, FlatScopeMixin):
    __tablename__ = "tenant_profiles"

    person_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("persons.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    lease_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    lease_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    person: Mapped["Person"] = relationship(back_populates="tenant_profiles")
    flat: Mapped["Flat"] = relationship("Flat", back_populates="tenant_profiles")


class FamilyMemberProfile(Base, BaseModelMixin, FlatScopeMixin):
    __tablename__ = "family_member_profiles"

    person_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("persons.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    relation_type: Mapped[str] = mapped_column("relationship", String(50), nullable=False)
    marriage_anniversary: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_emergency_contact: Mapped[bool] = mapped_column(default=False, nullable=False)

    person: Mapped["Person"] = relationship(back_populates="family_profiles")
    flat: Mapped["Flat"] = relationship("Flat", back_populates="family_profiles")


class StaffProfile(Base, BaseModelMixin):
    __tablename__ = "staff_profiles"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    person_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("persons.id", ondelete="RESTRICT"), nullable=False, unique=True
    )
    role_code: Mapped[str] = mapped_column(String(50), nullable=False)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    joined_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    person: Mapped["Person"] = relationship(back_populates="staff_profile")
    block_scopes: Mapped[list["StaffBlockScope"]] = relationship(
        back_populates="staff", cascade="all, delete-orphan"
    )


class StaffBlockScope(Base, BaseModelMixin):
    __tablename__ = "staff_block_scopes"
    __table_args__ = (UniqueConstraint("staff_id", "block_id", name="uq_staff_block_scope"),)

    staff_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("staff_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    block_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("blocks.id", ondelete="CASCADE"), nullable=False, index=True
    )

    staff: Mapped["StaffProfile"] = relationship(back_populates="block_scopes")


class OccupancyHistory(Base, BaseModelMixin):
    """Append-only move-in / move-out trail."""

    __tablename__ = "occupancy_history"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    flat_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(20), nullable=False)
    person_type: Mapped[str] = mapped_column(String(20), nullable=False)
    person_id: Mapped[str] = mapped_column(String(36), ForeignKey("persons.id"), nullable=False)
    profile_id: Mapped[str] = mapped_column(String(36), nullable=False)
    person_name: Mapped[str] = mapped_column(String(255), nullable=False)
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
