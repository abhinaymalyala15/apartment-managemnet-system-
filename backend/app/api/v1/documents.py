from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import AuthContext, optional_auth_context
from app.db.session import get_db
from app.repositories.documents_repository import DocumentsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.documents import AuditLogRead, DocumentCreate, DocumentRead, FlatNoteCreate, FlatNoteRead
from app.services.documents_service import DocumentsService

router = APIRouter(prefix="/apartments", tags=["documents"])


def get_documents_service(db: Session = Depends(get_db)) -> DocumentsService:
    return DocumentsService(DocumentsRepository(db), StructureRepository(db))


@router.get("/{apartment_id}/documents", response_model=list[DocumentRead])
def list_documents(
    apartment_id: str,
    entity_type: str | None = Query(None),
    entity_id: str | None = Query(None),
    category: str | None = Query(None),
    service: DocumentsService = Depends(get_documents_service),
):
    return service.list_documents(apartment_id, entity_type, entity_id, category)


@router.post("/{apartment_id}/documents", response_model=DocumentRead, status_code=201)
def create_document(
    apartment_id: str,
    data: DocumentCreate,
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: DocumentsService = Depends(get_documents_service),
):
    return service.create_document(apartment_id, data, ctx.user_id if ctx else None)


@router.get("/{apartment_id}/documents/{document_id}", response_model=DocumentRead)
def get_document(
    apartment_id: str,
    document_id: str,
    service: DocumentsService = Depends(get_documents_service),
):
    return service.get_document(apartment_id, document_id)


@router.get("/{apartment_id}/flats/{flat_id}/internal-notes", response_model=list[FlatNoteRead])
def list_flat_notes(
    apartment_id: str,
    flat_id: str,
    service: DocumentsService = Depends(get_documents_service),
):
    return service.list_flat_notes(apartment_id, flat_id)


@router.post("/{apartment_id}/flats/{flat_id}/internal-notes", response_model=FlatNoteRead, status_code=201)
def create_flat_note(
    apartment_id: str,
    flat_id: str,
    data: FlatNoteCreate,
    ctx: AuthContext | None = Depends(optional_auth_context),
    service: DocumentsService = Depends(get_documents_service),
):
    return service.create_flat_note(apartment_id, flat_id, data, ctx.user_id if ctx else None)


@router.get("/{apartment_id}/audit-logs", response_model=list[AuditLogRead])
def list_audit_logs(
    apartment_id: str,
    entity_type: str | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    service: DocumentsService = Depends(get_documents_service),
):
    return service.list_audit_logs(apartment_id, entity_type, limit)
