from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.exceptions import ConflictError, ForbiddenError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.db.base import new_uuid
from app.models.auth import ApartmentMembership, PlatformRole, RefreshToken, User
from app.models.structure import Apartment, Flat
from app.repositories.auth_repository import AuthRepository, hash_token
from app.schemas.auth import (
    AdminRoleRead,
    ChangePasswordRequest,
    LoginRequest,
    MeResponse,
    MembershipCreate,
    MembershipRead,
    PermissionRead,
    PersonSummary,
    TokenResponse,
    UserCreate,
)
from sqlalchemy import select
from sqlalchemy.orm import Session


class AuthService:
    VALID_MEMBERSHIP_ROLES = {"admin", "inspector", "resident"}

    def __init__(self, repo: AuthRepository, db: Session):
        self.repo = repo
        self.db = db

    def _check_lockout(self, email: str) -> None:
        since = datetime.now(timezone.utc) - timedelta(minutes=settings.login_lockout_minutes)
        failures = self.repo.failed_attempts_since(email, since)
        if failures >= settings.max_login_attempts:
            raise ForbiddenError("Account temporarily locked due to failed login attempts")

    def _membership_claims(self, user: User) -> list[dict]:
        return [
            {
                "apartment_id": m.apartment_id,
                "role": m.role,
                "flat_id": m.flat_id,
            }
            for m in user.memberships
            if m.is_active and m.deleted_at is None
        ]

    def _issue_tokens(
        self, user: User, apartment_id: str | None = None, ip: str | None = None
    ) -> TokenResponse:
        family_id = new_uuid()
        claims = {
            "email": user.email,
            "platform_role": user.platform_role.role if user.platform_role else None,
            "memberships": self._membership_claims(user),
        }
        access = create_access_token(user.id, claims)
        refresh, expires = create_refresh_token(user.id, family_id)

        self.repo.store_refresh_token(
            RefreshToken(
                id=new_uuid(),
                user_id=user.id,
                token_hash=hash_token(refresh),
                family_id=family_id,
                apartment_id=apartment_id,
                ip_address=ip,
                expires_at=expires,
            )
        )
        return TokenResponse(
            access_token=access,
            refresh_token=refresh,
            expires_in=settings.access_token_expire_minutes * 60,
        )

    def login(self, data: LoginRequest, ip: str | None = None) -> TokenResponse:
        self._check_lockout(data.email)
        user = self.repo.get_user_by_email(data.email)
        if not user or not user.is_active:
            self.repo.record_login_attempt(data.email, False, ip)
            raise UnauthorizedError("Invalid email or password")
        if not verify_password(data.password, user.password_hash):
            self.repo.record_login_attempt(data.email, False, ip)
            raise UnauthorizedError("Invalid email or password")

        user.last_login_at = datetime.now(timezone.utc)
        self.repo.update_user(user)
        self.repo.record_login_attempt(data.email, True, ip)
        return self._issue_tokens(user, ip=ip)

    def _aware(self, dt: datetime) -> datetime:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    def refresh(self, refresh_token: str, ip: str | None = None) -> TokenResponse:
        from app.core.security import safe_decode_token

        payload = safe_decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid refresh token")

        stored = self.repo.get_refresh_token_by_hash(hash_token(refresh_token))
        if not stored or self._aware(stored.expires_at) < datetime.now(timezone.utc):
            if stored:
                self.repo.revoke_token_family(stored.family_id)
            raise UnauthorizedError("Refresh token expired or revoked")

        user = self.repo.get_user_by_id(payload["sub"])
        if not user or not user.is_active:
            raise UnauthorizedError("User not found")

        self.repo.revoke_refresh_token(stored)
        return self._issue_tokens(user, apartment_id=stored.apartment_id, ip=ip)

    def logout(self, refresh_token: str) -> None:
        stored = self.repo.get_refresh_token_by_hash(hash_token(refresh_token))
        if stored:
            self.repo.revoke_refresh_token(stored)

    def change_password(self, user_id: str, data: ChangePasswordRequest) -> None:
        user = self.repo.get_user_by_id(user_id)
        if not user:
            raise UnauthorizedError()
        if not verify_password(data.current_password, user.password_hash):
            raise UnauthorizedError("Current password is incorrect")
        user.password_hash = hash_password(data.new_password)
        self.repo.update_user(user)
        self.repo.revoke_user_tokens(user.id)

    def get_me(self, user_id: str) -> MeResponse:
        user = self.repo.get_user_by_id(user_id)
        if not user:
            raise UnauthorizedError()

        apartment_names = {
            a.id: a.name
            for a in self.db.scalars(
                select(Apartment).where(
                    Apartment.id.in_([m.apartment_id for m in user.memberships])
                )
            ).all()
        }
        flat_numbers = {
            f.id: f.flat_number
            for f in self.db.scalars(
                select(Flat).where(Flat.id.in_([m.flat_id for m in user.memberships if m.flat_id]))
            ).all()
        }

        memberships: list[MembershipRead] = []
        for m in user.memberships:
            if not m.is_active or m.deleted_at:
                continue
            admin_label = m.admin_role.label if m.admin_role else None
            memberships.append(
                MembershipRead(
                    id=m.id,
                    apartment_id=m.apartment_id,
                    apartment_name=apartment_names.get(m.apartment_id),
                    role=m.role,
                    flat_id=m.flat_id,
                    flat_number=flat_numbers.get(m.flat_id) if m.flat_id else None,
                    admin_role_id=m.admin_role_id,
                    admin_role_label=admin_label,
                )
            )

        person = None
        if user.person:
            person = PersonSummary(
                id=user.person.id,
                full_name=user.person.full_name,
                email=user.person.email,
                phone=user.person.phone,
            )

        return MeResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            person=person,
            platform_role=user.platform_role.role if user.platform_role else None,
            memberships=memberships,
        )

    def register_user(self, data: UserCreate) -> User:
        if self.repo.get_user_by_email(data.email):
            raise ConflictError("Email already registered")
        user = User(
            id=new_uuid(),
            email=data.email.lower(),
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            phone=data.phone,
            person_id=data.person_id,
        )
        return self.repo.create_user(user)

    def add_membership(self, user_id: str, data: MembershipCreate) -> ApartmentMembership:
        if data.role not in self.VALID_MEMBERSHIP_ROLES:
            raise ConflictError(f"Invalid role: {data.role}")
        if data.role == "resident" and not data.flat_id:
            raise ConflictError("flat_id required for resident role")

        user = self.repo.get_user_by_id(user_id)
        if not user:
            raise UnauthorizedError("User not found")

        existing = next((m for m in user.memberships if m.apartment_id == data.apartment_id), None)
        if existing and existing.deleted_at is None:
            raise ConflictError("User already has membership for this apartment")

        membership = ApartmentMembership(
            id=new_uuid(),
            user_id=user_id,
            apartment_id=data.apartment_id,
            role=data.role,
            flat_id=data.flat_id,
            admin_role_id=data.admin_role_id,
        )
        return self.repo.create_membership(membership)

    def list_permissions(self) -> list[PermissionRead]:
        return [PermissionRead.model_validate(p) for p in self.repo.list_permissions()]

    def list_admin_roles(self, apartment_id: str) -> list[AdminRoleRead]:
        roles = self.repo.list_admin_roles(apartment_id)
        result = []
        for role in roles:
            perms = [
                PermissionRead.model_validate(rp.permission)
                for rp in role.permissions
                if rp.permission
            ]
            result.append(
                AdminRoleRead(
                    id=role.id,
                    code=role.code,
                    label=role.label,
                    description=role.description,
                    scope=role.scope,
                    permissions=perms,
                )
            )
        return result

    def grant_platform_role(self, user_id: str, role: str = "super_admin") -> PlatformRole:
        user = self.repo.get_user_by_id(user_id)
        if not user:
            raise UnauthorizedError("User not found")
        if user.platform_role:
            raise ConflictError("User already has platform role")
        platform_role = PlatformRole(id=new_uuid(), user_id=user_id, role=role)
        return self.repo.create_platform_role(platform_role)
