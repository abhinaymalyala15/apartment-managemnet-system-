from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class VendorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str
    phone: str | None = None
    email: str | None = None
    contact_person: str | None = None


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    category: str | None = None
    phone: str | None = None
    email: str | None = None
    contact_person: str | None = None
    is_active: bool | None = None


class VendorRead(VendorBase, ORMModel):
    id: str
    apartment_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AssetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    asset_type: str
    scope: str = "community"
    location: str | None = None
    block_id: str | None = None
    flat_id: str | None = None
    primary_vendor_id: str | None = None
    installation_date: date | None = None
    warranty_expiry: date | None = None
    status: str = "active"


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    asset_type: str | None = None
    scope: str | None = None
    location: str | None = None
    block_id: str | None = None
    flat_id: str | None = None
    primary_vendor_id: str | None = None
    installation_date: date | None = None
    warranty_expiry: date | None = None
    status: str | None = None
    is_active: bool | None = None


class AssetRead(AssetBase, ORMModel):
    id: str
    apartment_id: str
    last_service_date: date | None
    next_service_date: date | None
    amc_expiry_date: date | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    primary_vendor_name: str | None = None


class AmcBase(BaseModel):
    vendor_id: str
    start_date: date
    end_date: date
    renewal_reminder_days: int = Field(30, ge=0)
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None


class AmcCreate(AmcBase):
    pass


class AmcRenewRequest(BaseModel):
    vendor_id: str | None = None
    start_date: date
    end_date: date
    renewal_reminder_days: int = Field(30, ge=0)
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None


class AmcRead(AmcBase, ORMModel):
    id: str
    apartment_id: str
    asset_id: str
    is_current: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    vendor_name: str | None = None


class AssetServiceBase(BaseModel):
    title: str
    description: str | None = None
    service_type: str
    scheduled_date: date
    scheduled_time: str | None = None
    scope: str = "community"
    flat_id: str | None = None
    vendor_id: str | None = None
    technician: str | None = None
    frequency: str | None = None
    next_due_date: date | None = None
    remarks: str | None = None


class AssetServiceCreate(AssetServiceBase):
    pass


class AssetServiceUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    service_type: str | None = None
    scheduled_date: date | None = None
    scheduled_time: str | None = None
    vendor_id: str | None = None
    technician: str | None = None
    status: str | None = None
    completed_date: date | None = None
    frequency: str | None = None
    next_due_date: date | None = None
    remarks: str | None = None


class AssetServiceRead(AssetServiceBase, ORMModel):
    id: str
    apartment_id: str
    asset_id: str | None
    status: str
    completed_date: date | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    vendor_name: str | None = None


class ServiceScheduleBase(BaseModel):
    title: str
    description: str | None = None
    service_type: str
    scheduled_date: date
    scheduled_time: str | None = None
    flat_id: str | None = None
    vendor_name: str | None = None
    vendor_id: str | None = None
    frequency: str | None = None
    last_service_date: date | None = None
    next_due_date: date | None = None


class ServiceScheduleCreate(ServiceScheduleBase):
    pass


class ServiceScheduleUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    service_type: str | None = None
    scheduled_date: date | None = None
    scheduled_time: str | None = None
    flat_id: str | None = None
    vendor_name: str | None = None
    vendor_id: str | None = None
    status: str | None = None
    frequency: str | None = None
    last_service_date: date | None = None
    next_due_date: date | None = None


class ServiceScheduleRead(ServiceScheduleBase, ORMModel):
    id: str
    apartment_id: str
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AssetNoteCreate(BaseModel):
    content: str = Field(..., min_length=1)
    author_name: str | None = None


class AssetNoteRead(ORMModel):
    id: str
    apartment_id: str
    asset_id: str
    author_user_id: str | None
    author_name: str
    content: str
    created_at: datetime


class AssetDetailRead(BaseModel):
    asset: AssetRead
    amc_records: list[AmcRead]
    service_records: list[AssetServiceRead]
    notes: list[AssetNoteRead]


class AssetsSummary(BaseModel):
    total_assets: int
    active_count: int
    amc_overdue_count: int
    service_due_soon_count: int
    under_maintenance_count: int
    upcoming_services: int
    vendor_count: int
