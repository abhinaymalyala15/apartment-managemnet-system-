from pydantic import BaseModel


class FinanceReport(BaseModel):
    total_outstanding: float
    overdue_bills: int
    pending_bills: int
    collected_this_month: float
    open_follow_ups: int


class OccupancyReport(BaseModel):
    total_flats: int
    occupied: int
    vacant: int
    owner_occupied: int
    tenant_occupied: int
    occupancy_rate: float


class OperationsReport(BaseModel):
    pending_visitors: int
    open_complaints: int
    emergency_notices: int
    assets_amc_overdue: int
    upcoming_services: int


class ReportsOverview(BaseModel):
    finance: FinanceReport
    occupancy: OccupancyReport
    operations: OperationsReport
    published_notices: int
    total_residents: int
