from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class DocumentCreate(BaseModel):
    entity_type: str
    entity_id: str
    title: str = Field(..., min_length=1, max_length=500)
    category: str
    file_label: str
    storage_key: str | None = None
    mime_type: str | None = None
    file_size_bytes: int | None = None


class DocumentRead(ORMModel):
    id: str
    apartment_id: str
    entity_type: str
    entity_id: str
    title: str
    category: str
    file_label: str
    storage_key: str | None
    mime_type: str | None
    file_size_bytes: int | None
    uploaded_by: str | None
    uploaded_at: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime


class FlatNoteCreate(BaseModel):
    content: str = Field(..., min_length=1)
    author_name: str | None = None


class FlatNoteRead(ORMModel):
    id: str
    apartment_id: str
    flat_id: str
    author_user_id: str | None
    author_name: str
    content: str
    created_at: datetime


class AuditLogRead(ORMModel):
    id: str
    apartment_id: str | None
    user_id: str | None
    action: str
    entity_type: str
    entity_id: str | None
    old_values: str | None
    new_values: str | None
    ip_address: str | None
    created_at: datetime
