from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.communication_repository import CommunicationRepository
from app.repositories.complaints_repository import ComplaintsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.complaints import (
    ComplaintAssignRequest,
    ComplaintCreate,
    ComplaintRead,
    ComplaintsSummary,
    ComplaintUpdate,
)
from app.services.complaints_service import ComplaintsService

router = APIRouter(prefix="/apartments", tags=["complaints"])


def get_complaints_service(db: Session = Depends(get_db)) -> ComplaintsService:
    return ComplaintsService(
        ComplaintsRepository(db),
        StructureRepository(db),
        CommunicationRepository(db),
    )


@router.get("/{apartment_id}/complaints/summary", response_model=ComplaintsSummary)
def get_complaints_summary(
    apartment_id: str, service: ComplaintsService = Depends(get_complaints_service)
):
    return service.get_summary(apartment_id)


@router.get("/{apartment_id}/complaints", response_model=list[ComplaintRead])
def list_complaints(
    apartment_id: str,
    flat_id: str | None = Query(None),
    status: str | None = Query(None),
    priority: str | None = Query(None),
    service: ComplaintsService = Depends(get_complaints_service),
):
    return service.list_complaints(apartment_id, flat_id, status, priority)


@router.post("/{apartment_id}/flats/{flat_id}/complaints", response_model=ComplaintRead, status_code=201)
def create_complaint(
    apartment_id: str,
    flat_id: str,
    data: ComplaintCreate,
    service: ComplaintsService = Depends(get_complaints_service),
):
    return service.create_complaint(apartment_id, flat_id, data)


@router.get("/{apartment_id}/complaints/{complaint_id}", response_model=ComplaintRead)
def get_complaint(
    apartment_id: str,
    complaint_id: str,
    service: ComplaintsService = Depends(get_complaints_service),
):
    return service.get_complaint(apartment_id, complaint_id)


@router.patch("/{apartment_id}/complaints/{complaint_id}", response_model=ComplaintRead)
def update_complaint(
    apartment_id: str,
    complaint_id: str,
    data: ComplaintUpdate,
    service: ComplaintsService = Depends(get_complaints_service),
):
    return service.update_complaint(apartment_id, complaint_id, data)


@router.post("/{apartment_id}/complaints/{complaint_id}/assign", response_model=ComplaintRead)
def assign_complaint(
    apartment_id: str,
    complaint_id: str,
    data: ComplaintAssignRequest,
    service: ComplaintsService = Depends(get_complaints_service),
):
    return service.assign_complaint(apartment_id, complaint_id, data)


@router.post("/{apartment_id}/complaints/{complaint_id}/resolve", response_model=ComplaintRead)
def resolve_complaint(
    apartment_id: str,
    complaint_id: str,
    service: ComplaintsService = Depends(get_complaints_service),
):
    return service.resolve_complaint(apartment_id, complaint_id)
