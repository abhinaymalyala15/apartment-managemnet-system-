"""B4: authentication — users, roles, permissions, tokens

Revision ID: 003_auth
Revises: 002_people
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003_auth"
down_revision: Union[str, None] = "002_people"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TS = sa.text("(CURRENT_TIMESTAMP)")
BASE = [
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), server_default=TS, nullable=False),
    sa.Column("created_by", sa.String(36), nullable=True),
    sa.Column("updated_by", sa.String(36), nullable=True),
    sa.Column("is_active", sa.Boolean(), nullable=False),
    sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    sa.Column("deleted_by", sa.String(36), nullable=True),
]


def upgrade() -> None:
    op.create_table(
        "users",
        *BASE,
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("person_id", sa.String(36), sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True),
        sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_person_id", "users", ["person_id"])

    op.create_table(
        "permissions",
        *BASE,
        sa.Column("code", sa.String(100), nullable=False),
        sa.Column("module", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.UniqueConstraint("code"),
    )

    op.create_table(
        "platform_roles",
        *BASE,
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(30), nullable=False),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "admin_role_definitions",
        *BASE,
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("label", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("scope", sa.String(20), nullable=False),
        sa.Column("is_system", sa.Boolean(), nullable=False),
        sa.UniqueConstraint("apartment_id", "code", name="uq_admin_roles_apartment_code"),
    )
    op.create_index("ix_admin_role_definitions_apartment_id", "admin_role_definitions", ["apartment_id"])

    op.create_table(
        "role_permissions",
        *BASE,
        sa.Column("role_id", sa.String(36), sa.ForeignKey("admin_role_definitions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("permission_id", sa.String(36), sa.ForeignKey("permissions.id", ondelete="RESTRICT"), nullable=False),
        sa.UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )

    op.create_table(
        "apartment_memberships",
        *BASE,
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(30), nullable=False),
        sa.Column("flat_id", sa.String(36), sa.ForeignKey("flats.id", ondelete="SET NULL"), nullable=True),
        sa.Column("admin_role_id", sa.String(36), sa.ForeignKey("admin_role_definitions.id", ondelete="SET NULL"), nullable=True),
        sa.UniqueConstraint("user_id", "apartment_id", name="uq_user_apartment"),
    )
    op.create_index("ix_apartment_memberships_user_id", "apartment_memberships", ["user_id"])
    op.create_index("ix_apartment_memberships_apartment_id", "apartment_memberships", ["apartment_id"])

    op.create_table(
        "refresh_tokens",
        *BASE,
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(255), nullable=False),
        sa.Column("family_id", sa.String(36), nullable=False),
        sa.Column("apartment_id", sa.String(36), sa.ForeignKey("apartments.id", ondelete="SET NULL"), nullable=True),
        sa.Column("device_info", sa.String(255), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"])

    op.create_table(
        "login_attempts",
        *BASE,
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("success", sa.Boolean(), nullable=False),
    )
    op.create_index("ix_login_attempts_email", "login_attempts", ["email"])


def downgrade() -> None:
    op.drop_table("login_attempts")
    op.drop_table("refresh_tokens")
    op.drop_table("apartment_memberships")
    op.drop_table("role_permissions")
    op.drop_table("admin_role_definitions")
    op.drop_table("platform_roles")
    op.drop_table("permissions")
    op.drop_table("users")
