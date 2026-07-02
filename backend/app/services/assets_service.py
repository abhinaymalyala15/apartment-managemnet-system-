from datetime import date

from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import new_uuid
from app.models.assets import (
    AssetAmcRecord,
    AssetInternalNote,
    AssetServiceRecord,
    AssetVendorLink,
    CommunityAsset,
    FacilityVendor,
    ServiceSchedule,
)
from app.repositories.assets_repository import AssetsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.assets import (
    AmcCreate,
    AmcRead,
    AmcRenewRequest,
    AssetCreate,
    AssetDetailRead,
    AssetNoteCreate,
    AssetNoteRead,
    AssetRead,
    AssetServiceCreate,
    AssetServiceRead,
    AssetServiceUpdate,
    AssetUpdate,
    AssetsSummary,
    ServiceScheduleCreate,
    ServiceScheduleRead,
    ServiceScheduleUpdate,
    VendorCreate,
    VendorRead,
    VendorUpdate,
)


class AssetsService:
    VALID_ASSET_TYPES = {
        "lift", "water_tank", "generator", "fire_safety", "cctv", "garden", "solar",
        "stp", "wtp", "swimming_pool", "club_house", "gym", "play_area", "ev_charging",
        "dg_backup", "street_lighting", "other",
    }
    VALID_SCOPES = {"community", "block", "flat"}
    VALID_ASSET_STATUS = {"active", "amc_overdue", "service_due_soon", "under_maintenance", "inactive"}
    VALID_SERVICE_STATUS = {"scheduled", "in_progress", "completed", "cancelled"}
    VALID_SCHEDULE_STATUS = {"scheduled", "completed", "cancelled"}

    def __init__(self, repo: AssetsRepository, structure_repo: StructureRepository):
        self.repo = repo
        self.structure_repo = structure_repo

    def _get_apartment(self, apartment_id: str):
        apt = self.structure_repo.get_apartment(apartment_id)
        if not apt:
            raise NotFoundError("Apartment not found")
        return apt

    @staticmethod
    def _vendor_name(vendor: FacilityVendor | None) -> str | None:
        return vendor.name if vendor else None

    def _to_asset_read(self, asset: CommunityAsset) -> AssetRead:
        data = AssetRead.model_validate(asset)
        data.primary_vendor_name = self._vendor_name(asset.primary_vendor)
        return data

    def _to_amc_read(self, amc: AssetAmcRecord) -> AmcRead:
        data = AmcRead.model_validate(amc)
        data.vendor_name = self._vendor_name(amc.vendor)
        return data

    def _to_service_read(self, record: AssetServiceRecord) -> AssetServiceRead:
        data = AssetServiceRead.model_validate(record)
        data.vendor_name = self._vendor_name(record.vendor)
        return data

    def get_summary(self, apartment_id: str) -> AssetsSummary:
        self._get_apartment(apartment_id)
        by_status = self.repo.count_assets_by_status(apartment_id)
        total = sum(by_status.values())
        return AssetsSummary(
            total_assets=total,
            active_count=by_status.get("active", 0),
            amc_overdue_count=by_status.get("amc_overdue", 0),
            service_due_soon_count=by_status.get("service_due_soon", 0),
            under_maintenance_count=by_status.get("under_maintenance", 0),
            upcoming_services=self.repo.count_upcoming_services(apartment_id),
            vendor_count=self.repo.count_vendors(apartment_id),
        )

    # --- Vendors ---

    def list_vendors(self, apartment_id: str) -> list[VendorRead]:
        self._get_apartment(apartment_id)
        return [VendorRead.model_validate(v) for v in self.repo.list_vendors(apartment_id)]

    def create_vendor(self, apartment_id: str, data: VendorCreate) -> VendorRead:
        self._get_apartment(apartment_id)
        vendor = FacilityVendor(id=new_uuid(), apartment_id=apartment_id, **data.model_dump())
        return VendorRead.model_validate(self.repo.create_vendor(vendor))

    def update_vendor(self, apartment_id: str, vendor_id: str, data: VendorUpdate) -> VendorRead:
        vendor = self.repo.get_vendor(apartment_id, vendor_id)
        if not vendor:
            raise NotFoundError("Vendor not found")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(vendor, key, value)
        return VendorRead.model_validate(self.repo.update_vendor(vendor))

    # --- Assets ---

    def _validate_asset_scope(self, apartment_id: str, scope: str, block_id: str | None, flat_id: str | None):
        if scope not in self.VALID_SCOPES:
            raise ConflictError(f"Invalid scope: {scope}")
        if scope == "block" and not block_id:
            raise ConflictError("block_id required for block-scoped assets")
        if scope == "flat" and not flat_id:
            raise ConflictError("flat_id required for flat-scoped assets")
        if block_id and not self.structure_repo.get_block(apartment_id, block_id):
            raise NotFoundError("Block not found")
        if flat_id and not self.structure_repo.get_flat(apartment_id, flat_id):
            raise NotFoundError("Flat not found")

    def list_assets(
        self, apartment_id: str, asset_type: str | None = None, status: str | None = None, scope: str | None = None
    ) -> list[AssetRead]:
        self._get_apartment(apartment_id)
        return [self._to_asset_read(a) for a in self.repo.list_assets(apartment_id, asset_type, status, scope)]

    def get_asset(self, apartment_id: str, asset_id: str) -> AssetRead:
        asset = self.repo.get_asset(apartment_id, asset_id)
        if not asset:
            raise NotFoundError("Asset not found")
        return self._to_asset_read(asset)

    def get_asset_detail(self, apartment_id: str, asset_id: str) -> AssetDetailRead:
        asset = self.repo.get_asset(apartment_id, asset_id)
        if not asset:
            raise NotFoundError("Asset not found")
        return AssetDetailRead(
            asset=self._to_asset_read(asset),
            amc_records=[self._to_amc_read(a) for a in self.repo.list_amc_for_asset(apartment_id, asset_id)],
            service_records=[
                self._to_service_read(s) for s in self.repo.list_asset_services(apartment_id, asset_id)
            ],
            notes=[AssetNoteRead.model_validate(n) for n in self.repo.list_asset_notes(apartment_id, asset_id)],
        )

    def create_asset(self, apartment_id: str, data: AssetCreate) -> AssetRead:
        self._get_apartment(apartment_id)
        if data.asset_type not in self.VALID_ASSET_TYPES:
            raise ConflictError(f"Invalid asset_type: {data.asset_type}")
        if data.status not in self.VALID_ASSET_STATUS:
            raise ConflictError(f"Invalid status: {data.status}")
        self._validate_asset_scope(apartment_id, data.scope, data.block_id, data.flat_id)
        if data.primary_vendor_id and not self.repo.get_vendor(apartment_id, data.primary_vendor_id):
            raise NotFoundError("Vendor not found")

        asset = CommunityAsset(id=new_uuid(), apartment_id=apartment_id, **data.model_dump())
        asset = self.repo.create_asset(asset)
        if asset.primary_vendor_id:
            self.repo.add_vendor_link(
                AssetVendorLink(
                    id=new_uuid(),
                    asset_id=asset.id,
                    vendor_id=asset.primary_vendor_id,
                    link_type="service",
                )
            )
            self.repo.commit()
        return self._to_asset_read(self.repo.get_asset(apartment_id, asset.id))

    def update_asset(self, apartment_id: str, asset_id: str, data: AssetUpdate) -> AssetRead:
        asset = self.repo.get_asset(apartment_id, asset_id)
        if not asset:
            raise NotFoundError("Asset not found")
        updates = data.model_dump(exclude_unset=True)
        if "asset_type" in updates and updates["asset_type"] not in self.VALID_ASSET_TYPES:
            raise ConflictError(f"Invalid asset_type: {updates['asset_type']}")
        if "status" in updates and updates["status"] not in self.VALID_ASSET_STATUS:
            raise ConflictError(f"Invalid status: {updates['status']}")
        scope = updates.get("scope", asset.scope)
        block_id = updates.get("block_id", asset.block_id)
        flat_id = updates.get("flat_id", asset.flat_id)
        self._validate_asset_scope(apartment_id, scope, block_id, flat_id)
        if "primary_vendor_id" in updates and updates["primary_vendor_id"]:
            if not self.repo.get_vendor(apartment_id, updates["primary_vendor_id"]):
                raise NotFoundError("Vendor not found")
        for key, value in updates.items():
            setattr(asset, key, value)
        return self._to_asset_read(self.repo.update_asset(asset))

    # --- AMC ---

    def list_amc(self, apartment_id: str, asset_id: str) -> list[AmcRead]:
        if not self.repo.get_asset(apartment_id, asset_id):
            raise NotFoundError("Asset not found")
        return [self._to_amc_read(a) for a in self.repo.list_amc_for_asset(apartment_id, asset_id)]

    def create_amc(self, apartment_id: str, asset_id: str, data: AmcCreate) -> AmcRead:
        asset = self.repo.get_asset(apartment_id, asset_id)
        if not asset:
            raise NotFoundError("Asset not found")
        if not self.repo.get_vendor(apartment_id, data.vendor_id):
            raise NotFoundError("Vendor not found")
        if data.end_date < data.start_date:
            raise ConflictError("end_date must be on or after start_date")

        self.repo.deactivate_current_amc(apartment_id, asset_id)
        amc = AssetAmcRecord(
            id=new_uuid(),
            apartment_id=apartment_id,
            asset_id=asset_id,
            is_current=True,
            **data.model_dump(),
        )
        amc = self.repo.create_amc(amc)
        self.repo.refresh_asset_amc_expiry(asset)
        self.repo.update_asset(asset)
        return self._to_amc_read(amc)

    def renew_amc(self, apartment_id: str, asset_id: str, data: AmcRenewRequest) -> AmcRead:
        asset = self.repo.get_asset(apartment_id, asset_id)
        if not asset:
            raise NotFoundError("Asset not found")
        current = self.repo.get_current_amc(apartment_id, asset_id)
        vendor_id = data.vendor_id or (current.vendor_id if current else asset.primary_vendor_id)
        if not vendor_id or not self.repo.get_vendor(apartment_id, vendor_id):
            raise NotFoundError("Vendor not found")
        create_data = AmcCreate(
            vendor_id=vendor_id,
            start_date=data.start_date,
            end_date=data.end_date,
            renewal_reminder_days=data.renewal_reminder_days,
            contact_person=data.contact_person or (current.contact_person if current else None),
            phone=data.phone or (current.phone if current else None),
            email=data.email or (current.email if current else None),
        )
        return self.create_amc(apartment_id, asset_id, create_data)

    # --- Asset services ---

    def list_asset_services(
        self, apartment_id: str, asset_id: str | None = None, status: str | None = None
    ) -> list[AssetServiceRead]:
        self._get_apartment(apartment_id)
        if asset_id and not self.repo.get_asset(apartment_id, asset_id):
            raise NotFoundError("Asset not found")
        return [
            self._to_service_read(s) for s in self.repo.list_asset_services(apartment_id, asset_id, status)
        ]

    def create_asset_service(
        self, apartment_id: str, asset_id: str, data: AssetServiceCreate
    ) -> AssetServiceRead:
        asset = self.repo.get_asset(apartment_id, asset_id)
        if not asset:
            raise NotFoundError("Asset not found")
        if data.vendor_id and not self.repo.get_vendor(apartment_id, data.vendor_id):
            raise NotFoundError("Vendor not found")
        if data.flat_id and not self.structure_repo.get_flat(apartment_id, data.flat_id):
            raise NotFoundError("Flat not found")

        record = AssetServiceRecord(
            id=new_uuid(),
            apartment_id=apartment_id,
            asset_id=asset_id,
            status="scheduled",
            **data.model_dump(),
        )
        record = self.repo.create_asset_service(record)
        self.repo.refresh_asset_service_dates(asset)
        self.repo.update_asset(asset)
        return self._to_service_read(record)

    def update_asset_service(
        self, apartment_id: str, service_id: str, data: AssetServiceUpdate
    ) -> AssetServiceRead:
        record = self.repo.get_asset_service(apartment_id, service_id)
        if not record:
            raise NotFoundError("Service record not found")
        updates = data.model_dump(exclude_unset=True)
        if "status" in updates and updates["status"] not in self.VALID_SERVICE_STATUS:
            raise ConflictError(f"Invalid status: {updates['status']}")
        for key, value in updates.items():
            setattr(record, key, value)
        if record.status == "completed" and not record.completed_date:
            record.completed_date = date.today()
        record = self.repo.update_asset_service(record)
        if record.asset_id:
            asset = self.repo.get_asset(apartment_id, record.asset_id)
            if asset:
                self.repo.refresh_asset_service_dates(asset)
                self.repo.update_asset(asset)
        return self._to_service_read(record)

    # --- Service schedules ---

    def list_service_schedules(
        self, apartment_id: str, flat_id: str | None = None, status: str | None = None
    ) -> list[ServiceScheduleRead]:
        self._get_apartment(apartment_id)
        return [
            ServiceScheduleRead.model_validate(s)
            for s in self.repo.list_service_schedules(apartment_id, flat_id, status)
        ]

    def create_service_schedule(self, apartment_id: str, data: ServiceScheduleCreate) -> ServiceScheduleRead:
        self._get_apartment(apartment_id)
        if data.vendor_id and not self.repo.get_vendor(apartment_id, data.vendor_id):
            raise NotFoundError("Vendor not found")
        if data.flat_id and not self.structure_repo.get_flat(apartment_id, data.flat_id):
            raise NotFoundError("Flat not found")
        schedule = ServiceSchedule(
            id=new_uuid(),
            apartment_id=apartment_id,
            status="scheduled",
            **data.model_dump(),
        )
        return ServiceScheduleRead.model_validate(self.repo.create_service_schedule(schedule))

    def update_service_schedule(
        self, apartment_id: str, schedule_id: str, data: ServiceScheduleUpdate
    ) -> ServiceScheduleRead:
        schedule = self.repo.get_service_schedule(apartment_id, schedule_id)
        if not schedule:
            raise NotFoundError("Service schedule not found")
        updates = data.model_dump(exclude_unset=True)
        if "status" in updates and updates["status"] not in self.VALID_SCHEDULE_STATUS:
            raise ConflictError(f"Invalid status: {updates['status']}")
        for key, value in updates.items():
            setattr(schedule, key, value)
        return ServiceScheduleRead.model_validate(self.repo.update_service_schedule(schedule))

    # --- Notes ---

    def list_asset_notes(self, apartment_id: str, asset_id: str) -> list[AssetNoteRead]:
        if not self.repo.get_asset(apartment_id, asset_id):
            raise NotFoundError("Asset not found")
        return [AssetNoteRead.model_validate(n) for n in self.repo.list_asset_notes(apartment_id, asset_id)]

    def create_asset_note(
        self, apartment_id: str, asset_id: str, data: AssetNoteCreate, author_user_id: str | None = None
    ) -> AssetNoteRead:
        if not self.repo.get_asset(apartment_id, asset_id):
            raise NotFoundError("Asset not found")
        note = AssetInternalNote(
            id=new_uuid(),
            apartment_id=apartment_id,
            asset_id=asset_id,
            author_user_id=author_user_id,
            author_name=data.author_name or "Staff",
            content=data.content,
        )
        return AssetNoteRead.model_validate(self.repo.create_asset_note(note))
