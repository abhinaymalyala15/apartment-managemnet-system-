from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class PersonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: str | None = None
    phone: str | None = None


class MembershipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    apartment_id: str
    apartment_name: str | None = None
    role: str
    flat_id: str | None = None
    flat_number: str | None = None
    admin_role_id: str | None = None
    admin_role_label: str | None = None


class PermissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    module: str
    description: str | None = None


class AdminRoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    label: str
    description: str | None = None
    scope: str
    permissions: list[PermissionRead] = Field(default_factory=list)


class MeResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str | None = None
    person: PersonSummary | None = None
    platform_role: str | None = None
    memberships: list[MembershipRead] = Field(default_factory=list)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    phone: str | None = None
    person_id: str | None = None


class MembershipCreate(BaseModel):
    apartment_id: str
    role: str
    flat_id: str | None = None
    admin_role_id: str | None = None
