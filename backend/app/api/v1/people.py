from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.people import StaffProfile
from app.repositories.people_repository import PeopleRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.people import (
    FamilyMemberProfileCreate,
    FamilyMemberProfileRead,
    FamilyMemberProfileUpdate,
    FlatHouseholdRead,
    OccupancyHistoryRead,
    OwnerProfileCreate,
    OwnerProfileRead,
    OwnerProfileUpdate,
    PersonCreate,
    PersonRead,
    PersonUpdate,
    StaffProfileCreate,
    StaffProfileRead,
    StaffProfileUpdate,
    TenantProfileCreate,
    TenantProfileRead,
    TenantProfileUpdate,
)
from app.schemas.structure import SoftDeleteParams
from app.services.people_service import PeopleService

router = APIRouter(prefix="/apartments", tags=["people"])


def get_people_service(db: Session = Depends(get_db)) -> PeopleService:
    return PeopleService(PeopleRepository(db), StructureRepository(db))


def staff_to_read(staff: StaffProfile) -> StaffProfileRead:
    return StaffProfileRead(
        id=staff.id,
        apartment_id=staff.apartment_id,
        person_id=staff.person_id,
        person=staff.person,
        role_code=staff.role_code,
        department=staff.department,
        joined_at=staff.joined_at,
        block_ids=[scope.block_id for scope in staff.block_scopes],
        is_active=staff.is_active,
        created_at=staff.created_at,
        updated_at=staff.updated_at,
    )


# --- Persons ---


@router.get("/{apartment_id}/persons", response_model=list[PersonRead])
def list_persons(apartment_id: str, service: PeopleService = Depends(get_people_service)):
    return service.list_persons(apartment_id)


@router.post("/{apartment_id}/persons", response_model=PersonRead, status_code=201)
def create_person(
    apartment_id: str,
    data: PersonCreate,
    service: PeopleService = Depends(get_people_service),
):
    return service.create_person(apartment_id, data)


@router.get("/{apartment_id}/persons/{person_id}", response_model=PersonRead)
def get_person(
    apartment_id: str,
    person_id: str,
    service: PeopleService = Depends(get_people_service),
):
    return service.get_person(apartment_id, person_id)


@router.patch("/{apartment_id}/persons/{person_id}", response_model=PersonRead)
def update_person(
    apartment_id: str,
    person_id: str,
    data: PersonUpdate,
    service: PeopleService = Depends(get_people_service),
):
    return service.update_person(apartment_id, person_id, data)


@router.delete("/{apartment_id}/persons/{person_id}", status_code=204)
def delete_person(
    apartment_id: str,
    person_id: str,
    params: SoftDeleteParams = Depends(),
    service: PeopleService = Depends(get_people_service),
):
    service.delete_person(apartment_id, person_id, params.deleted_by)


# --- Owners ---


@router.get("/{apartment_id}/owners", response_model=list[OwnerProfileRead])
def list_owners(
    apartment_id: str,
    flat_id: str | None = Query(None),
    service: PeopleService = Depends(get_people_service),
):
    return service.list_owners(apartment_id, flat_id)


@router.post("/{apartment_id}/flats/{flat_id}/owners", response_model=OwnerProfileRead, status_code=201)
def create_owner(
    apartment_id: str,
    flat_id: str,
    data: OwnerProfileCreate,
    service: PeopleService = Depends(get_people_service),
):
    return service.create_owner(apartment_id, flat_id, data)


@router.get("/{apartment_id}/owners/{owner_id}", response_model=OwnerProfileRead)
def get_owner(
    apartment_id: str,
    owner_id: str,
    service: PeopleService = Depends(get_people_service),
):
    return service.get_owner(apartment_id, owner_id)


@router.patch("/{apartment_id}/owners/{owner_id}", response_model=OwnerProfileRead)
def update_owner(
    apartment_id: str,
    owner_id: str,
    data: OwnerProfileUpdate,
    service: PeopleService = Depends(get_people_service),
):
    return service.update_owner(apartment_id, owner_id, data)


@router.delete("/{apartment_id}/owners/{owner_id}", status_code=204)
def delete_owner(
    apartment_id: str,
    owner_id: str,
    params: SoftDeleteParams = Depends(),
    service: PeopleService = Depends(get_people_service),
):
    service.delete_owner(apartment_id, owner_id, params.deleted_by)


# --- Tenants ---


@router.get("/{apartment_id}/tenants", response_model=list[TenantProfileRead])
def list_tenants(
    apartment_id: str,
    flat_id: str | None = Query(None),
    active_only: bool = Query(False),
    service: PeopleService = Depends(get_people_service),
):
    return service.list_tenants(apartment_id, flat_id, active_only)


@router.post("/{apartment_id}/flats/{flat_id}/tenants", response_model=TenantProfileRead, status_code=201)
def create_tenant(
    apartment_id: str,
    flat_id: str,
    data: TenantProfileCreate,
    service: PeopleService = Depends(get_people_service),
):
    return service.create_tenant(apartment_id, flat_id, data)


@router.get("/{apartment_id}/tenants/{tenant_id}", response_model=TenantProfileRead)
def get_tenant(
    apartment_id: str,
    tenant_id: str,
    service: PeopleService = Depends(get_people_service),
):
    return service.get_tenant(apartment_id, tenant_id)


@router.patch("/{apartment_id}/tenants/{tenant_id}", response_model=TenantProfileRead)
def update_tenant(
    apartment_id: str,
    tenant_id: str,
    data: TenantProfileUpdate,
    service: PeopleService = Depends(get_people_service),
):
    return service.update_tenant(apartment_id, tenant_id, data)


@router.delete("/{apartment_id}/tenants/{tenant_id}", status_code=204)
def delete_tenant(
    apartment_id: str,
    tenant_id: str,
    params: SoftDeleteParams = Depends(),
    service: PeopleService = Depends(get_people_service),
):
    service.delete_tenant(apartment_id, tenant_id, params.deleted_by)


# --- Family ---


@router.get("/{apartment_id}/flats/{flat_id}/family-members", response_model=list[FamilyMemberProfileRead])
def list_family(
    apartment_id: str,
    flat_id: str,
    service: PeopleService = Depends(get_people_service),
):
    return service.list_family(apartment_id, flat_id)


@router.post(
    "/{apartment_id}/flats/{flat_id}/family-members",
    response_model=FamilyMemberProfileRead,
    status_code=201,
)
def create_family_member(
    apartment_id: str,
    flat_id: str,
    data: FamilyMemberProfileCreate,
    service: PeopleService = Depends(get_people_service),
):
    return service.create_family_member(apartment_id, flat_id, data)


@router.get("/{apartment_id}/family-members/{member_id}", response_model=FamilyMemberProfileRead)
def get_family_member(
    apartment_id: str,
    member_id: str,
    service: PeopleService = Depends(get_people_service),
):
    return service.get_family_member(apartment_id, member_id)


@router.patch("/{apartment_id}/family-members/{member_id}", response_model=FamilyMemberProfileRead)
def update_family_member(
    apartment_id: str,
    member_id: str,
    data: FamilyMemberProfileUpdate,
    service: PeopleService = Depends(get_people_service),
):
    return service.update_family_member(apartment_id, member_id, data)


@router.delete("/{apartment_id}/family-members/{member_id}", status_code=204)
def delete_family_member(
    apartment_id: str,
    member_id: str,
    params: SoftDeleteParams = Depends(),
    service: PeopleService = Depends(get_people_service),
):
    service.delete_family_member(apartment_id, member_id, params.deleted_by)


# --- Staff ---


@router.get("/{apartment_id}/staff", response_model=list[StaffProfileRead])
def list_staff(apartment_id: str, service: PeopleService = Depends(get_people_service)):
    return [staff_to_read(s) for s in service.list_staff(apartment_id)]


@router.post("/{apartment_id}/staff", response_model=StaffProfileRead, status_code=201)
def create_staff(
    apartment_id: str,
    data: StaffProfileCreate,
    service: PeopleService = Depends(get_people_service),
):
    return staff_to_read(service.create_staff(apartment_id, data))


@router.get("/{apartment_id}/staff/{staff_id}", response_model=StaffProfileRead)
def get_staff(
    apartment_id: str,
    staff_id: str,
    service: PeopleService = Depends(get_people_service),
):
    return staff_to_read(service.get_staff(apartment_id, staff_id))


@router.patch("/{apartment_id}/staff/{staff_id}", response_model=StaffProfileRead)
def update_staff(
    apartment_id: str,
    staff_id: str,
    data: StaffProfileUpdate,
    service: PeopleService = Depends(get_people_service),
):
    return staff_to_read(service.update_staff(apartment_id, staff_id, data))


@router.delete("/{apartment_id}/staff/{staff_id}", status_code=204)
def delete_staff(
    apartment_id: str,
    staff_id: str,
    params: SoftDeleteParams = Depends(),
    service: PeopleService = Depends(get_people_service),
):
    service.delete_staff(apartment_id, staff_id, params.deleted_by)


# --- Household aggregate ---


@router.get("/{apartment_id}/flats/{flat_id}/household", response_model=FlatHouseholdRead)
def get_flat_household(
    apartment_id: str,
    flat_id: str,
    service: PeopleService = Depends(get_people_service),
):
    return service.get_flat_household(apartment_id, flat_id)


@router.get("/{apartment_id}/flats/{flat_id}/occupancy-history", response_model=list[OccupancyHistoryRead])
def list_occupancy_history(
    apartment_id: str,
    flat_id: str,
    service: PeopleService = Depends(get_people_service),
):
    return service.list_occupancy_history(apartment_id, flat_id)
