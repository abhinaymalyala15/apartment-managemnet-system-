from datetime import date, datetime, timezone

from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import new_uuid
from app.models.communication import Notification, TimelineEvent
from app.models.visitors import VisitorRecord
from app.repositories.communication_repository import CommunicationRepository
from app.repositories.structure_repository import StructureRepository
from app.repositories.visitors_repository import VisitorsRepository
from app.schemas.visitors import VisitorCreate, VisitorRead, VisitorsSummary, VisitorUpdate


class VisitorsService:
    VALID_STATUS = {"pending", "approved", "rejected", "checked_in", "checked_out"}
    TRANSITIONS = {
        "pending": {"approved", "rejected"},
        "approved": {"checked_in", "rejected"},
        "checked_in": {"checked_out"},
        "rejected": set(),
        "checked_out": set(),
    }

    def __init__(
        self,
        repo: VisitorsRepository,
        structure_repo: StructureRepository,
        comm_repo: CommunicationRepository | None = None,
    ):
        self.repo = repo
        self.structure_repo = structure_repo
        self.comm_repo = comm_repo

    def _get_apartment(self, apartment_id: str):
        apt = self.structure_repo.get_apartment(apartment_id)
        if not apt:
            raise NotFoundError("Apartment not found")
        return apt

    def _get_flat(self, apartment_id: str, flat_id: str):
        flat = self.structure_repo.get_flat(apartment_id, flat_id)
        if not flat:
            raise NotFoundError("Flat not found")
        return flat

    @staticmethod
    def _to_read(visitor: VisitorRecord) -> VisitorRead:
        data = VisitorRead.model_validate(visitor)
        if visitor.flat:
            data.flat_number = visitor.flat.flat_number
        return data

    def _transition(self, visitor: VisitorRecord, new_status: str, approved_by: str | None = None) -> None:
        if new_status not in self.VALID_STATUS:
            raise ConflictError(f"Invalid status: {new_status}")
        allowed = self.TRANSITIONS.get(visitor.status, set())
        if new_status not in allowed and new_status != visitor.status:
            raise ConflictError(f"Cannot transition from {visitor.status} to {new_status}")
        visitor.status = new_status
        if new_status == "approved" and approved_by:
            visitor.approved_by = approved_by

    def get_summary(self, apartment_id: str) -> VisitorsSummary:
        self._get_apartment(apartment_id)
        today = date.today()
        return VisitorsSummary(
            pending_count=self.repo.count_by_status(apartment_id, "pending"),
            approved_today_count=self.repo.count_for_date(apartment_id, today, "approved"),
            checked_in_count=self.repo.count_by_status(apartment_id, "checked_in"),
            total_today_count=self.repo.count_for_date(apartment_id, today),
        )

    def list_visitors(
        self,
        apartment_id: str,
        flat_id: str | None = None,
        status: str | None = None,
        expected_date: date | None = None,
    ) -> list[VisitorRead]:
        self._get_apartment(apartment_id)
        if flat_id:
            self._get_flat(apartment_id, flat_id)
        return [self._to_read(v) for v in self.repo.list_visitors(apartment_id, flat_id, status, expected_date)]

    def list_today(self, apartment_id: str, flat_id: str | None = None) -> list[VisitorRead]:
        return self.list_visitors(apartment_id, flat_id, expected_date=date.today())

    def get_visitor(self, apartment_id: str, visitor_id: str) -> VisitorRead:
        visitor = self.repo.get_visitor(apartment_id, visitor_id)
        if not visitor:
            raise NotFoundError("Visitor record not found")
        return self._to_read(visitor)

    def create_visitor(self, apartment_id: str, flat_id: str, data: VisitorCreate) -> VisitorRead:
        self._get_flat(apartment_id, flat_id)
        visitor = VisitorRecord(
            id=new_uuid(),
            apartment_id=apartment_id,
            flat_id=flat_id,
            status="pending",
            **data.model_dump(),
        )
        visitor = self.repo.create_visitor(visitor)
        return self.get_visitor(apartment_id, visitor.id)

    def update_visitor(self, apartment_id: str, visitor_id: str, data: VisitorUpdate) -> VisitorRead:
        visitor = self.repo.get_visitor(apartment_id, visitor_id)
        if not visitor:
            raise NotFoundError("Visitor record not found")
        if visitor.status not in {"pending", "approved"}:
            raise ConflictError("Only pending or approved visitors can be edited")

        updates = data.model_dump(exclude_unset=True)
        if "status" in updates:
            self._transition(visitor, updates.pop("status"))
        for key, value in updates.items():
            setattr(visitor, key, value)
        return self._to_read(self.repo.update_visitor(visitor))

    def approve_visitor(self, apartment_id: str, visitor_id: str, approved_by: str | None = None) -> VisitorRead:
        visitor = self.repo.get_visitor(apartment_id, visitor_id)
        if not visitor:
            raise NotFoundError("Visitor record not found")
        self._transition(visitor, "approved", approved_by)
        self.repo.update_visitor(visitor)
        visitor = self.repo.get_visitor(apartment_id, visitor_id)
        if not visitor:
            raise NotFoundError("Visitor record not found")
        self._notify_resident(visitor, "approved")
        self._add_timeline(visitor)
        if self.comm_repo:
            self.comm_repo.commit()
        return self._to_read(visitor)

    def reject_visitor(self, apartment_id: str, visitor_id: str) -> VisitorRead:
        visitor = self.repo.get_visitor(apartment_id, visitor_id)
        if not visitor:
            raise NotFoundError("Visitor record not found")
        self._transition(visitor, "rejected")
        return self._to_read(self.repo.update_visitor(visitor))

    def check_in(self, apartment_id: str, visitor_id: str) -> VisitorRead:
        visitor = self.repo.get_visitor(apartment_id, visitor_id)
        if not visitor:
            raise NotFoundError("Visitor record not found")
        self._transition(visitor, "checked_in")
        return self._to_read(self.repo.update_visitor(visitor))

    def check_out(self, apartment_id: str, visitor_id: str) -> VisitorRead:
        visitor = self.repo.get_visitor(apartment_id, visitor_id)
        if not visitor:
            raise NotFoundError("Visitor record not found")
        self._transition(visitor, "checked_out")
        return self._to_read(self.repo.update_visitor(visitor))

    def _notify_resident(self, visitor: VisitorRecord, action: str) -> None:
        if not self.comm_repo or action != "approved":
            return
        flat_number = visitor.flat.flat_number if visitor.flat else "—"
        for user, _membership in self.comm_repo.list_membership_users(visitor.apartment_id):
            flat_id = self.comm_repo.user_flat_id(visitor.apartment_id, user.id)
            if flat_id != visitor.flat_id:
                continue
            self.comm_repo.add_notification(
                Notification(
                    id=new_uuid(),
                    apartment_id=visitor.apartment_id,
                    user_id=user.id,
                    flat_id=visitor.flat_id,
                    source_type="visitor",
                    source_id=visitor.id,
                    title=f"Visitor approved — {visitor.guest_name}",
                    body=f"Your guest for Flat {flat_number} on {visitor.expected_date} has been approved.",
                    priority="medium",
                    delivered_at=datetime.now(timezone.utc),
                )
            )

    def _add_timeline(self, visitor: VisitorRecord) -> None:
        if not self.comm_repo:
            return
        flat_number = visitor.flat.flat_number if visitor.flat else ""
        self.comm_repo.add_timeline(
            TimelineEvent(
                id=new_uuid(),
                apartment_id=visitor.apartment_id,
                entity_type="visitor",
                entity_id=visitor.id,
                flat_id=visitor.flat_id,
                event_type="visitor_expected",
                title=f"Visitor expected — {visitor.guest_name}",
                description=visitor.purpose,
                event_date=datetime.now(timezone.utc),
                source_table="visitor_records",
                source_id=visitor.id,
                href="/resident/visits",
            )
        )
