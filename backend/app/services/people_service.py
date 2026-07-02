from datetime import date

from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import new_uuid
from app.models.people import (
    FamilyMemberProfile,
    OccupancyHistory,
    OwnerProfile,
    Person,
    StaffProfile,
    TenantProfile,
)
from app.models.structure import Flat
from app.repositories.people_repository import PeopleRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.people import (
    FamilyMemberProfileCreate,
    FamilyMemberProfileUpdate,
    OwnerProfileCreate,
    OwnerProfileUpdate,
    PersonCreate,
    PersonUpdate,
    StaffProfileCreate,
    StaffProfileUpdate,
    TenantProfileCreate,
    TenantProfileUpdate,
)


class PeopleService:
    def __init__(self, repo: PeopleRepository, structure_repo: StructureRepository):
        self.repo = repo
        self.structure_repo = structure_repo

    def _get_apartment(self, apartment_id: str):
        apt = self.structure_repo.get_apartment(apartment_id)
        if not apt:
            raise NotFoundError("Apartment not found")
        return apt

    def _get_flat(self, apartment_id: str, flat_id: str) -> Flat:
        flat = self.repo.get_flat(apartment_id, flat_id)
        if not flat:
            raise NotFoundError("Flat not found")
        return flat

    def _resolve_person(
        self, apartment_id: str, person_id: str | None, person_data: PersonCreate | None
    ) -> Person:
        if person_id:
            person = self.repo.get_person(apartment_id, person_id)
            if not person:
                raise NotFoundError("Person not found")
            return person
        assert person_data is not None
        person = Person(id=new_uuid(), apartment_id=apartment_id, **person_data.model_dump())
        return self.repo.create_person(person)

    def _flat_scope(self, flat: Flat) -> dict[str, str]:
        return PeopleRepository.flat_scope(flat)

    def _recompute_occupancy(self, flat: Flat) -> None:
        active_tenant = self.repo.get_active_tenant(flat.id)
        if active_tenant:
            status = "tenant_occupied"
        elif self.repo.list_owners(flat.apartment_id, flat.id):
            active_owners = [
                o
                for o in self.repo.list_owners(flat.apartment_id, flat.id)
                if o.is_active and o.ownership_end_date is None
            ]
            status = "owner_occupied" if active_owners else "vacant"
        else:
            status = "vacant"
        self.repo.update_flat_occupancy(flat, status)

    def _record_occupancy(
        self,
        flat: Flat,
        event_type: str,
        person_type: str,
        person: Person,
        profile_id: str,
        event_date: date | None = None,
        notes: str | None = None,
    ) -> None:
        event = OccupancyHistory(
            id=new_uuid(),
            apartment_id=flat.apartment_id,
            flat_id=flat.id,
            event_type=event_type,
            person_type=person_type,
            person_id=person.id,
            profile_id=profile_id,
            person_name=person.full_name,
            event_date=event_date or date.today(),
            notes=notes,
        )
        self.repo.add_occupancy_event(event)

    # --- Persons ---

    def list_persons(self, apartment_id: str) -> list[Person]:
        self._get_apartment(apartment_id)
        return self.repo.list_persons(apartment_id)

    def get_person(self, apartment_id: str, person_id: str) -> Person:
        person = self.repo.get_person(apartment_id, person_id)
        if not person:
            raise NotFoundError("Person not found")
        return person

    def create_person(self, apartment_id: str, data: PersonCreate) -> Person:
        self._get_apartment(apartment_id)
        person = Person(id=new_uuid(), apartment_id=apartment_id, **data.model_dump())
        return self.repo.create_person(person)

    def update_person(self, apartment_id: str, person_id: str, data: PersonUpdate) -> Person:
        person = self.get_person(apartment_id, person_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(person, key, value)
        return self.repo.update_person(person)

    def delete_person(self, apartment_id: str, person_id: str, deleted_by: str | None = None) -> None:
        person = self.get_person(apartment_id, person_id)
        self.repo.soft_delete_person(person, deleted_by)

    # --- Owners ---

    def list_owners(self, apartment_id: str, flat_id: str | None = None) -> list[OwnerProfile]:
        self._get_apartment(apartment_id)
        if flat_id:
            self._get_flat(apartment_id, flat_id)
        return self.repo.list_owners(apartment_id, flat_id)

    def get_owner(self, apartment_id: str, owner_id: str) -> OwnerProfile:
        owner = self.repo.get_owner(apartment_id, owner_id)
        if not owner:
            raise NotFoundError("Owner profile not found")
        return owner

    def create_owner(
        self, apartment_id: str, flat_id: str, data: OwnerProfileCreate
    ) -> OwnerProfile:
        flat = self._get_flat(apartment_id, flat_id)
        person = self._resolve_person(apartment_id, data.person_id, data.person)

        if data.is_primary:
            existing = self.repo.get_primary_owner(flat_id)
            if existing:
                raise ConflictError("Flat already has a primary owner")

        owner = OwnerProfile(
            id=new_uuid(),
            person_id=person.id,
            is_primary=data.is_primary,
            ownership_start_date=data.ownership_start_date,
            ownership_end_date=data.ownership_end_date,
            **self._flat_scope(flat),
        )
        owner = self.repo.create_owner(owner)
        self._record_occupancy(
            flat, "move_in", "owner", person, owner.id, data.ownership_start_date
        )
        self._recompute_occupancy(flat)
        return owner

    def update_owner(
        self, apartment_id: str, owner_id: str, data: OwnerProfileUpdate
    ) -> OwnerProfile:
        owner = self.get_owner(apartment_id, owner_id)
        flat = self._get_flat(apartment_id, owner.flat_id)
        updates = data.model_dump(exclude_unset=True)

        if updates.get("is_primary") and not owner.is_primary:
            existing = self.repo.get_primary_owner(owner.flat_id)
            if existing and existing.id != owner.id:
                raise ConflictError("Flat already has a primary owner")

        deactivating = updates.get("is_active") is False and owner.is_active
        for key, value in updates.items():
            setattr(owner, key, value)

        owner = self.repo.update_owner(owner)
        if deactivating:
            self._record_occupancy(
                flat, "move_out", "owner", owner.person, owner.id, date.today()
            )
        self._recompute_occupancy(flat)
        return owner

    def delete_owner(
        self, apartment_id: str, owner_id: str, deleted_by: str | None = None
    ) -> None:
        owner = self.get_owner(apartment_id, owner_id)
        flat = self._get_flat(apartment_id, owner.flat_id)
        self.repo.soft_delete_owner(owner, deleted_by)
        self._record_occupancy(flat, "move_out", "owner", owner.person, owner.id, date.today())
        self._recompute_occupancy(flat)

    # --- Tenants ---

    def list_tenants(
        self, apartment_id: str, flat_id: str | None = None, active_only: bool = False
    ) -> list[TenantProfile]:
        self._get_apartment(apartment_id)
        if flat_id:
            self._get_flat(apartment_id, flat_id)
        return self.repo.list_tenants(apartment_id, flat_id, active_only)

    def get_tenant(self, apartment_id: str, tenant_id: str) -> TenantProfile:
        tenant = self.repo.get_tenant(apartment_id, tenant_id)
        if not tenant:
            raise NotFoundError("Tenant profile not found")
        return tenant

    def create_tenant(
        self, apartment_id: str, flat_id: str, data: TenantProfileCreate
    ) -> TenantProfile:
        flat = self._get_flat(apartment_id, flat_id)
        person = self._resolve_person(apartment_id, data.person_id, data.person)

        existing = self.repo.get_active_tenant(flat_id)
        if existing:
            raise ConflictError("Flat already has an active tenant")

        tenant = TenantProfile(
            id=new_uuid(),
            person_id=person.id,
            lease_start_date=data.lease_start_date,
            lease_end_date=data.lease_end_date,
            **self._flat_scope(flat),
        )
        tenant = self.repo.create_tenant(tenant)
        self._record_occupancy(
            flat, "move_in", "tenant", person, tenant.id, data.lease_start_date
        )
        self._recompute_occupancy(flat)
        return tenant

    def update_tenant(
        self, apartment_id: str, tenant_id: str, data: TenantProfileUpdate
    ) -> TenantProfile:
        tenant = self.get_tenant(apartment_id, tenant_id)
        flat = self._get_flat(apartment_id, tenant.flat_id)
        updates = data.model_dump(exclude_unset=True)

        if updates.get("is_active") is True and not tenant.is_active:
            existing = self.repo.get_active_tenant(tenant.flat_id)
            if existing and existing.id != tenant.id:
                raise ConflictError("Flat already has an active tenant")

        deactivating = updates.get("is_active") is False and tenant.is_active
        for key, value in updates.items():
            setattr(tenant, key, value)

        tenant = self.repo.update_tenant(tenant)
        if deactivating:
            self._record_occupancy(
                flat, "move_out", "tenant", tenant.person, tenant.id, date.today()
            )
        self._recompute_occupancy(flat)
        return tenant

    def delete_tenant(
        self, apartment_id: str, tenant_id: str, deleted_by: str | None = None
    ) -> None:
        tenant = self.get_tenant(apartment_id, tenant_id)
        flat = self._get_flat(apartment_id, tenant.flat_id)
        self.repo.soft_delete_tenant(tenant, deleted_by)
        self._record_occupancy(flat, "move_out", "tenant", tenant.person, tenant.id, date.today())
        self._recompute_occupancy(flat)

    # --- Family ---

    def list_family(self, apartment_id: str, flat_id: str) -> list[FamilyMemberProfile]:
        self._get_flat(apartment_id, flat_id)
        return self.repo.list_family(apartment_id, flat_id)

    def get_family_member(self, apartment_id: str, member_id: str) -> FamilyMemberProfile:
        member = self.repo.get_family_member(apartment_id, member_id)
        if not member:
            raise NotFoundError("Family member not found")
        return member

    def create_family_member(
        self, apartment_id: str, flat_id: str, data: FamilyMemberProfileCreate
    ) -> FamilyMemberProfile:
        flat = self._get_flat(apartment_id, flat_id)
        person = self._resolve_person(apartment_id, data.person_id, data.person)
        member = FamilyMemberProfile(
            id=new_uuid(),
            person_id=person.id,
            relation_type=data.relationship,
            marriage_anniversary=data.marriage_anniversary,
            is_emergency_contact=data.is_emergency_contact,
            **self._flat_scope(flat),
        )
        return self.repo.create_family_member(member)

    def update_family_member(
        self, apartment_id: str, member_id: str, data: FamilyMemberProfileUpdate
    ) -> FamilyMemberProfile:
        member = self.get_family_member(apartment_id, member_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(member, key, value)
        return self.repo.update_family_member(member)

    def delete_family_member(
        self, apartment_id: str, member_id: str, deleted_by: str | None = None
    ) -> None:
        member = self.get_family_member(apartment_id, member_id)
        self.repo.soft_delete_family_member(member, deleted_by)

    # --- Staff ---

    def list_staff(self, apartment_id: str) -> list[StaffProfile]:
        self._get_apartment(apartment_id)
        return self.repo.list_staff(apartment_id)

    def get_staff(self, apartment_id: str, staff_id: str) -> StaffProfile:
        staff = self.repo.get_staff(apartment_id, staff_id)
        if not staff:
            raise NotFoundError("Staff profile not found")
        return staff

    def create_staff(self, apartment_id: str, data: StaffProfileCreate) -> StaffProfile:
        self._get_apartment(apartment_id)
        person = self._resolve_person(apartment_id, data.person_id, data.person)
        for block_id in data.block_ids:
            if not self.structure_repo.get_block(apartment_id, block_id):
                raise NotFoundError(f"Block not found: {block_id}")

        staff = StaffProfile(
            id=new_uuid(),
            apartment_id=apartment_id,
            person_id=person.id,
            role_code=data.role_code,
            department=data.department,
            joined_at=data.joined_at,
        )
        return self.repo.create_staff(staff, data.block_ids)

    def update_staff(
        self, apartment_id: str, staff_id: str, data: StaffProfileUpdate
    ) -> StaffProfile:
        staff = self.get_staff(apartment_id, staff_id)
        updates = data.model_dump(exclude_unset=True)
        block_ids = updates.pop("block_ids", None)
        for key, value in updates.items():
            setattr(staff, key, value)
        if block_ids is not None:
            for block_id in block_ids:
                if not self.structure_repo.get_block(apartment_id, block_id):
                    raise NotFoundError(f"Block not found: {block_id}")
            self.repo.replace_staff_blocks(staff, block_ids)
        return self.repo.update_staff(staff)

    def delete_staff(
        self, apartment_id: str, staff_id: str, deleted_by: str | None = None
    ) -> None:
        staff = self.get_staff(apartment_id, staff_id)
        self.repo.soft_delete_staff(staff, deleted_by)

    # --- Household view ---

    def get_flat_household(self, apartment_id: str, flat_id: str) -> dict:
        flat = self._get_flat(apartment_id, flat_id)
        return {
            "flat_id": flat.id,
            "flat_number": flat.flat_number,
            "occupancy_status": flat.occupancy_status,
            "owners": self.repo.list_owners(apartment_id, flat_id),
            "tenants": self.repo.list_tenants(apartment_id, flat_id),
            "family_members": self.repo.list_family(apartment_id, flat_id),
        }

    def list_occupancy_history(self, apartment_id: str, flat_id: str) -> list[OccupancyHistory]:
        self._get_flat(apartment_id, flat_id)
        return self.repo.list_occupancy_history(apartment_id, flat_id)
