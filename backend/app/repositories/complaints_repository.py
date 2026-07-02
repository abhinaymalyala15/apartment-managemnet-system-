from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.complaints import ResidentRequest


def _active(model):
    return model.deleted_at.is_(None)


class ComplaintsRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_complaints(
        self,
        apartment_id: str,
        flat_id: str | None = None,
        status: str | None = None,
        priority: str | None = None,
    ) -> list[ResidentRequest]:
        stmt = (
            select(ResidentRequest)
            .options(joinedload(ResidentRequest.flat))
            .where(ResidentRequest.apartment_id == apartment_id, _active(ResidentRequest))
        )
        if flat_id:
            stmt = stmt.where(ResidentRequest.flat_id == flat_id)
        if status:
            stmt = stmt.where(ResidentRequest.status == status)
        if priority:
            stmt = stmt.where(ResidentRequest.priority == priority)
        stmt = stmt.order_by(ResidentRequest.created_at.desc())
        return list(self.db.scalars(stmt).unique().all())

    def get_complaint(self, apartment_id: str, complaint_id: str) -> ResidentRequest | None:
        return self.db.scalar(
            select(ResidentRequest)
            .options(joinedload(ResidentRequest.flat))
            .where(
                ResidentRequest.id == complaint_id,
                ResidentRequest.apartment_id == apartment_id,
                _active(ResidentRequest),
            )
        )

    def create_complaint(self, complaint: ResidentRequest) -> ResidentRequest:
        self.db.add(complaint)
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def update_complaint(self, complaint: ResidentRequest) -> ResidentRequest:
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def count_by_status(self, apartment_id: str, status: str) -> int:
        return self.db.scalar(
            select(func.count())
            .select_from(ResidentRequest)
            .where(
                ResidentRequest.apartment_id == apartment_id,
                ResidentRequest.status == status,
                _active(ResidentRequest),
            )
        ) or 0

    def count_high_priority_open(self, apartment_id: str) -> int:
        return self.db.scalar(
            select(func.count())
            .select_from(ResidentRequest)
            .where(
                ResidentRequest.apartment_id == apartment_id,
                ResidentRequest.status.in_(("open", "in_progress")),
                ResidentRequest.priority == "high",
                _active(ResidentRequest),
            )
        ) or 0
