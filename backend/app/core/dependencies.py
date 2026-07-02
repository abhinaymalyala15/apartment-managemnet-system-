import hashlib
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import safe_decode_token
from app.db.session import get_db
from app.models.auth import ApartmentMembership, PlatformRole, User

bearer_scheme = HTTPBearer(auto_error=False)

MEMBERSHIP_ROLES = {"admin", "inspector", "resident"}
PLATFORM_ROLES = {"super_admin"}


@dataclass
class MembershipContext:
    id: str
    apartment_id: str
    role: str
    flat_id: str | None
    admin_role_id: str | None


@dataclass
class AuthContext:
    user_id: str
    email: str
    full_name: str
    person_id: str | None
    platform_role: str | None
    memberships: list[MembershipContext]


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def get_auth_context(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> AuthContext:
    if not credentials:
        raise UnauthorizedError()
    payload = safe_decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedError("Invalid or expired token")

    user = db.scalar(
        select(User)
        .options(
            joinedload(User.platform_role),
            joinedload(User.memberships),
        )
        .where(User.id == payload["sub"], User.deleted_at.is_(None), User.is_active.is_(True))
    )
    if not user:
        raise UnauthorizedError("User not found")

    active_memberships = [
        MembershipContext(
            id=m.id,
            apartment_id=m.apartment_id,
            role=m.role,
            flat_id=m.flat_id,
            admin_role_id=m.admin_role_id,
        )
        for m in user.memberships
        if m.is_active and m.deleted_at is None
    ]

    return AuthContext(
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        person_id=user.person_id,
        platform_role=user.platform_role.role if user.platform_role else None,
        memberships=active_memberships,
    )


def require_platform_role(*roles: str):
    def dependency(ctx: AuthContext = Depends(get_auth_context)) -> AuthContext:
        if ctx.platform_role not in roles:
            raise ForbiddenError()
        return ctx

    return dependency


def require_membership_role(*roles: str):
    def dependency(
        apartment_id: str,
        ctx: AuthContext = Depends(get_auth_context),
    ) -> AuthContext:
        if ctx.platform_role == "super_admin":
            return ctx
        if not any(m.apartment_id == apartment_id and m.role in roles for m in ctx.memberships):
            raise ForbiddenError()
        return ctx

    return dependency


def optional_auth_context(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> AuthContext | None:
    if not credentials:
        return None
    try:
        return get_auth_context(credentials, db)
    except UnauthorizedError:
        return None
