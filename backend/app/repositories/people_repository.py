from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import ConflictError, NotFoundError
from app.models.people import (
    FamilyMemberProfile,
    OccupancyHistory,
    OwnerProfile,
    Person,
    StaffBlockScope,
    StaffProfile,
    TenantProfile,
)
from app.models.structure import Flat


def _active(model):
    return model.deleted_at.is_(None)


class PeopleRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- Persons ---

    def list_persons(self, apartment_id: str) -> list[Person]:
        return list(
            self.db.scalars(
                select(Person)
                .where(Person.apartment_id == apartment_id, _active(Person))
                .order_by(Person.full_name)
            ).all()
        )

    def get_person(self, apartment_id: str, person_id: str) -> Person | None:
        return self.db.scalar(
            select(Person).where(
                Person.id == person_id,
                Person.apartment_id == apartment_id,
                _active(Person),
            )
        )

    def create_person(self, person: Person) -> Person:
        self.db.add(person)
        self.db.commit()
        self.db.refresh(person)
        return person

    def update_person(self, person: Person) -> Person:
        self.db.commit()
        self.db.refresh(person)
        return person

    def soft_delete_person(self, person: Person, deleted_by: str | None = None) -> None:
        person.is_active = False
        person.deleted_at = datetime.now(timezone.utc)
        person.deleted_by = deleted_by
        self.db.commit()

    # --- Flat helpers ---

    def get_flat(self, apartment_id: str, flat_id: str) -> Flat | None:
        return self.db.scalar(
            select(Flat).where(
                Flat.id == flat_id,
                Flat.apartment_id == apartment_id,
                _active(Flat),
            )
        )

    def get_flat_by_number(
        self, apartment_id: str, block_id: str, flat_number: str
    ) -> Flat | None:
        return self.db.scalar(
            select(Flat).where(
                Flat.apartment_id == apartment_id,
                Flat.block_id == block_id,
                Flat.flat_number == flat_number,
                _active(Flat),
            )
        )

    def flat_scope(flat: Flat) -> dict[str, str]:
        return {
            "apartment_id": flat.apartment_id,
            "block_id": flat.block_id,
            "floor_id": flat.floor_id,
            "flat_id": flat.id,
        }

    # --- Owners ---

    def list_owners(
        self, apartment_id: str, flat_id: str | None = None
    ) -> list[OwnerProfile]:
        stmt = (
            select(OwnerProfile)
            .options(joinedload(OwnerProfile.person))
            .where(OwnerProfile.apartment_id == apartment_id, _active(OwnerProfile))
        )
        if flat_id:
            stmt = stmt.where(OwnerProfile.flat_id == flat_id)
        return list(self.db.scalars(stmt.order_by(OwnerProfile.created_at)).all())

    def get_owner(self, apartment_id: str, owner_id: str) -> OwnerProfile | None:
        return self.db.scalar(
            select(OwnerProfile)
            .options(joinedload(OwnerProfile.person))
            .where(
                OwnerProfile.id == owner_id,
                OwnerProfile.apartment_id == apartment_id,
                _active(OwnerProfile),
            )
        )

    def get_primary_owner(self, flat_id: str) -> OwnerProfile | None:
        return self.db.scalar(
            select(OwnerProfile).where(
                OwnerProfile.flat_id == flat_id,
                OwnerProfile.is_primary.is_(True),
                OwnerProfile.is_active.is_(True),
                _active(OwnerProfile),
                OwnerProfile.ownership_end_date.is_(None),
            )
        )

    def create_owner(self, owner: OwnerProfile) -> OwnerProfile:
        self.db.add(owner)
        self.db.commit()
        self.db.refresh(owner)
        return self.get_owner(owner.apartment_id, owner.id)  # type: ignore[return-value]

    def update_owner(self, owner: OwnerProfile) -> OwnerProfile:
        self.db.commit()
        self.db.refresh(owner)
        return self.get_owner(owner.apartment_id, owner.id)  # type: ignore[return-value]

    def soft_delete_owner(self, owner: OwnerProfile, deleted_by: str | None = None) -> None:
        owner.is_active = False
        owner.deleted_at = datetime.now(timezone.utc)
        owner.deleted_by = deleted_by
        self.db.commit()

    # --- Tenants ---

    def list_tenants(
        self, apartment_id: str, flat_id: str | None = None, active_only: bool = False
    ) -> list[TenantProfile]:
        stmt = (
            select(TenantProfile)
            .options(joinedload(TenantProfile.person))
            .where(TenantProfile.apartment_id == apartment_id, _active(TenantProfile))
        )
        if flat_id:
            stmt = stmt.where(TenantProfile.flat_id == flat_id)
        if active_only:
            stmt = stmt.where(TenantProfile.is_active.is_(True))
        return list(self.db.scalars(stmt.order_by(TenantProfile.created_at)).all())

    def get_tenant(self, apartment_id: str, tenant_id: str) -> TenantProfile | None:
        return self.db.scalar(
            select(TenantProfile)
            .options(joinedload(TenantProfile.person))
            .where(
                TenantProfile.id == tenant_id,
                TenantProfile.apartment_id == apartment_id,
                _active(TenantProfile),
            )
        )

    def get_active_tenant(self, flat_id: str) -> TenantProfile | None:
        return self.db.scalar(
            select(TenantProfile).where(
                TenantProfile.flat_id == flat_id,
                TenantProfile.is_active.is_(True),
                _active(TenantProfile),
            )
        )

    def create_tenant(self, tenant: TenantProfile) -> TenantProfile:
        self.db.add(tenant)
        self.db.commit()
        self.db.refresh(tenant)
        return self.get_tenant(tenant.apartment_id, tenant.id)  # type: ignore[return-value]

    def update_tenant(self, tenant: TenantProfile) -> TenantProfile:
        self.db.commit()
        self.db.refresh(tenant)
        return self.get_tenant(tenant.apartment_id, tenant.id)  # type: ignore[return-value]

    def soft_delete_tenant(self, tenant: TenantProfile, deleted_by: str | None = None) -> None:
        tenant.is_active = False
        tenant.deleted_at = datetime.now(timezone.utc)
        tenant.deleted_by = deleted_by
        self.db.commit()

    # --- Family ---

    def list_family(self, apartment_id: str, flat_id: str) -> list[FamilyMemberProfile]:
        return list(
            self.db.scalars(
                select(FamilyMemberProfile)
                .options(joinedload(FamilyMemberProfile.person))
                .where(
                    FamilyMemberProfile.apartment_id == apartment_id,
                    FamilyMemberProfile.flat_id == flat_id,
                    _active(FamilyMemberProfile),
                )
                .order_by(FamilyMemberProfile.relation_type)
            ).all()
        )

    def get_family_member(
        self, apartment_id: str, member_id: str
    ) -> FamilyMemberProfile | None:
        return self.db.scalar(
            select(FamilyMemberProfile)
            .options(joinedload(FamilyMemberProfile.person))
            .where(
                FamilyMemberProfile.id == member_id,
                FamilyMemberProfile.apartment_id == apartment_id,
                _active(FamilyMemberProfile),
            )
        )

    def create_family_member(self, member: FamilyMemberProfile) -> FamilyMemberProfile:
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return self.get_family_member(member.apartment_id, member.id)  # type: ignore

    def update_family_member(self, member: FamilyMemberProfile) -> FamilyMemberProfile:
        self.db.commit()
        self.db.refresh(member)
        return self.get_family_member(member.apartment_id, member.id)  # type: ignore

    def soft_delete_family_member(
        self, member: FamilyMemberProfile, deleted_by: str | None = None
    ) -> None:
        member.is_active = False
        member.deleted_at = datetime.now(timezone.utc)
        member.deleted_by = deleted_by
        self.db.commit()

    # --- Staff ---

    def list_staff(self, apartment_id: str) -> list[StaffProfile]:
        return list(
            self.db.scalars(
                select(StaffProfile)
                .options(joinedload(StaffProfile.person), joinedload(StaffProfile.block_scopes))
                .where(StaffProfile.apartment_id == apartment_id, _active(StaffProfile))
                .order_by(StaffProfile.role_code)
            )
            .unique()
            .all()
        )

    def get_staff(self, apartment_id: str, staff_id: str) -> StaffProfile | None:
        stmt = (
            select(StaffProfile)
            .options(joinedload(StaffProfile.person), joinedload(StaffProfile.block_scopes))
            .where(
                StaffProfile.id == staff_id,
                StaffProfile.apartment_id == apartment_id,
                _active(StaffProfile),
            )
        )
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def create_staff(self, staff: StaffProfile, block_ids: list[str]) -> StaffProfile:
        self.db.add(staff)
        self.db.flush()
        for block_id in block_ids:
            self.db.add(StaffBlockScope(staff_id=staff.id, block_id=block_id))
        self.db.commit()
        return self.get_staff(staff.apartment_id, staff.id)  # type: ignore[return-value]

    def replace_staff_blocks(self, staff: StaffProfile, block_ids: list[str]) -> None:
        for scope in list(staff.block_scopes):
            self.db.delete(scope)
        self.db.flush()
        for block_id in block_ids:
            self.db.add(StaffBlockScope(staff_id=staff.id, block_id=block_id))

    def update_staff(self, staff: StaffProfile) -> StaffProfile:
        self.db.commit()
        self.db.refresh(staff)
        return self.get_staff(staff.apartment_id, staff.id)  # type: ignore[return-value]

    def soft_delete_staff(self, staff: StaffProfile, deleted_by: str | None = None) -> None:
        staff.is_active = False
        staff.deleted_at = datetime.now(timezone.utc)
        staff.deleted_by = deleted_by
        self.db.commit()

    # --- Occupancy ---

    def add_occupancy_event(self, event: OccupancyHistory) -> None:
        self.db.add(event)
        self.db.commit()

    def list_occupancy_history(self, apartment_id: str, flat_id: str) -> list[OccupancyHistory]:
        return list(
            self.db.scalars(
                select(OccupancyHistory)
                .where(
                    OccupancyHistory.apartment_id == apartment_id,
                    OccupancyHistory.flat_id == flat_id,
                )
                .order_by(OccupancyHistory.event_date.desc())
            ).all()
        )

    def update_flat_occupancy(self, flat: Flat, status: str) -> None:
        flat.occupancy_status = status
        self.db.commit()
