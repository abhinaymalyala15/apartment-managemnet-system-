from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.settings_repository import SettingsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.settings import (
    ContactsBundle,
    GalleryImageRead,
    IntegrationRead,
    IntegrationUpdate,
    PreferencesRead,
    PreferencesUpdate,
    SettingsBundle,
)
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/apartments", tags=["settings"])


def get_settings_service(db: Session = Depends(get_db)) -> SettingsService:
    return SettingsService(SettingsRepository(db), StructureRepository(db))


@router.get("/{apartment_id}/settings", response_model=SettingsBundle)
def get_settings(apartment_id: str, service: SettingsService = Depends(get_settings_service)):
    return service.get_settings(apartment_id)


@router.patch("/{apartment_id}/settings/preferences", response_model=PreferencesRead)
def update_preferences(
    apartment_id: str,
    data: PreferencesUpdate,
    service: SettingsService = Depends(get_settings_service),
):
    return service.update_preferences(apartment_id, data)


@router.patch("/{apartment_id}/settings/integrations/{integration_id}", response_model=IntegrationRead)
def update_integration(
    apartment_id: str,
    integration_id: str,
    data: IntegrationUpdate,
    service: SettingsService = Depends(get_settings_service),
):
    return service.update_integration(apartment_id, integration_id, data)


@router.get("/{apartment_id}/contacts", response_model=ContactsBundle)
def get_contacts(apartment_id: str, service: SettingsService = Depends(get_settings_service)):
    return service.get_contacts(apartment_id)


@router.get("/{apartment_id}/gallery", response_model=list[GalleryImageRead])
def list_gallery(apartment_id: str, service: SettingsService = Depends(get_settings_service)):
    return service.list_gallery(apartment_id)
