from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class VisitorBase(BaseModel):
    guest_name: str = Field(..., min_length=1, max_length=255)
    purpose: str | None = Field(None, max_length=500)
    expected_date: date
    expected_time: time | None = None


class VisitorCreate(VisitorBase):
    pass


class VisitorUpdate(BaseModel):
    guest_name: str | None = Field(None, min_length=1, max_length=255)
    purpose: str | None = None
    expected_date: date | None = None
    expected_time: time | None = None
    status: str | None = None


class VisitorRead(VisitorBase, ORMModel):
    id: str
    apartment_id: str
    flat_id: str
    flat_number: str | None = None
    status: str
    approved_by: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class VisitorsSummary(BaseModel):
    pending_count: int
    approved_today_count: int
    checked_in_count: int
    total_today_count: int
