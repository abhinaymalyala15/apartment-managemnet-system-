from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ComplaintBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    priority: str = "medium"


class ComplaintCreate(ComplaintBase):
    pass


class ComplaintUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=500)
    description: str | None = None
    priority: str | None = None
    status: str | None = None
    assigned_to: str | None = None


class ComplaintAssignRequest(BaseModel):
    assigned_to: str


class ComplaintRead(ComplaintBase, ORMModel):
    id: str
    apartment_id: str
    flat_id: str
    flat_number: str | None = None
    status: str
    assigned_to: str | None
    resolved_at: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ComplaintsSummary(BaseModel):
    open_count: int
    in_progress_count: int
    resolved_count: int
    high_priority_open_count: int
