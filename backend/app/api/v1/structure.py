from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.structure_repository import StructureRepository
from app.schemas.structure import (
    ApartmentCreate,
    ApartmentRead,
    ApartmentUpdate,
    BlockCreate,
    BlockRead,
    BlockUpdate,
    FlatCreate,
    FlatRead,
    FlatUpdate,
    FloorCreate,
    FloorRead,
    FloorUpdate,
    SoftDeleteParams,
)
from app.services.structure_service import StructureService

router = APIRouter(prefix="/apartments", tags=["structure"])


def get_structure_service(db: Session = Depends(get_db)) -> StructureService:
    return StructureService(StructureRepository(db))


@router.get("", response_model=list[ApartmentRead])
def list_apartments(service: StructureService = Depends(get_structure_service)):
    return service.list_apartments()


@router.post("", response_model=ApartmentRead, status_code=201)
def create_apartment(
    data: ApartmentCreate, service: StructureService = Depends(get_structure_service)
):
    return service.create_apartment(data)


@router.get("/{apartment_id}", response_model=ApartmentRead)
def get_apartment(apartment_id: str, service: StructureService = Depends(get_structure_service)):
    return service.get_apartment(apartment_id)


@router.patch("/{apartment_id}", response_model=ApartmentRead)
def update_apartment(
    apartment_id: str,
    data: ApartmentUpdate,
    service: StructureService = Depends(get_structure_service),
):
    return service.update_apartment(apartment_id, data)


@router.delete("/{apartment_id}", status_code=204)
def delete_apartment(
    apartment_id: str,
    params: SoftDeleteParams = Depends(),
    service: StructureService = Depends(get_structure_service),
):
    service.delete_apartment(apartment_id, params.deleted_by)


@router.get("/{apartment_id}/blocks", response_model=list[BlockRead])
def list_blocks(apartment_id: str, service: StructureService = Depends(get_structure_service)):
    return service.list_blocks(apartment_id)


@router.post("/{apartment_id}/blocks", response_model=BlockRead, status_code=201)
def create_block(
    apartment_id: str,
    data: BlockCreate,
    service: StructureService = Depends(get_structure_service),
):
    return service.create_block(apartment_id, data)


@router.get("/{apartment_id}/blocks/{block_id}", response_model=BlockRead)
def get_block(
    apartment_id: str,
    block_id: str,
    service: StructureService = Depends(get_structure_service),
):
    return service.get_block(apartment_id, block_id)


@router.patch("/{apartment_id}/blocks/{block_id}", response_model=BlockRead)
def update_block(
    apartment_id: str,
    block_id: str,
    data: BlockUpdate,
    service: StructureService = Depends(get_structure_service),
):
    return service.update_block(apartment_id, block_id, data)


@router.delete("/{apartment_id}/blocks/{block_id}", status_code=204)
def delete_block(
    apartment_id: str,
    block_id: str,
    params: SoftDeleteParams = Depends(),
    service: StructureService = Depends(get_structure_service),
):
    service.delete_block(apartment_id, block_id, params.deleted_by)


@router.get("/{apartment_id}/blocks/{block_id}/floors", response_model=list[FloorRead])
def list_floors(
    apartment_id: str,
    block_id: str,
    service: StructureService = Depends(get_structure_service),
):
    return service.list_floors(apartment_id, block_id)


@router.post("/{apartment_id}/blocks/{block_id}/floors", response_model=FloorRead, status_code=201)
def create_floor(
    apartment_id: str,
    block_id: str,
    data: FloorCreate,
    service: StructureService = Depends(get_structure_service),
):
    return service.create_floor(apartment_id, block_id, data)


@router.get("/{apartment_id}/blocks/{block_id}/floors/{floor_id}", response_model=FloorRead)
def get_floor(
    apartment_id: str,
    block_id: str,
    floor_id: str,
    service: StructureService = Depends(get_structure_service),
):
    return service.get_floor(apartment_id, block_id, floor_id)


@router.patch("/{apartment_id}/blocks/{block_id}/floors/{floor_id}", response_model=FloorRead)
def update_floor(
    apartment_id: str,
    block_id: str,
    floor_id: str,
    data: FloorUpdate,
    service: StructureService = Depends(get_structure_service),
):
    return service.update_floor(apartment_id, block_id, floor_id, data)


@router.delete("/{apartment_id}/blocks/{block_id}/floors/{floor_id}", status_code=204)
def delete_floor(
    apartment_id: str,
    block_id: str,
    floor_id: str,
    params: SoftDeleteParams = Depends(),
    service: StructureService = Depends(get_structure_service),
):
    service.delete_floor(apartment_id, block_id, floor_id, params.deleted_by)


@router.get("/{apartment_id}/flats", response_model=list[FlatRead])
def list_flats(
    apartment_id: str,
    block_id: str | None = Query(None),
    floor_id: str | None = Query(None),
    service: StructureService = Depends(get_structure_service),
):
    return service.list_flats(apartment_id, block_id, floor_id)


@router.post("/{apartment_id}/flats", response_model=FlatRead, status_code=201)
def create_flat(
    apartment_id: str,
    data: FlatCreate,
    service: StructureService = Depends(get_structure_service),
):
    return service.create_flat(apartment_id, data)


@router.get("/{apartment_id}/flats/{flat_id}", response_model=FlatRead)
def get_flat(
    apartment_id: str,
    flat_id: str,
    service: StructureService = Depends(get_structure_service),
):
    return service.get_flat(apartment_id, flat_id)


@router.patch("/{apartment_id}/flats/{flat_id}", response_model=FlatRead)
def update_flat(
    apartment_id: str,
    flat_id: str,
    data: FlatUpdate,
    service: StructureService = Depends(get_structure_service),
):
    return service.update_flat(apartment_id, flat_id, data)


@router.delete("/{apartment_id}/flats/{flat_id}", status_code=204)
def delete_flat(
    apartment_id: str,
    flat_id: str,
    params: SoftDeleteParams = Depends(),
    service: StructureService = Depends(get_structure_service),
):
    service.delete_flat(apartment_id, flat_id, params.deleted_by)
