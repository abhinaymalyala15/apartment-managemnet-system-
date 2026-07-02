from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.complaints import ResidentRequest
from app.models.communication import Notice
from app.models.finance import FollowUpRecord, MaintenanceBill
from app.models.people import OwnerProfile, Person, TenantProfile
from app.models.structure import Flat
from app.models.visitors import VisitorRecord
from app.repositories.assets_repository import AssetsRepository
from app.repositories.communication_repository import CommunicationRepository
from app.repositories.structure_repository import StructureRepository


def _active(model):
    return model.deleted_at.is_(None)


class ReportsRepository:
    def __init__(self, db: Session):
        self.db = db

    def finance_stats(self, apartment_id: str) -> dict:
        outstanding = self.db.scalar(
            select(func.coalesce(func.sum(MaintenanceBill.amount - MaintenanceBill.paid_amount), 0)).where(
                MaintenanceBill.apartment_id == apartment_id,
                MaintenanceBill.status.in_(("pending", "overdue")),
                _active(MaintenanceBill),
            )
        ) or 0
        overdue = self.db.scalar(
            select(func.count()).select_from(MaintenanceBill).where(
                MaintenanceBill.apartment_id == apartment_id,
                MaintenanceBill.status == "overdue",
                _active(MaintenanceBill),
            )
        ) or 0
        pending = self.db.scalar(
            select(func.count()).select_from(MaintenanceBill).where(
                MaintenanceBill.apartment_id == apartment_id,
                MaintenanceBill.status == "pending",
                _active(MaintenanceBill),
            )
        ) or 0
        follow_ups = self.db.scalar(
            select(func.count()).select_from(FollowUpRecord).where(
                FollowUpRecord.apartment_id == apartment_id,
                FollowUpRecord.status != "resolved",
                _active(FollowUpRecord),
            )
        ) or 0
        return {
            "total_outstanding": float(outstanding),
            "overdue_bills": overdue,
            "pending_bills": pending,
            "collected_this_month": 0.0,
            "open_follow_ups": follow_ups,
        }

    def occupancy_stats(self, apartment_id: str) -> dict:
        flats = list(
            self.db.scalars(
                select(Flat).where(Flat.apartment_id == apartment_id, _active(Flat))
            ).all()
        )
        total = len(flats)
        occupied = sum(1 for f in flats if f.occupancy_status != "vacant")
        owner_occ = sum(1 for f in flats if f.occupancy_status == "owner_occupied")
        tenant_occ = sum(1 for f in flats if f.occupancy_status == "tenant_occupied")
        rate = (occupied / total * 100) if total else 0.0
        return {
            "total_flats": total,
            "occupied": occupied,
            "vacant": total - occupied,
            "owner_occupied": owner_occ,
            "tenant_occupied": tenant_occ,
            "occupancy_rate": round(rate, 1),
        }

    def resident_count(self, apartment_id: str) -> int:
        return self.db.scalar(
            select(func.count()).select_from(Person).where(
                Person.apartment_id == apartment_id,
                _active(Person),
            )
        ) or 0

    def published_notices(self, apartment_id: str) -> int:
        return self.db.scalar(
            select(func.count()).select_from(Notice).where(
                Notice.apartment_id == apartment_id,
                Notice.lifecycle_status == "published",
                _active(Notice),
            )
        ) or 0

    def operations_stats(self, apartment_id: str) -> dict:
        comm = CommunicationRepository(self.db)
        assets = AssetsRepository(self.db)
        pending_visitors = self.db.scalar(
            select(func.count()).select_from(VisitorRecord).where(
                VisitorRecord.apartment_id == apartment_id,
                VisitorRecord.status == "pending",
                _active(VisitorRecord),
            )
        ) or 0
        open_complaints = self.db.scalar(
            select(func.count()).select_from(ResidentRequest).where(
                ResidentRequest.apartment_id == apartment_id,
                ResidentRequest.status.in_(("open", "in_progress")),
                _active(ResidentRequest),
            )
        ) or 0
        by_status = assets.count_assets_by_status(apartment_id)
        return {
            "pending_visitors": pending_visitors,
            "open_complaints": open_complaints,
            "emergency_notices": comm.count_emergency_published(apartment_id),
            "assets_amc_overdue": by_status.get("amc_overdue", 0),
            "upcoming_services": assets.count_upcoming_services(apartment_id),
        }
