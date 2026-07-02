from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PreferencesRead(ORMModel):
    id: str
    apartment_id: str
    timezone: str
    date_format: str
    currency: str
    locale: str
    fiscal_year_start_month: int
    default_notice_channel: str
    auto_archive_notices_days: int


class PreferencesUpdate(BaseModel):
    timezone: str | None = None
    date_format: str | None = None
    currency: str | None = None
    locale: str | None = None
    fiscal_year_start_month: int | None = Field(None, ge=1, le=12)
    default_notice_channel: str | None = None
    auto_archive_notices_days: int | None = Field(None, ge=0)


class CommitteeMemberRead(ORMModel):
    id: str
    apartment_id: str
    name: str
    role: str
    phone: str | None
    email: str | None
    sort_order: int
    is_active: bool


class EmergencyContactRead(ORMModel):
    id: str
    apartment_id: str
    label: str
    phone: str
    hours: str | None
    role: str | None
    sort_order: int
    is_active: bool


class OfficeContactRead(ORMModel):
    id: str
    apartment_id: str
    label: str
    phone: str | None
    email: str | None
    hours: str | None
    is_active: bool


class IntegrationRead(ORMModel):
    id: str
    apartment_id: str
    integration_code: str
    label: str
    description: str | None
    enabled: bool
    phase: str | None
    is_active: bool


class IntegrationUpdate(BaseModel):
    enabled: bool


class GalleryImageRead(ORMModel):
    id: str
    apartment_id: str
    title: str
    category: str | None
    image_url: str
    caption: str | None
    sort_order: int
    is_active: bool


class ContactsBundle(BaseModel):
    committee: list[CommitteeMemberRead]
    emergency: list[EmergencyContactRead]
    office: OfficeContactRead | None


class SettingsBundle(BaseModel):
    preferences: PreferencesRead
    integrations: list[IntegrationRead]
    contacts: ContactsBundle
