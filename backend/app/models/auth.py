from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, BaseModelMixin


class User(Base, BaseModelMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    person_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True
    )
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    person: Mapped["Person | None"] = relationship("Person", foreign_keys=[person_id])
    platform_role: Mapped["PlatformRole | None"] = relationship(back_populates="user")
    memberships: Mapped[list["ApartmentMembership"]] = relationship(back_populates="user")
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(back_populates="user")


class PlatformRole(Base, BaseModelMixin):
    __tablename__ = "platform_roles"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(30), default="super_admin", nullable=False)

    user: Mapped["User"] = relationship(back_populates="platform_role")


class Permission(Base, BaseModelMixin):
    __tablename__ = "permissions"

    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    module: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    role_links: Mapped[list["RolePermission"]] = relationship(back_populates="permission")


class AdminRoleDefinition(Base, BaseModelMixin):
    __tablename__ = "admin_role_definitions"
    __table_args__ = (UniqueConstraint("apartment_id", "code", name="uq_admin_roles_apartment_code"),)

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    scope: Mapped[str] = mapped_column(String(20), default="apartment", nullable=False)
    is_system: Mapped[bool] = mapped_column(default=True, nullable=False)

    permissions: Mapped[list["RolePermission"]] = relationship(back_populates="role")
    memberships: Mapped[list["ApartmentMembership"]] = relationship(back_populates="admin_role")


class RolePermission(Base, BaseModelMixin):
    __tablename__ = "role_permissions"
    __table_args__ = (UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),)

    role_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("admin_role_definitions.id", ondelete="CASCADE"), nullable=False
    )
    permission_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("permissions.id", ondelete="RESTRICT"), nullable=False
    )

    role: Mapped["AdminRoleDefinition"] = relationship(back_populates="permissions")
    permission: Mapped["Permission"] = relationship(back_populates="role_links")


class ApartmentMembership(Base, BaseModelMixin):
    __tablename__ = "apartment_memberships"
    __table_args__ = (UniqueConstraint("user_id", "apartment_id", name="uq_user_apartment"),)

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(30), nullable=False)
    flat_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="SET NULL"), nullable=True, index=True
    )
    admin_role_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("admin_role_definitions.id", ondelete="SET NULL"), nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="memberships")
    apartment: Mapped["Apartment"] = relationship("Apartment")
    flat: Mapped["Flat | None"] = relationship("Flat")
    admin_role: Mapped["AdminRoleDefinition | None"] = relationship(back_populates="memberships")


class RefreshToken(Base, BaseModelMixin):
    __tablename__ = "refresh_tokens"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    family_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    apartment_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="SET NULL"), nullable=True
    )
    device_info: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="refresh_tokens")


class LoginAttempt(Base, BaseModelMixin):
    __tablename__ = "login_attempts"

    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


from app.models.people import Person  # noqa: E402, F401
from app.models.structure import Apartment, Flat  # noqa: E402, F401
