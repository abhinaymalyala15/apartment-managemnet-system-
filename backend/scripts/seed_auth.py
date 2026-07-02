"""Seed B4 auth — permissions, admin roles, demo users."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from sqlalchemy import select  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.db.base import new_uuid  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.auth import (  # noqa: E402
    AdminRoleDefinition,
    ApartmentMembership,
    Permission,
    PlatformRole,
    RolePermission,
    User,
)
from app.models.people import Person  # noqa: E402
from app.models.structure import Apartment, Flat  # noqa: E402

DATA = ROOT / "src" / "data"


def load_json(name: str):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)


PERMISSION_DEFS = [
    ("finance", "finance", "Finance module access"),
    ("communication", "communication", "Notices and announcements"),
    ("residents", "residents", "Resident and household records"),
    ("settings", "settings", "Society settings"),
    ("reports", "reports", "Reports and analytics"),
    ("communication_read", "communication", "Read-only notice access"),
    ("visitors", "visitors", "Visitor management"),
    ("emergency", "communication", "Emergency contacts and alerts"),
    ("assets", "assets", "Community assets"),
    ("work_orders", "assets", "Maintenance work orders"),
    ("inspector_portal", "inspector", "Inspector dashboard access"),
    ("structure.read", "structure", "Read blocks and flats"),
    ("structure.write", "structure", "Manage blocks and flats"),
    ("people.read", "people", "Read household records"),
    ("people.write", "people", "Manage household records"),
    ("auth.admin", "auth", "Manage users and memberships"),
]


def seed() -> None:
    db = SessionLocal()

    apartment = db.scalar(
        select(Apartment).where(Apartment.slug == "sylvan-shelter-apartment")
    )
    if not apartment:
        print("Run seed_structure.py first.")
        db.close()
        return

    if db.scalar(select(User).limit(1)):
        print("Auth already seeded — skipping.")
        db.close()
        return

    perm_by_code: dict[str, Permission] = {
        p.code: p for p in db.scalars(select(Permission)).all()
    }
    if not perm_by_code:
        for code, module, desc in PERMISSION_DEFS:
            perm = Permission(id=new_uuid(), code=code, module=module, description=desc)
            db.add(perm)
            perm_by_code[code] = perm
        db.commit()

    settings_data = load_json("apartment-settings.json")
    role_by_code: dict[str, AdminRoleDefinition] = {}
    existing_roles = db.scalars(
        select(AdminRoleDefinition).where(AdminRoleDefinition.apartment_id == apartment.id)
    ).all()
    if existing_roles:
        role_by_code = {r.code: r for r in existing_roles}
    else:
        for r in settings_data["roles"]:
            role = AdminRoleDefinition(
                id=new_uuid(),
                apartment_id=apartment.id,
                code=r["id"],
                label=r["label"],
                description=r.get("description"),
                scope=r.get("scope", "apartment"),
                is_system=True,
            )
            db.add(role)
            db.flush()
            role_by_code[r["id"]] = role
            for perm_code in r.get("permissions", []):
                perm = perm_by_code.get(perm_code)
                if perm:
                    db.add(RolePermission(id=new_uuid(), role_id=role.id, permission_id=perm.id))
        db.commit()

    demo_users = load_json("demo-users.json")
    password_hash = hash_password(settings.demo_password)

    flat_by_number = {
        f.flat_number: f
        for f in db.scalars(select(Flat).where(Flat.apartment_id == apartment.id)).all()
    }

    def create_user(key: str, membership_role: str | None, flat_number: str | None = None):
        data = demo_users[key]
        person = None
        if flat_number:
            flat = flat_by_number.get(flat_number)
            if flat:
                person = db.scalar(
                    select(Person).where(
                        Person.apartment_id == apartment.id,
                        Person.full_name.ilike(f"%{data['fullName'].split()[0]}%"),
                    )
                )
        user = User(
            id=new_uuid(),
            email=data["email"].lower(),
            password_hash=password_hash,
            full_name=data["fullName"],
            phone=data.get("phone"),
            person_id=person.id if person else None,
        )
        db.add(user)
        db.flush()

        if membership_role:
            flat_id = (
                flat_by_number[flat_number].id
                if flat_number and flat_number in flat_by_number
                else None
            )
            admin_role_id = None
            if membership_role == "admin":
                office = role_by_code.get("office_manager")
                admin_role_id = office.id if office else None
            elif membership_role == "inspector":
                inspector = role_by_code.get("inspector")
                admin_role_id = inspector.id if inspector else None

            db.add(
                ApartmentMembership(
                    id=new_uuid(),
                    user_id=user.id,
                    apartment_id=apartment.id,
                    role=membership_role,
                    flat_id=flat_id,
                    admin_role_id=admin_role_id,
                )
            )
        return user

    create_user("resident", "resident", "110")
    create_user("inspector", "inspector")
    create_user("admin", "admin")

    platform_data = demo_users["platform"]
    platform_user = User(
        id=new_uuid(),
        email=platform_data["email"].lower(),
        password_hash=password_hash,
        full_name=platform_data["fullName"],
        phone=platform_data.get("phone"),
    )
    db.add(platform_user)
    db.flush()
    db.add(PlatformRole(id=new_uuid(), user_id=platform_user.id, role="super_admin"))

    db.commit()
    print(f"Seeded auth: {len(PERMISSION_DEFS)} permissions, {len(settings_data['roles'])} roles, 4 demo users.")
    print(f"Demo password for all users: {settings.demo_password}")
    db.close()


if __name__ == "__main__":
    seed()
