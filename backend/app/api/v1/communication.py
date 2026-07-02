from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import AuthContext, optional_auth_context
from app.db.session import get_db
from app.repositories.communication_repository import CommunicationRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.communication import (
    CommunicationSummary,
    EmergencyNoticeCreate,
    NoticeArchiveRequest,
    NoticeCreate,
    NoticeHistoryRead,
    NoticePublishRequest,
    NoticeRead,
    NoticeScheduleRequest,
    NoticeUpdate,
    NotificationRead,
    TimelineEventRead,
)
from app.services.communication_service import CommunicationService

router = APIRouter(prefix="/apartments", tags=["communication"])


def get_communication_service(db: Session = Depends(get_db)) -> CommunicationService:
    return CommunicationService(CommunicationRepository(db), StructureRepository(db))


@router.get("/{apartment_id}/communication/summary", response_model=CommunicationSummary)
def get_communication_summary(
    apartment_id: str,
    service: CommunicationService = Depends(get_communication_service),
):
    return service.get_summary(apartment_id)


@router.get("/{apartment_id}/notices", response_model=list[NoticeRead])
def list_notices(
    apartment_id: str,
    lifecycle_status: str | None = Query(None),
    category: str | None = Query(None),
    is_emergency: bool | None = Query(None),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.list_notices(apartment_id, lifecycle_status, category, is_emergency)


@router.post("/{apartment_id}/notices", response_model=NoticeRead, status_code=201)
def create_notice(
    apartment_id: str,
    data: NoticeCreate,
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.create_notice(apartment_id, data, ctx.user_id if ctx else None)


@router.get("/{apartment_id}/notices/history", response_model=list[NoticeHistoryRead])
def list_notice_history(
    apartment_id: str,
    notice_id: str | None = Query(None),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.list_history(apartment_id, notice_id)


@router.post("/{apartment_id}/notices/emergency", response_model=NoticeRead, status_code=201)
def publish_emergency_notice(
    apartment_id: str,
    data: EmergencyNoticeCreate,
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.publish_emergency(apartment_id, data, ctx.user_id if ctx else None)


@router.get("/{apartment_id}/notices/{notice_id}", response_model=NoticeRead)
def get_notice(
    apartment_id: str,
    notice_id: str,
    service: CommunicationService = Depends(get_communication_service),
):
    return service.get_notice(apartment_id, notice_id)


@router.patch("/{apartment_id}/notices/{notice_id}", response_model=NoticeRead)
def update_notice(
    apartment_id: str,
    notice_id: str,
    data: NoticeUpdate,
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.update_notice(apartment_id, notice_id, data, ctx.user_id if ctx else None)


@router.post("/{apartment_id}/notices/{notice_id}/schedule", response_model=NoticeRead)
def schedule_notice(
    apartment_id: str,
    notice_id: str,
    data: NoticeScheduleRequest,
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.schedule_notice(apartment_id, notice_id, data, ctx.user_id if ctx else None)


@router.post("/{apartment_id}/notices/{notice_id}/publish", response_model=NoticeRead)
def publish_notice(
    apartment_id: str,
    notice_id: str,
    data: NoticePublishRequest = NoticePublishRequest(),
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.publish_notice(apartment_id, notice_id, data, ctx.user_id if ctx else None)


@router.post("/{apartment_id}/notices/{notice_id}/archive", response_model=NoticeRead)
def archive_notice(
    apartment_id: str,
    notice_id: str,
    data: NoticeArchiveRequest = NoticeArchiveRequest(),
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.archive_notice(apartment_id, notice_id, data, ctx.user_id if ctx else None)


@router.get("/{apartment_id}/notifications", response_model=list[NotificationRead])
def list_notifications(
    apartment_id: str,
    user_id: str | None = Query(None),
    flat_id: str | None = Query(None),
    unread_only: bool = Query(False),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.list_notifications(apartment_id, user_id, flat_id, unread_only)


@router.post("/{apartment_id}/notifications/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(
    apartment_id: str,
    notification_id: str,
    service: CommunicationService = Depends(get_communication_service),
):
    return service.mark_notification_read(apartment_id, notification_id)


@router.get("/{apartment_id}/timeline", response_model=list[TimelineEventRead])
def list_timeline(
    apartment_id: str,
    flat_id: str | None = Query(None),
    entity_type: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    service: CommunicationService = Depends(get_communication_service),
):
    return service.list_timeline(apartment_id, flat_id, entity_type, limit)
