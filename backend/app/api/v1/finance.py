from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import AuthContext, get_auth_context, optional_auth_context
from app.db.session import get_db
from app.repositories.finance_repository import FinanceRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.finance import (
    BillCreate,
    BillRead,
    BillingConfigCreate,
    BillingConfigRead,
    BillingPeriodCreate,
    BillingPeriodRead,
    BillingPeriodUpdate,
    FlatFinanceSummary,
    FollowUpCreate,
    FollowUpRead,
    FollowUpUpdate,
    PaymentCreate,
    PaymentRead,
    ReceiptRead,
)
from app.services.finance_service import FinanceService

router = APIRouter(prefix="/apartments", tags=["finance"])


def get_finance_service(db: Session = Depends(get_db)) -> FinanceService:
    return FinanceService(FinanceRepository(db), StructureRepository(db))


@router.get("/{apartment_id}/billing-config/current", response_model=BillingConfigRead | None)
def get_current_billing_config(
    apartment_id: str, service: FinanceService = Depends(get_finance_service)
):
    return service.get_current_billing_config(apartment_id)


@router.post("/{apartment_id}/billing-config", response_model=BillingConfigRead, status_code=201)
def create_billing_config(
    apartment_id: str,
    data: BillingConfigCreate,
    service: FinanceService = Depends(get_finance_service),
):
    return service.create_billing_config(apartment_id, data)


@router.get("/{apartment_id}/billing-periods", response_model=list[BillingPeriodRead])
def list_billing_periods(
    apartment_id: str, service: FinanceService = Depends(get_finance_service)
):
    return service.list_billing_periods(apartment_id)


@router.post("/{apartment_id}/billing-periods", response_model=BillingPeriodRead, status_code=201)
def create_billing_period(
    apartment_id: str,
    data: BillingPeriodCreate,
    service: FinanceService = Depends(get_finance_service),
):
    return service.create_billing_period(apartment_id, data)


@router.get("/{apartment_id}/bills", response_model=list[BillRead])
def list_bills(
    apartment_id: str,
    flat_id: str | None = Query(None),
    period_id: str | None = Query(None),
    status: str | None = Query(None),
    service: FinanceService = Depends(get_finance_service),
):
    return service.list_bills(apartment_id, flat_id, period_id, status)


@router.post("/{apartment_id}/flats/{flat_id}/bills", response_model=BillRead, status_code=201)
def create_bill(
    apartment_id: str,
    flat_id: str,
    data: BillCreate,
    service: FinanceService = Depends(get_finance_service),
):
    return service.create_bill(apartment_id, flat_id, data)


@router.get("/{apartment_id}/payments", response_model=list[PaymentRead])
def list_payments(
    apartment_id: str,
    flat_id: str | None = Query(None),
    service: FinanceService = Depends(get_finance_service),
):
    return service.list_payments(apartment_id, flat_id)


@router.post("/{apartment_id}/flats/{flat_id}/payments", response_model=PaymentRead, status_code=201)
def record_payment(
    apartment_id: str,
    flat_id: str,
    data: PaymentCreate,
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: FinanceService = Depends(get_finance_service),
):
    recorded_by = ctx.user_id if ctx else None
    return service.record_payment(apartment_id, flat_id, data, recorded_by)


@router.get("/{apartment_id}/payments/{payment_id}", response_model=PaymentRead)
def get_payment(
    apartment_id: str,
    payment_id: str,
    service: FinanceService = Depends(get_finance_service),
):
    return service.get_payment(apartment_id, payment_id)


@router.post("/{apartment_id}/payments/{payment_id}/void", response_model=PaymentRead)
def void_payment(
    apartment_id: str,
    payment_id: str,
    service: FinanceService = Depends(get_finance_service),
):
    return service.void_payment(apartment_id, payment_id)


@router.get("/{apartment_id}/receipts", response_model=list[ReceiptRead])
def list_receipts(
    apartment_id: str,
    flat_id: str | None = Query(None),
    service: FinanceService = Depends(get_finance_service),
):
    return service.list_receipts(apartment_id, flat_id)


@router.get("/{apartment_id}/receipts/{receipt_id}", response_model=ReceiptRead)
def get_receipt(
    apartment_id: str,
    receipt_id: str,
    service: FinanceService = Depends(get_finance_service),
):
    return service.get_receipt(apartment_id, receipt_id)


@router.get("/{apartment_id}/flats/{flat_id}/finance", response_model=FlatFinanceSummary)
def get_flat_finance(
    apartment_id: str,
    flat_id: str,
    service: FinanceService = Depends(get_finance_service),
):
    return service.get_flat_finance_summary(apartment_id, flat_id)


@router.get("/{apartment_id}/follow-ups", response_model=list[FollowUpRead])
def list_follow_ups(
    apartment_id: str,
    flat_id: str | None = Query(None),
    service: FinanceService = Depends(get_finance_service),
):
    return service.list_follow_ups(apartment_id, flat_id)


@router.post("/{apartment_id}/follow-ups", response_model=FollowUpRead, status_code=201)
def create_follow_up(
    apartment_id: str,
    data: FollowUpCreate,
    service: FinanceService = Depends(get_finance_service),
):
    return service.create_follow_up(apartment_id, data)


@router.patch("/{apartment_id}/follow-ups/{follow_up_id}", response_model=FollowUpRead)
def update_follow_up(
    apartment_id: str,
    follow_up_id: str,
    data: FollowUpUpdate,
    service: FinanceService = Depends(get_finance_service),
):
    return service.update_follow_up(apartment_id, follow_up_id, data)
