from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import AuthContext, get_auth_context, require_membership_role
from app.db.session import get_db
from app.repositories.auth_repository import AuthRepository
from app.schemas.auth import AdminRoleRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/apartments", tags=["roles"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(AuthRepository(db), db)


@router.get("/{apartment_id}/roles", response_model=list[AdminRoleRead])
def list_admin_roles(
    apartment_id: str,
    _ctx: AuthContext = Depends(require_membership_role("admin", "inspector")),
    service: AuthService = Depends(get_auth_service),
):
    return service.list_admin_roles(apartment_id)
