from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SoftDeleteParams(BaseModel):
    deleted_by: str | None = None


class ApartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=100)
    tagline: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    phone: str | None = None
    email: str | None = None
    registration_number: str | None = None
    year_established: int | None = None
    description: str | None = None


class ApartmentCreate(ApartmentBase):
    pass


class ApartmentUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    slug: str | None = Field(None, min_length=1, max_length=100)
    tagline: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    phone: str | None = None
    email: str | None = None
    registration_number: str | None = None
    year_established: int | None = None
    description: str | None = None
    is_active: bool | None = None


class ApartmentRead(ApartmentBase, ORMModel):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class BlockBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=20)
    description: str | None = None
    sort_order: int = 0


class BlockCreate(BlockBase):
    pass


class BlockUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    code: str | None = Field(None, min_length=1, max_length=20)
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class BlockRead(BlockBase, ORMModel):
    id: str
    apartment_id: str
    floor_count: int
    total_flats: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class FloorBase(BaseModel):
    floor_number: int
    label: str | None = None


class FloorCreate(FloorBase):
    pass


class FloorUpdate(BaseModel):
    floor_number: int | None = None
    label: str | None = None
    is_active: bool | None = None


class FloorRead(FloorBase, ORMModel):
    id: str
    apartment_id: str
    block_id: str
    flat_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class FlatBase(BaseModel):
    flat_number: str = Field(..., min_length=1, max_length=20)
    area_sqft: float | None = None
    bedrooms: int | None = None
    flat_type: str | None = None
    parking_slots: int | None = None
    occupancy_status: str = "vacant"


class FlatCreate(FlatBase):
    block_id: str
    floor_id: str


class FlatUpdate(BaseModel):
    flat_number: str | None = Field(None, min_length=1, max_length=20)
    floor_id: str | None = None
    area_sqft: float | None = None
    bedrooms: int | None = None
    flat_type: str | None = None
    parking_slots: int | None = None
    occupancy_status: str | None = None
    is_active: bool | None = None


class FlatRead(FlatBase, ORMModel):
    id: str
    apartment_id: str
    block_id: str
    floor_id: str
    floor: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
