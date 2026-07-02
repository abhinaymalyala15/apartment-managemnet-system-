from datetime import datetime, timezone

from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import new_uuid
from app.models.complaints import ResidentRequest
from app.models.communication import Notification, TimelineEvent
from app.repositories.communication_repository import CommunicationRepository
from app.repositories.complaints_repository import ComplaintsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.complaints import (
    ComplaintAssignRequest,
    ComplaintCreate,
    ComplaintRead,
    ComplaintsSummary,
    ComplaintUpdate,
)


class ComplaintsService:
    VALID_STATUS = {"open", "in_progress", "resolved"}
    VALID_PRIORITY = {"low", "medium", "high"}
    TRANSITIONS = {
        "open": {"in_progress", "resolved"},
        "in_progress": {"resolved", "open"},
        "resolved": set(),
    }

    def __init__(
        self,
        repo: ComplaintsRepository,
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
    def _to_read(complaint: ResidentRequest) -> ComplaintRead:
        data = ComplaintRead.model_validate(complaint)
        if complaint.flat:
            data.flat_number = complaint.flat.flat_number
        return data

    def _transition(self, complaint: ResidentRequest, new_status: str) -> None:
        if new_status not in self.VALID_STATUS:
            raise ConflictError(f"Invalid status: {new_status}")
        allowed = self.TRANSITIONS.get(complaint.status, set())
        if new_status not in allowed and new_status != complaint.status:
            raise ConflictError(f"Cannot transition from {complaint.status} to {new_status}")
        complaint.status = new_status
        if new_status == "resolved":
            complaint.resolved_at = datetime.now(timezone.utc)
        elif new_status != "resolved" and complaint.resolved_at:
            complaint.resolved_at = None

    def get_summary(self, apartment_id: str) -> ComplaintsSummary:
        self._get_apartment(apartment_id)
        return ComplaintsSummary(
            open_count=self.repo.count_by_status(apartment_id, "open"),
            in_progress_count=self.repo.count_by_status(apartment_id, "in_progress"),
            resolved_count=self.repo.count_by_status(apartment_id, "resolved"),
            high_priority_open_count=self.repo.count_high_priority_open(apartment_id),
        )

    def list_complaints(
        self,
        apartment_id: str,
        flat_id: str | None = None,
        status: str | None = None,
        priority: str | None = None,
    ) -> list[ComplaintRead]:
        self._get_apartment(apartment_id)
        if flat_id:
            self._get_flat(apartment_id, flat_id)
        return [self._to_read(c) for c in self.repo.list_complaints(apartment_id, flat_id, status, priority)]

    def get_complaint(self, apartment_id: str, complaint_id: str) -> ComplaintRead:
        complaint = self.repo.get_complaint(apartment_id, complaint_id)
        if not complaint:
            raise NotFoundError("Complaint not found")
        return self._to_read(complaint)

    def create_complaint(self, apartment_id: str, flat_id: str, data: ComplaintCreate) -> ComplaintRead:
        self._get_flat(apartment_id, flat_id)
        if data.priority not in self.VALID_PRIORITY:
            raise ConflictError(f"Invalid priority: {data.priority}")

        complaint = ResidentRequest(
            id=new_uuid(),
            apartment_id=apartment_id,
            flat_id=flat_id,
            status="open",
            **data.model_dump(),
        )
        self.repo.create_complaint(complaint)
        complaint = self.repo.get_complaint(apartment_id, complaint.id)
        if not complaint:
            raise NotFoundError("Complaint not found")
        self._add_timeline(complaint, "complaint_filed")
        if self.comm_repo:
            self.comm_repo.commit()
        return self._to_read(complaint)

    def update_complaint(
        self, apartment_id: str, complaint_id: str, data: ComplaintUpdate
    ) -> ComplaintRead:
        complaint = self.repo.get_complaint(apartment_id, complaint_id)
        if not complaint:
            raise NotFoundError("Complaint not found")
        if complaint.status == "resolved":
            raise ConflictError("Resolved complaints cannot be edited")

        updates = data.model_dump(exclude_unset=True)
        if "priority" in updates and updates["priority"] not in self.VALID_PRIORITY:
            raise ConflictError(f"Invalid priority: {updates['priority']}")
        if "status" in updates:
            self._transition(complaint, updates.pop("status"))
        for key, value in updates.items():
            setattr(complaint, key, value)

        self.repo.update_complaint(complaint)
        complaint = self.repo.get_complaint(apartment_id, complaint_id)
        if complaint and complaint.status == "resolved":
            self._add_timeline(complaint, "complaint_resolved")
            self._notify_resident(complaint, "resolved")
            if self.comm_repo:
                self.comm_repo.commit()
        return self._to_read(complaint)

    def assign_complaint(
        self, apartment_id: str, complaint_id: str, data: ComplaintAssignRequest
    ) -> ComplaintRead:
        complaint = self.repo.get_complaint(apartment_id, complaint_id)
        if not complaint:
            raise NotFoundError("Complaint not found")
        if complaint.status == "resolved":
            raise ConflictError("Cannot assign a resolved complaint")

        complaint.assigned_to = data.assigned_to
        if complaint.status == "open":
            self._transition(complaint, "in_progress")
        self.repo.update_complaint(complaint)
        return self.get_complaint(apartment_id, complaint_id)

    def resolve_complaint(self, apartment_id: str, complaint_id: str) -> ComplaintRead:
        complaint = self.repo.get_complaint(apartment_id, complaint_id)
        if not complaint:
            raise NotFoundError("Complaint not found")
        self._transition(complaint, "resolved")
        self.repo.update_complaint(complaint)
        complaint = self.repo.get_complaint(apartment_id, complaint_id)
        if not complaint:
            raise NotFoundError("Complaint not found")
        self._add_timeline(complaint, "complaint_resolved")
        self._notify_resident(complaint, "resolved")
        if self.comm_repo:
            self.comm_repo.commit()
        return self._to_read(complaint)

    def _add_timeline(self, complaint: ResidentRequest, event_type: str) -> None:
        if not self.comm_repo:
            return
        title = (
            f"Complaint resolved — {complaint.title}"
            if event_type == "complaint_resolved"
            else f"Complaint filed — {complaint.title}"
        )
        self.comm_repo.add_timeline(
            TimelineEvent(
                id=new_uuid(),
                apartment_id=complaint.apartment_id,
                entity_type="complaint",
                entity_id=complaint.id,
                flat_id=complaint.flat_id,
                event_type=event_type,
                title=title,
                description=complaint.description,
                event_date=datetime.now(timezone.utc),
                source_table="resident_requests",
                source_id=complaint.id,
                href="/resident/services",
            )
        )

    def _notify_resident(self, complaint: ResidentRequest, action: str) -> None:
        if not self.comm_repo or action != "resolved":
            return
        for user, _membership in self.comm_repo.list_membership_users(complaint.apartment_id):
            flat_id = self.comm_repo.user_flat_id(complaint.apartment_id, user.id)
            if flat_id != complaint.flat_id:
                continue
            self.comm_repo.add_notification(
                Notification(
                    id=new_uuid(),
                    apartment_id=complaint.apartment_id,
                    user_id=user.id,
                    flat_id=complaint.flat_id,
                    source_type="complaint",
                    source_id=complaint.id,
                    title=f"Complaint resolved — {complaint.title}",
                    body=complaint.description[:500] if complaint.description else None,
                    priority="medium",
                    delivered_at=datetime.now(timezone.utc),
                )
            )
