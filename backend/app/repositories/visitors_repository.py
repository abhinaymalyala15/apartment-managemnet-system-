from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.visitors import VisitorRecord


def _active(model):
    return model.deleted_at.is_(None)


class VisitorsRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_visitors(
        self,
        apartment_id: str,
        flat_id: str | None = None,
        status: str | None = None,
        expected_date: date | None = None,
    ) -> list[VisitorRecord]:
        stmt = (
            select(VisitorRecord)
            .options(joinedload(VisitorRecord.flat))
            .where(VisitorRecord.apartment_id == apartment_id, _active(VisitorRecord))
        )
        if flat_id:
            stmt = stmt.where(VisitorRecord.flat_id == flat_id)
        if status:
            stmt = stmt.where(VisitorRecord.status == status)
        if expected_date:
            stmt = stmt.where(VisitorRecord.expected_date == expected_date)
        stmt = stmt.order_by(VisitorRecord.expected_date.desc(), VisitorRecord.expected_time)
        return list(self.db.scalars(stmt).unique().all())

    def get_visitor(self, apartment_id: str, visitor_id: str) -> VisitorRecord | None:
        return self.db.scalar(
            select(VisitorRecord)
            .options(joinedload(VisitorRecord.flat))
            .where(
                VisitorRecord.id == visitor_id,
                VisitorRecord.apartment_id == apartment_id,
                _active(VisitorRecord),
            )
        )

    def create_visitor(self, visitor: VisitorRecord) -> VisitorRecord:
        self.db.add(visitor)
        self.db.commit()
        self.db.refresh(visitor)
        return visitor

    def update_visitor(self, visitor: VisitorRecord) -> VisitorRecord:
        self.db.commit()
        self.db.refresh(visitor)
        return visitor

    def count_by_status(self, apartment_id: str, status: str) -> int:
        return self.db.scalar(
            select(func.count())
            .select_from(VisitorRecord)
            .where(
                VisitorRecord.apartment_id == apartment_id,
                VisitorRecord.status == status,
                _active(VisitorRecord),
            )
        ) or 0

    def count_for_date(self, apartment_id: str, expected_date: date, status: str | None = None) -> int:
        stmt = select(func.count()).select_from(VisitorRecord).where(
            VisitorRecord.apartment_id == apartment_id,
            VisitorRecord.expected_date == expected_date,
            _active(VisitorRecord),
        )
        if status:
            stmt = stmt.where(VisitorRecord.status == status)
        return self.db.scalar(stmt) or 0
