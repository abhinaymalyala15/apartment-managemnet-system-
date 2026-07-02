from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import AuthContext, optional_auth_context
from app.db.session import get_db
from app.repositories.communication_repository import CommunicationRepository
from app.repositories.structure_repository import StructureRepository
from app.repositories.visitors_repository import VisitorsRepository
from app.schemas.visitors import VisitorCreate, VisitorRead, VisitorsSummary, VisitorUpdate
from app.services.visitors_service import VisitorsService

router = APIRouter(prefix="/apartments", tags=["visitors"])


def get_visitors_service(db: Session = Depends(get_db)) -> VisitorsService:
    return VisitorsService(
        VisitorsRepository(db),
        StructureRepository(db),
        CommunicationRepository(db),
    )


@router.get("/{apartment_id}/visitors/summary", response_model=VisitorsSummary)
def get_visitors_summary(
    apartment_id: str, service: VisitorsService = Depends(get_visitors_service)
):
    return service.get_summary(apartment_id)


@router.get("/{apartment_id}/visitors/today", response_model=list[VisitorRead])
def list_today_visitors(
    apartment_id: str,
    flat_id: str | None = Query(None),
    service: VisitorsService = Depends(get_visitors_service),
):
    return service.list_today(apartment_id, flat_id)


@router.get("/{apartment_id}/visitors", response_model=list[VisitorRead])
def list_visitors(
    apartment_id: str,
    flat_id: str | None = Query(None),
    status: str | None = Query(None),
    expected_date: date | None = Query(None),
    service: VisitorsService = Depends(get_visitors_service),
):
    return service.list_visitors(apartment_id, flat_id, status, expected_date)


@router.post("/{apartment_id}/flats/{flat_id}/visitors", response_model=VisitorRead, status_code=201)
def create_visitor(
    apartment_id: str,
    flat_id: str,
    data: VisitorCreate,
    service: VisitorsService = Depends(get_visitors_service),
):
    return service.create_visitor(apartment_id, flat_id, data)


@router.get("/{apartment_id}/visitors/{visitor_id}", response_model=VisitorRead)
def get_visitor(
    apartment_id: str,
    visitor_id: str,
    service: VisitorsService = Depends(get_visitors_service),
):
    return service.get_visitor(apartment_id, visitor_id)


@router.patch("/{apartment_id}/visitors/{visitor_id}", response_model=VisitorRead)
def update_visitor(
    apartment_id: str,
    visitor_id: str,
    data: VisitorUpdate,
    service: VisitorsService = Depends(get_visitors_service),
):
    return service.update_visitor(apartment_id, visitor_id, data)


@router.post("/{apartment_id}/visitors/{visitor_id}/approve", response_model=VisitorRead)
def approve_visitor(
    apartment_id: str,
    visitor_id: str,
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: VisitorsService = Depends(get_visitors_service),
):
    return service.approve_visitor(apartment_id, visitor_id, ctx.user_id if ctx else None)


@router.post("/{apartment_id}/visitors/{visitor_id}/reject", response_model=VisitorRead)
def reject_visitor(
    apartment_id: str,
    visitor_id: str,
    service: VisitorsService = Depends(get_visitors_service),
):
    return service.reject_visitor(apartment_id, visitor_id)


@router.post("/{apartment_id}/visitors/{visitor_id}/check-in", response_model=VisitorRead)
def check_in_visitor(
    apartment_id: str,
    visitor_id: str,
    service: VisitorsService = Depends(get_visitors_service),
):
    return service.check_in(apartment_id, visitor_id)


@router.post("/{apartment_id}/visitors/{visitor_id}/check-out", response_model=VisitorRead)
def check_out_visitor(
    apartment_id: str,
    visitor_id: str,
    service: VisitorsService = Depends(get_visitors_service),
):
    return service.check_out(apartment_id, visitor_id)
