from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import AuthContext, get_auth_context, require_platform_role
from app.db.session import get_db
from app.repositories.auth_repository import AuthRepository
from app.schemas.auth import (
    AdminRoleRead,
    ChangePasswordRequest,
    LoginRequest,
    LogoutRequest,
    MeResponse,
    PermissionRead,
    RefreshRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(AuthRepository(db), db)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, request: Request, service: AuthService = Depends(get_auth_service)):
    ip = request.client.host if request.client else None
    return service.login(data, ip=ip)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, request: Request, service: AuthService = Depends(get_auth_service)):
    ip = request.client.host if request.client else None
    return service.refresh(data.refresh_token, ip=ip)


@router.post("/logout", status_code=204)
def logout(data: LogoutRequest, service: AuthService = Depends(get_auth_service)):
    service.logout(data.refresh_token)


@router.post("/change-password", status_code=204)
def change_password(
    data: ChangePasswordRequest,
    ctx: AuthContext = Depends(get_auth_context),
    service: AuthService = Depends(get_auth_service),
):
    service.change_password(ctx.user_id, data)


@router.get("/me", response_model=MeResponse)
def me(
    ctx: AuthContext = Depends(get_auth_context),
    service: AuthService = Depends(get_auth_service),
):
    return service.get_me(ctx.user_id)


@router.get("/permissions", response_model=list[PermissionRead])
def list_permissions(
    _ctx: AuthContext = Depends(get_auth_context),
    service: AuthService = Depends(get_auth_service),
):
    return service.list_permissions()


@router.get("/platform/permissions", response_model=list[PermissionRead])
def list_permissions_platform(
    _ctx: AuthContext = Depends(require_platform_role("super_admin")),
    service: AuthService = Depends(get_auth_service),
):
    return service.list_permissions()
