from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.assets import (
    AssetAmcRecord,
    AssetInternalNote,
    AssetServiceRecord,
    AssetVendorLink,
    CommunityAsset,
    FacilityVendor,
    ServiceSchedule,
)


def _active(model):
    return model.deleted_at.is_(None)


class AssetsRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- Vendors ---

    def list_vendors(self, apartment_id: str) -> list[FacilityVendor]:
        return list(
            self.db.scalars(
                select(FacilityVendor)
                .where(FacilityVendor.apartment_id == apartment_id, _active(FacilityVendor))
                .order_by(FacilityVendor.name)
            ).all()
        )

    def get_vendor(self, apartment_id: str, vendor_id: str) -> FacilityVendor | None:
        return self.db.scalar(
            select(FacilityVendor).where(
                FacilityVendor.id == vendor_id,
                FacilityVendor.apartment_id == apartment_id,
                _active(FacilityVendor),
            )
        )

    def create_vendor(self, vendor: FacilityVendor) -> FacilityVendor:
        self.db.add(vendor)
        self.db.commit()
        self.db.refresh(vendor)
        return vendor

    def update_vendor(self, vendor: FacilityVendor) -> FacilityVendor:
        self.db.commit()
        self.db.refresh(vendor)
        return vendor

    # --- Assets ---

    def list_assets(
        self,
        apartment_id: str,
        asset_type: str | None = None,
        status: str | None = None,
        scope: str | None = None,
    ) -> list[CommunityAsset]:
        stmt = (
            select(CommunityAsset)
            .options(joinedload(CommunityAsset.primary_vendor))
            .where(CommunityAsset.apartment_id == apartment_id, _active(CommunityAsset))
        )
        if asset_type:
            stmt = stmt.where(CommunityAsset.asset_type == asset_type)
        if status:
            stmt = stmt.where(CommunityAsset.status == status)
        if scope:
            stmt = stmt.where(CommunityAsset.scope == scope)
        stmt = stmt.order_by(CommunityAsset.name)
        return list(self.db.scalars(stmt).unique().all())

    def get_asset(self, apartment_id: str, asset_id: str) -> CommunityAsset | None:
        return self.db.scalar(
            select(CommunityAsset)
            .options(joinedload(CommunityAsset.primary_vendor))
            .where(
                CommunityAsset.id == asset_id,
                CommunityAsset.apartment_id == apartment_id,
                _active(CommunityAsset),
            )
        )

    def create_asset(self, asset: CommunityAsset) -> CommunityAsset:
        self.db.add(asset)
        self.db.commit()
        self.db.refresh(asset)
        return asset

    def update_asset(self, asset: CommunityAsset) -> CommunityAsset:
        self.db.commit()
        self.db.refresh(asset)
        return asset

    def add_vendor_link(self, link: AssetVendorLink) -> None:
        self.db.add(link)

    # --- AMC ---

    def list_amc_for_asset(self, apartment_id: str, asset_id: str) -> list[AssetAmcRecord]:
        return list(
            self.db.scalars(
                select(AssetAmcRecord)
                .options(joinedload(AssetAmcRecord.vendor))
                .where(
                    AssetAmcRecord.apartment_id == apartment_id,
                    AssetAmcRecord.asset_id == asset_id,
                    _active(AssetAmcRecord),
                )
                .order_by(AssetAmcRecord.start_date.desc())
            ).unique().all()
        )

    def get_current_amc(self, apartment_id: str, asset_id: str) -> AssetAmcRecord | None:
        return self.db.scalar(
            select(AssetAmcRecord).where(
                AssetAmcRecord.apartment_id == apartment_id,
                AssetAmcRecord.asset_id == asset_id,
                AssetAmcRecord.is_current.is_(True),
                _active(AssetAmcRecord),
            )
        )

    def create_amc(self, amc: AssetAmcRecord) -> AssetAmcRecord:
        self.db.add(amc)
        self.db.commit()
        self.db.refresh(amc)
        return amc

    def deactivate_current_amc(self, apartment_id: str, asset_id: str) -> None:
        current = self.get_current_amc(apartment_id, asset_id)
        if current:
            current.is_current = False

    # --- Asset services ---

    def list_asset_services(
        self,
        apartment_id: str,
        asset_id: str | None = None,
        status: str | None = None,
    ) -> list[AssetServiceRecord]:
        stmt = (
            select(AssetServiceRecord)
            .options(joinedload(AssetServiceRecord.vendor))
            .where(AssetServiceRecord.apartment_id == apartment_id, _active(AssetServiceRecord))
        )
        if asset_id:
            stmt = stmt.where(AssetServiceRecord.asset_id == asset_id)
        if status:
            stmt = stmt.where(AssetServiceRecord.status == status)
        stmt = stmt.order_by(AssetServiceRecord.scheduled_date.desc())
        return list(self.db.scalars(stmt).unique().all())

    def get_asset_service(self, apartment_id: str, service_id: str) -> AssetServiceRecord | None:
        return self.db.scalar(
            select(AssetServiceRecord)
            .options(joinedload(AssetServiceRecord.vendor))
            .where(
                AssetServiceRecord.id == service_id,
                AssetServiceRecord.apartment_id == apartment_id,
                _active(AssetServiceRecord),
            )
        )

    def create_asset_service(self, record: AssetServiceRecord) -> AssetServiceRecord:
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def update_asset_service(self, record: AssetServiceRecord) -> AssetServiceRecord:
        self.db.commit()
        self.db.refresh(record)
        return record

    # --- Service schedules ---

    def list_service_schedules(
        self,
        apartment_id: str,
        flat_id: str | None = None,
        status: str | None = None,
    ) -> list[ServiceSchedule]:
        stmt = select(ServiceSchedule).where(
            ServiceSchedule.apartment_id == apartment_id,
            _active(ServiceSchedule),
        )
        if flat_id:
            stmt = stmt.where(ServiceSchedule.flat_id == flat_id)
        if status:
            stmt = stmt.where(ServiceSchedule.status == status)
        stmt = stmt.order_by(ServiceSchedule.scheduled_date)
        return list(self.db.scalars(stmt).all())

    def get_service_schedule(self, apartment_id: str, schedule_id: str) -> ServiceSchedule | None:
        return self.db.scalar(
            select(ServiceSchedule).where(
                ServiceSchedule.id == schedule_id,
                ServiceSchedule.apartment_id == apartment_id,
                _active(ServiceSchedule),
            )
        )

    def create_service_schedule(self, schedule: ServiceSchedule) -> ServiceSchedule:
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        return schedule

    def update_service_schedule(self, schedule: ServiceSchedule) -> ServiceSchedule:
        self.db.commit()
        self.db.refresh(schedule)
        return schedule

    # --- Notes ---

    def list_asset_notes(self, apartment_id: str, asset_id: str) -> list[AssetInternalNote]:
        return list(
            self.db.scalars(
                select(AssetInternalNote)
                .where(
                    AssetInternalNote.apartment_id == apartment_id,
                    AssetInternalNote.asset_id == asset_id,
                )
                .order_by(AssetInternalNote.created_at.desc())
            ).all()
        )

    def create_asset_note(self, note: AssetInternalNote) -> AssetInternalNote:
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return note

    # --- Summary ---

    def count_assets_by_status(self, apartment_id: str) -> dict[str, int]:
        rows = self.db.execute(
            select(CommunityAsset.status, func.count())
            .where(CommunityAsset.apartment_id == apartment_id, _active(CommunityAsset))
            .group_by(CommunityAsset.status)
        ).all()
        return {status: count for status, count in rows}

    def count_vendors(self, apartment_id: str) -> int:
        return self.db.scalar(
            select(func.count())
            .select_from(FacilityVendor)
            .where(FacilityVendor.apartment_id == apartment_id, _active(FacilityVendor))
        ) or 0

    def count_upcoming_services(self, apartment_id: str, within_days: int = 14) -> int:
        today = date.today()
        end = today + timedelta(days=within_days)
        asset_svc = self.db.scalar(
            select(func.count())
            .select_from(AssetServiceRecord)
            .where(
                AssetServiceRecord.apartment_id == apartment_id,
                AssetServiceRecord.status == "scheduled",
                AssetServiceRecord.scheduled_date >= today,
                AssetServiceRecord.scheduled_date <= end,
                _active(AssetServiceRecord),
            )
        ) or 0
        schedules = self.db.scalar(
            select(func.count())
            .select_from(ServiceSchedule)
            .where(
                ServiceSchedule.apartment_id == apartment_id,
                ServiceSchedule.status == "scheduled",
                ServiceSchedule.scheduled_date >= today,
                ServiceSchedule.scheduled_date <= end,
                _active(ServiceSchedule),
            )
        ) or 0
        return asset_svc + schedules

    def refresh_asset_service_dates(self, asset: CommunityAsset) -> None:
        latest_completed = self.db.scalar(
            select(func.max(AssetServiceRecord.completed_date)).where(
                AssetServiceRecord.asset_id == asset.id,
                AssetServiceRecord.status == "completed",
                _active(AssetServiceRecord),
            )
        )
        next_scheduled = self.db.scalar(
            select(func.min(AssetServiceRecord.scheduled_date)).where(
                AssetServiceRecord.asset_id == asset.id,
                AssetServiceRecord.status == "scheduled",
                _active(AssetServiceRecord),
            )
        )
        asset.last_service_date = latest_completed
        asset.next_service_date = next_scheduled

    def refresh_asset_amc_expiry(self, asset: CommunityAsset) -> None:
        current = self.get_current_amc(asset.apartment_id, asset.id)
        asset.amc_expiry_date = current.end_date if current else None

    def commit(self) -> None:
        self.db.commit()
