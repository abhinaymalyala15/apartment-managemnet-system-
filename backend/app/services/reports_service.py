from app.core.exceptions import NotFoundError
from app.repositories.reports_repository import ReportsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.reports import (
    FinanceReport,
    OccupancyReport,
    OperationsReport,
    ReportsOverview,
)


class ReportsService:
    def __init__(self, repo: ReportsRepository, structure_repo: StructureRepository):
        self.repo = repo
        self.structure_repo = structure_repo

    def _get_apartment(self, apartment_id: str):
        apt = self.structure_repo.get_apartment(apartment_id)
        if not apt:
            raise NotFoundError("Apartment not found")
        return apt

    def get_overview(self, apartment_id: str) -> ReportsOverview:
        self._get_apartment(apartment_id)
        return ReportsOverview(
            finance=FinanceReport(**self.repo.finance_stats(apartment_id)),
            occupancy=OccupancyReport(**self.repo.occupancy_stats(apartment_id)),
            operations=OperationsReport(**self.repo.operations_stats(apartment_id)),
            published_notices=self.repo.published_notices(apartment_id),
            total_residents=self.repo.resident_count(apartment_id),
        )

    def get_finance_report(self, apartment_id: str) -> FinanceReport:
        self._get_apartment(apartment_id)
        return FinanceReport(**self.repo.finance_stats(apartment_id))

    def get_occupancy_report(self, apartment_id: str) -> OccupancyReport:
        self._get_apartment(apartment_id)
        return OccupancyReport(**self.repo.occupancy_stats(apartment_id))

    def get_operations_report(self, apartment_id: str) -> OperationsReport:
        self._get_apartment(apartment_id)
        return OperationsReport(**self.repo.operations_stats(apartment_id))
