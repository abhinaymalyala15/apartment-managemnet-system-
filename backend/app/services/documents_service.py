from datetime import datetime, timezone

from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import new_uuid
from app.models.documents import Document, FlatInternalNote
from app.repositories.documents_repository import DocumentsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.documents import DocumentCreate, DocumentRead, FlatNoteCreate, FlatNoteRead


class DocumentsService:
    VALID_ENTITY_TYPES = {"apartment", "flat", "asset"}

    def __init__(self, repo: DocumentsRepository, structure_repo: StructureRepository):
        self.repo = repo
        self.structure_repo = structure_repo

    def _get_apartment(self, apartment_id: str):
        apt = self.structure_repo.get_apartment(apartment_id)
        if not apt:
            raise NotFoundError("Apartment not found")
        return apt

    def list_documents(
        self,
        apartment_id: str,
        entity_type: str | None = None,
        entity_id: str | None = None,
        category: str | None = None,
    ) -> list[DocumentRead]:
        self._get_apartment(apartment_id)
        return [
            DocumentRead.model_validate(d)
            for d in self.repo.list_documents(apartment_id, entity_type, entity_id, category)
        ]

    def create_document(
        self, apartment_id: str, data: DocumentCreate, uploaded_by: str | None = None
    ) -> DocumentRead:
        self._get_apartment(apartment_id)
        if data.entity_type not in self.VALID_ENTITY_TYPES:
            raise ConflictError(f"Invalid entity_type: {data.entity_type}")
        if data.entity_type == "flat" and not self.structure_repo.get_flat(apartment_id, data.entity_id):
            raise NotFoundError("Flat not found")

        doc = Document(
            id=new_uuid(),
            apartment_id=apartment_id,
            uploaded_by=uploaded_by,
            uploaded_at=datetime.now(timezone.utc),
            **data.model_dump(),
        )
        return DocumentRead.model_validate(self.repo.create_document(doc))

    def get_document(self, apartment_id: str, document_id: str) -> DocumentRead:
        doc = self.repo.get_document(apartment_id, document_id)
        if not doc:
            raise NotFoundError("Document not found")
        return DocumentRead.model_validate(doc)

    def list_flat_notes(self, apartment_id: str, flat_id: str) -> list[FlatNoteRead]:
        if not self.structure_repo.get_flat(apartment_id, flat_id):
            raise NotFoundError("Flat not found")
        return [FlatNoteRead.model_validate(n) for n in self.repo.list_flat_notes(apartment_id, flat_id)]

    def create_flat_note(
        self,
        apartment_id: str,
        flat_id: str,
        data: FlatNoteCreate,
        author_user_id: str | None = None,
    ) -> FlatNoteRead:
        if not self.structure_repo.get_flat(apartment_id, flat_id):
            raise NotFoundError("Flat not found")
        note = FlatInternalNote(
            id=new_uuid(),
            apartment_id=apartment_id,
            flat_id=flat_id,
            author_user_id=author_user_id,
            author_name=data.author_name or "Staff",
            content=data.content,
        )
        return FlatNoteRead.model_validate(self.repo.create_flat_note(note))

    def list_audit_logs(self, apartment_id: str, entity_type: str | None = None, limit: int = 100):
        self._get_apartment(apartment_id)
        from app.schemas.documents import AuditLogRead

        return [
            AuditLogRead.model_validate(log)
            for log in self.repo.list_audit_logs(apartment_id, entity_type, limit)
        ]
