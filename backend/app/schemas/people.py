from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PersonBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    date_of_birth: date | None = None


class PersonCreate(PersonBase):
    pass


class PersonUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    email: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    date_of_birth: date | None = None
    is_active: bool | None = None


class PersonRead(PersonBase, ORMModel):
    id: str
    apartment_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class OwnerProfileBase(BaseModel):
    is_primary: bool = False
    ownership_start_date: date | None = None
    ownership_end_date: date | None = None


class OwnerProfileCreate(OwnerProfileBase):
    person_id: str | None = None
    person: PersonCreate | None = None

    @model_validator(mode="after")
    def person_source(self):
        if not self.person_id and not self.person:
            raise ValueError("Provide person_id or person details")
        if self.person_id and self.person:
            raise ValueError("Provide person_id or person details, not both")
        return self


class OwnerProfileUpdate(BaseModel):
    is_primary: bool | None = None
    ownership_start_date: date | None = None
    ownership_end_date: date | None = None
    is_active: bool | None = None


class OwnerProfileRead(OwnerProfileBase, ORMModel):
    id: str
    apartment_id: str
    block_id: str
    floor_id: str
    flat_id: str
    person_id: str
    person: PersonRead
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TenantProfileBase(BaseModel):
    lease_start_date: date | None = None
    lease_end_date: date | None = None


class TenantProfileCreate(TenantProfileBase):
    person_id: str | None = None
    person: PersonCreate | None = None

    @model_validator(mode="after")
    def person_source(self):
        if not self.person_id and not self.person:
            raise ValueError("Provide person_id or person details")
        if self.person_id and self.person:
            raise ValueError("Provide person_id or person details, not both")
        return self


class TenantProfileUpdate(BaseModel):
    lease_start_date: date | None = None
    lease_end_date: date | None = None
    is_active: bool | None = None


class TenantProfileRead(TenantProfileBase, ORMModel):
    id: str
    apartment_id: str
    block_id: str
    floor_id: str
    flat_id: str
    person_id: str
    person: PersonRead
    is_active: bool
    created_at: datetime
    updated_at: datetime


class FamilyMemberProfileBase(BaseModel):
    relationship: str = Field(..., min_length=1, max_length=50)
    marriage_anniversary: date | None = None
    is_emergency_contact: bool = False


class FamilyMemberProfileCreate(FamilyMemberProfileBase):
    person_id: str | None = None
    person: PersonCreate | None = None

    @model_validator(mode="after")
    def person_source(self):
        if not self.person_id and not self.person:
            raise ValueError("Provide person_id or person details")
        if self.person_id and self.person:
            raise ValueError("Provide person_id or person details, not both")
        return self


class FamilyMemberProfileUpdate(BaseModel):
    relationship: str | None = Field(None, min_length=1, max_length=50)
    marriage_anniversary: date | None = None
    is_emergency_contact: bool | None = None
    is_active: bool | None = None


class FamilyMemberProfileRead(FamilyMemberProfileBase, ORMModel):
    id: str
    apartment_id: str
    block_id: str
    floor_id: str
    flat_id: str
    person_id: str
    person: PersonRead
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @model_validator(mode="before")
    @classmethod
    def map_relation_type(cls, value):
        if hasattr(value, "relation_type"):
            data = {
                "id": value.id,
                "apartment_id": value.apartment_id,
                "block_id": value.block_id,
                "floor_id": value.floor_id,
                "flat_id": value.flat_id,
                "person_id": value.person_id,
                "person": value.person,
                "relationship": value.relation_type,
                "marriage_anniversary": value.marriage_anniversary,
                "is_emergency_contact": value.is_emergency_contact,
                "is_active": value.is_active,
                "created_at": value.created_at,
                "updated_at": value.updated_at,
            }
            return data
        return value


class StaffProfileBase(BaseModel):
    role_code: str = Field(..., min_length=1, max_length=50)
    department: str | None = None
    joined_at: date | None = None
    block_ids: list[str] = Field(default_factory=list)


class StaffProfileCreate(StaffProfileBase):
    person_id: str | None = None
    person: PersonCreate | None = None

    @model_validator(mode="after")
    def person_source(self):
        if not self.person_id and not self.person:
            raise ValueError("Provide person_id or person details")
        if self.person_id and self.person:
            raise ValueError("Provide person_id or person details, not both")
        return self


class StaffProfileUpdate(BaseModel):
    role_code: str | None = Field(None, min_length=1, max_length=50)
    department: str | None = None
    joined_at: date | None = None
    block_ids: list[str] | None = None
    is_active: bool | None = None


class StaffProfileRead(StaffProfileBase, ORMModel):
    id: str
    apartment_id: str
    person_id: str
    person: PersonRead
    is_active: bool
    created_at: datetime
    updated_at: datetime


class OccupancyHistoryRead(ORMModel):
    id: str
    apartment_id: str
    flat_id: str
    event_type: str
    person_type: str
    person_id: str
    profile_id: str
    person_name: str
    event_date: date
    notes: str | None
    created_at: datetime


class FlatHouseholdRead(BaseModel):
    flat_id: str
    flat_number: str
    occupancy_status: str
    owners: list[OwnerProfileRead]
    tenants: list[TenantProfileRead]
    family_members: list[FamilyMemberProfileRead]
