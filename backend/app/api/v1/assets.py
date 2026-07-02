from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import AuthContext, optional_auth_context
from app.db.session import get_db
from app.repositories.assets_repository import AssetsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.assets import (
    AmcCreate,
    AmcRead,
    AmcRenewRequest,
    AssetCreate,
    AssetDetailRead,
    AssetNoteCreate,
    AssetNoteRead,
    AssetRead,
    AssetServiceCreate,
    AssetServiceRead,
    AssetServiceUpdate,
    AssetUpdate,
    AssetsSummary,
    ServiceScheduleCreate,
    ServiceScheduleRead,
    ServiceScheduleUpdate,
    VendorCreate,
    VendorRead,
    VendorUpdate,
)
from app.services.assets_service import AssetsService

router = APIRouter(prefix="/apartments", tags=["assets"])


def get_assets_service(db: Session = Depends(get_db)) -> AssetsService:
    return AssetsService(AssetsRepository(db), StructureRepository(db))


@router.get("/{apartment_id}/assets/summary", response_model=AssetsSummary)
def get_assets_summary(
    apartment_id: str, service: AssetsService = Depends(get_assets_service)
):
    return service.get_summary(apartment_id)


@router.get("/{apartment_id}/vendors", response_model=list[VendorRead])
def list_vendors(apartment_id: str, service: AssetsService = Depends(get_assets_service)):
    return service.list_vendors(apartment_id)


@router.post("/{apartment_id}/vendors", response_model=VendorRead, status_code=201)
def create_vendor(
    apartment_id: str, data: VendorCreate, service: AssetsService = Depends(get_assets_service)
):
    return service.create_vendor(apartment_id, data)


@router.patch("/{apartment_id}/vendors/{vendor_id}", response_model=VendorRead)
def update_vendor(
    apartment_id: str,
    vendor_id: str,
    data: VendorUpdate,
    service: AssetsService = Depends(get_assets_service),
):
    return service.update_vendor(apartment_id, vendor_id, data)


@router.get("/{apartment_id}/assets", response_model=list[AssetRead])
def list_assets(
    apartment_id: str,
    asset_type: str | None = Query(None),
    status: str | None = Query(None),
    scope: str | None = Query(None),
    service: AssetsService = Depends(get_assets_service),
):
    return service.list_assets(apartment_id, asset_type, status, scope)


@router.post("/{apartment_id}/assets", response_model=AssetRead, status_code=201)
def create_asset(
    apartment_id: str, data: AssetCreate, service: AssetsService = Depends(get_assets_service)
):
    return service.create_asset(apartment_id, data)


@router.get("/{apartment_id}/assets/{asset_id}/detail", response_model=AssetDetailRead)
def get_asset_detail(
    apartment_id: str, asset_id: str, service: AssetsService = Depends(get_assets_service)
):
    return service.get_asset_detail(apartment_id, asset_id)


@router.get("/{apartment_id}/assets/{asset_id}", response_model=AssetRead)
def get_asset(
    apartment_id: str, asset_id: str, service: AssetsService = Depends(get_assets_service)
):
    return service.get_asset(apartment_id, asset_id)


@router.patch("/{apartment_id}/assets/{asset_id}", response_model=AssetRead)
def update_asset(
    apartment_id: str,
    asset_id: str,
    data: AssetUpdate,
    service: AssetsService = Depends(get_assets_service),
):
    return service.update_asset(apartment_id, asset_id, data)


@router.get("/{apartment_id}/assets/{asset_id}/amc", response_model=list[AmcRead])
def list_amc(
    apartment_id: str, asset_id: str, service: AssetsService = Depends(get_assets_service)
):
    return service.list_amc(apartment_id, asset_id)


@router.post("/{apartment_id}/assets/{asset_id}/amc", response_model=AmcRead, status_code=201)
def create_amc(
    apartment_id: str,
    asset_id: str,
    data: AmcCreate,
    service: AssetsService = Depends(get_assets_service),
):
    return service.create_amc(apartment_id, asset_id, data)


@router.post("/{apartment_id}/assets/{asset_id}/amc/renew", response_model=AmcRead)
def renew_amc(
    apartment_id: str,
    asset_id: str,
    data: AmcRenewRequest,
    service: AssetsService = Depends(get_assets_service),
):
    return service.renew_amc(apartment_id, asset_id, data)


@router.get("/{apartment_id}/asset-services", response_model=list[AssetServiceRead])
def list_asset_services(
    apartment_id: str,
    asset_id: str | None = Query(None),
    status: str | None = Query(None),
    service: AssetsService = Depends(get_assets_service),
):
    return service.list_asset_services(apartment_id, asset_id, status)


@router.post("/{apartment_id}/assets/{asset_id}/services", response_model=AssetServiceRead, status_code=201)
def create_asset_service(
    apartment_id: str,
    asset_id: str,
    data: AssetServiceCreate,
    service: AssetsService = Depends(get_assets_service),
):
    return service.create_asset_service(apartment_id, asset_id, data)


@router.patch("/{apartment_id}/asset-services/{service_id}", response_model=AssetServiceRead)
def update_asset_service(
    apartment_id: str,
    service_id: str,
    data: AssetServiceUpdate,
    service: AssetsService = Depends(get_assets_service),
):
    return service.update_asset_service(apartment_id, service_id, data)


@router.get("/{apartment_id}/service-schedules", response_model=list[ServiceScheduleRead])
def list_service_schedules(
    apartment_id: str,
    flat_id: str | None = Query(None),
    status: str | None = Query(None),
    service: AssetsService = Depends(get_assets_service),
):
    return service.list_service_schedules(apartment_id, flat_id, status)


@router.post("/{apartment_id}/service-schedules", response_model=ServiceScheduleRead, status_code=201)
def create_service_schedule(
    apartment_id: str,
    data: ServiceScheduleCreate,
    service: AssetsService = Depends(get_assets_service),
):
    return service.create_service_schedule(apartment_id, data)


@router.patch("/{apartment_id}/service-schedules/{schedule_id}", response_model=ServiceScheduleRead)
def update_service_schedule(
    apartment_id: str,
    schedule_id: str,
    data: ServiceScheduleUpdate,
    service: AssetsService = Depends(get_assets_service),
):
    return service.update_service_schedule(apartment_id, schedule_id, data)


@router.get("/{apartment_id}/assets/{asset_id}/notes", response_model=list[AssetNoteRead])
def list_asset_notes(
    apartment_id: str, asset_id: str, service: AssetsService = Depends(get_assets_service)
):
    return service.list_asset_notes(apartment_id, asset_id)


@router.post("/{apartment_id}/assets/{asset_id}/notes", response_model=AssetNoteRead, status_code=201)
def create_asset_note(
    apartment_id: str,
    asset_id: str,
    data: AssetNoteCreate,
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: AssetsService = Depends(get_assets_service),
):
    return service.create_asset_note(apartment_id, asset_id, data, ctx.user_id if ctx else None)
