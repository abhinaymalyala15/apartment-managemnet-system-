import hashlib
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.auth import (
    AdminRoleDefinition,
    ApartmentMembership,
    LoginAttempt,
    Permission,
    PlatformRole,
    RefreshToken,
    RolePermission,
    User,
)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _active(model):
    return model.deleted_at.is_(None)


class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.scalar(
            select(User)
            .options(joinedload(User.platform_role), joinedload(User.memberships))
            .where(func.lower(User.email) == email.lower(), _active(User))
        )

    def get_user_by_id(self, user_id: str) -> User | None:
        return self.db.scalar(
            select(User)
            .options(
                joinedload(User.platform_role),
                joinedload(User.memberships).joinedload(ApartmentMembership.admin_role),
                joinedload(User.person),
            )
            .where(User.id == user_id, _active(User))
        )

    def create_user(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def create_platform_role(self, role: PlatformRole) -> PlatformRole:
        self.db.add(role)
        self.db.commit()
        return role

    def create_membership(self, membership: ApartmentMembership) -> ApartmentMembership:
        self.db.add(membership)
        self.db.commit()
        self.db.refresh(membership)
        return membership

    def store_refresh_token(self, token: RefreshToken) -> RefreshToken:
        self.db.add(token)
        self.db.commit()
        return token

    def get_refresh_token_by_hash(self, token_hash: str) -> RefreshToken | None:
        return self.db.scalar(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
            )
        )

    def revoke_refresh_token(self, token: RefreshToken) -> None:
        token.revoked_at = datetime.now(timezone.utc)
        self.db.commit()

    def revoke_user_tokens(self, user_id: str) -> None:
        tokens = self.db.scalars(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
            )
        ).all()
        now = datetime.now(timezone.utc)
        for token in tokens:
            token.revoked_at = now
        self.db.commit()

    def revoke_token_family(self, family_id: str) -> None:
        tokens = self.db.scalars(
            select(RefreshToken).where(
                RefreshToken.family_id == family_id,
                RefreshToken.revoked_at.is_(None),
            )
        ).all()
        now = datetime.now(timezone.utc)
        for token in tokens:
            token.revoked_at = now
        self.db.commit()

    def record_login_attempt(self, email: str, success: bool, ip: str | None) -> None:
        self.db.add(LoginAttempt(email=email.lower(), success=success, ip_address=ip))
        self.db.commit()

    def failed_attempts_since(self, email: str, since: datetime) -> int:
        return (
            self.db.scalar(
                select(func.count())
                .select_from(LoginAttempt)
                .where(
                    LoginAttempt.email == email.lower(),
                    LoginAttempt.success.is_(False),
                    LoginAttempt.created_at >= since,
                )
            )
            or 0
        )

    def list_permissions(self) -> list[Permission]:
        return list(self.db.scalars(select(Permission).order_by(Permission.module, Permission.code)).all())

    def list_admin_roles(self, apartment_id: str) -> list[AdminRoleDefinition]:
        return list(
            self.db.scalars(
                select(AdminRoleDefinition)
                .options(joinedload(AdminRoleDefinition.permissions).joinedload(RolePermission.permission))
                .where(AdminRoleDefinition.apartment_id == apartment_id, _active(AdminRoleDefinition))
                .order_by(AdminRoleDefinition.label)
            )
            .unique()
            .all()
        )

    def get_admin_role(self, apartment_id: str, role_id: str) -> AdminRoleDefinition | None:
        return self.db.execute(
            select(AdminRoleDefinition)
            .options(joinedload(AdminRoleDefinition.permissions).joinedload(RolePermission.permission))
            .where(
                AdminRoleDefinition.id == role_id,
                AdminRoleDefinition.apartment_id == apartment_id,
                _active(AdminRoleDefinition),
            )
        ).unique().scalar_one_or_none()

    def get_admin_role_by_code(self, apartment_id: str, code: str) -> AdminRoleDefinition | None:
        return self.db.scalar(
            select(AdminRoleDefinition).where(
                AdminRoleDefinition.apartment_id == apartment_id,
                AdminRoleDefinition.code == code,
                _active(AdminRoleDefinition),
            )
        )

    def get_permission_by_code(self, code: str) -> Permission | None:
        return self.db.scalar(select(Permission).where(Permission.code == code))

    def create_permission(self, permission: Permission) -> Permission:
        self.db.add(permission)
        self.db.commit()
        self.db.refresh(permission)
        return permission

    def create_admin_role(self, role: AdminRoleDefinition, permission_ids: list[str]) -> AdminRoleDefinition:
        self.db.add(role)
        self.db.flush()
        for pid in permission_ids:
            self.db.add(RolePermission(role_id=role.id, permission_id=pid))
        self.db.commit()
        return self.get_admin_role(role.apartment_id, role.id)  # type: ignore[return-value]

    def link_person(self, user: User, person_id: str) -> User:
        user.person_id = person_id
        self.db.commit()
        self.db.refresh(user)
        return user
