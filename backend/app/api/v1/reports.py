from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.reports_repository import ReportsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.reports import FinanceReport, OccupancyReport, OperationsReport, ReportsOverview
from app.services.reports_service import ReportsService

router = APIRouter(prefix="/apartments", tags=["reports"])


def get_reports_service(db: Session = Depends(get_db)) -> ReportsService:
    return ReportsService(ReportsRepository(db), StructureRepository(db))


@router.get("/{apartment_id}/reports/overview", response_model=ReportsOverview)
def get_reports_overview(
    apartment_id: str, service: ReportsService = Depends(get_reports_service)
):
    return service.get_overview(apartment_id)


@router.get("/{apartment_id}/reports/finance", response_model=FinanceReport)
def get_finance_report(
    apartment_id: str, service: ReportsService = Depends(get_reports_service)
):
    return service.get_finance_report(apartment_id)


@router.get("/{apartment_id}/reports/occupancy", response_model=OccupancyReport)
def get_occupancy_report(
    apartment_id: str, service: ReportsService = Depends(get_reports_service)
):
    return service.get_occupancy_report(apartment_id)


@router.get("/{apartment_id}/reports/operations", response_model=OperationsReport)
def get_operations_report(
    apartment_id: str, service: ReportsService = Depends(get_reports_service)
):
    return service.get_operations_report(apartment_id)
