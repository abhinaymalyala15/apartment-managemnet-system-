from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.documents import AuditLog, Document, FlatInternalNote
from app.models.settings import (
    CommitteeMember,
    EmergencyContact,
    GalleryImage,
    IntegrationSetting,
    OfficeContact,
    SystemPreference,
)


def _active(model):
    return model.deleted_at.is_(None)


class DocumentsRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_documents(
        self,
        apartment_id: str,
        entity_type: str | None = None,
        entity_id: str | None = None,
        category: str | None = None,
    ) -> list[Document]:
        stmt = select(Document).where(Document.apartment_id == apartment_id, _active(Document))
        if entity_type:
            stmt = stmt.where(Document.entity_type == entity_type)
        if entity_id:
            stmt = stmt.where(Document.entity_id == entity_id)
        if category:
            stmt = stmt.where(Document.category == category)
        stmt = stmt.order_by(Document.uploaded_at.desc())
        return list(self.db.scalars(stmt).all())

    def get_document(self, apartment_id: str, document_id: str) -> Document | None:
        return self.db.scalar(
            select(Document).where(
                Document.id == document_id,
                Document.apartment_id == apartment_id,
                _active(Document),
            )
        )

    def create_document(self, doc: Document) -> Document:
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def list_flat_notes(self, apartment_id: str, flat_id: str) -> list[FlatInternalNote]:
        return list(
            self.db.scalars(
                select(FlatInternalNote)
                .where(
                    FlatInternalNote.apartment_id == apartment_id,
                    FlatInternalNote.flat_id == flat_id,
                )
                .order_by(FlatInternalNote.created_at.desc())
            ).all()
        )

    def create_flat_note(self, note: FlatInternalNote) -> FlatInternalNote:
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return note

    def list_audit_logs(
        self, apartment_id: str, entity_type: str | None = None, limit: int = 100
    ) -> list[AuditLog]:
        stmt = select(AuditLog).where(AuditLog.apartment_id == apartment_id)
        if entity_type:
            stmt = stmt.where(AuditLog.entity_type == entity_type)
        stmt = stmt.order_by(AuditLog.created_at.desc()).limit(limit)
        return list(self.db.scalars(stmt).all())

    def add_audit_log(self, log: AuditLog) -> AuditLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log
