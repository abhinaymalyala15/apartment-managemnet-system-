from app.core.exceptions import ConflictError, NotFoundError
from app.db.base import new_uuid
from app.models.structure import Apartment, Block, Flat, Floor
from app.repositories.structure_repository import StructureRepository
from app.schemas.structure import (
    ApartmentCreate,
    ApartmentUpdate,
    BlockCreate,
    BlockUpdate,
    FlatCreate,
    FlatUpdate,
    FloorCreate,
    FloorUpdate,
)


class StructureService:
    VALID_OCCUPANCY = {"vacant", "owner_occupied", "tenant_occupied"}

    def __init__(self, repo: StructureRepository):
        self.repo = repo

    # --- Apartments ---

    def list_apartments(self) -> list[Apartment]:
        return self.repo.list_apartments()

    def get_apartment(self, apartment_id: str) -> Apartment:
        apartment = self.repo.get_apartment(apartment_id)
        if not apartment:
            raise NotFoundError("Apartment not found")
        return apartment

    def create_apartment(self, data: ApartmentCreate) -> Apartment:
        apartment = Apartment(id=new_uuid(), **data.model_dump())
        return self.repo.create_apartment(apartment)

    def update_apartment(self, apartment_id: str, data: ApartmentUpdate) -> Apartment:
        apartment = self.get_apartment(apartment_id)
        updates = data.model_dump(exclude_unset=True)
        if "slug" in updates and updates["slug"] != apartment.slug:
            existing = self.repo.get_apartment_by_slug(updates["slug"])
            if existing:
                raise ConflictError(f"Apartment slug '{updates['slug']}' already exists")
        for key, value in updates.items():
            setattr(apartment, key, value)
        return self.repo.update_apartment(apartment)

    def delete_apartment(self, apartment_id: str, deleted_by: str | None = None) -> None:
        apartment = self.get_apartment(apartment_id)
        self.repo.soft_delete_apartment(apartment, deleted_by)

    # --- Blocks ---

    def list_blocks(self, apartment_id: str) -> list[Block]:
        self.get_apartment(apartment_id)
        return self.repo.list_blocks(apartment_id)

    def get_block(self, apartment_id: str, block_id: str) -> Block:
        block = self.repo.get_block(apartment_id, block_id)
        if not block:
            raise NotFoundError("Block not found")
        return block

    def create_block(self, apartment_id: str, data: BlockCreate) -> Block:
        self.get_apartment(apartment_id)
        block = Block(id=new_uuid(), apartment_id=apartment_id, **data.model_dump())
        block = self.repo.create_block(block)
        self.repo.refresh_block_counts(block)
        return self.repo.get_block(apartment_id, block.id)  # type: ignore[return-value]

    def update_block(self, apartment_id: str, block_id: str, data: BlockUpdate) -> Block:
        block = self.get_block(apartment_id, block_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(block, key, value)
        return self.repo.update_block(block)

    def delete_block(self, apartment_id: str, block_id: str, deleted_by: str | None = None) -> None:
        block = self.get_block(apartment_id, block_id)
        if self.repo.count_flats_for_block(block_id) > 0:
            raise ConflictError("Cannot delete block with active flats")
        self.repo.soft_delete_block(block, deleted_by)

    # --- Floors ---

    def list_floors(self, apartment_id: str, block_id: str) -> list[Floor]:
        self.get_block(apartment_id, block_id)
        return self.repo.list_floors(apartment_id, block_id)

    def get_floor(self, apartment_id: str, block_id: str, floor_id: str) -> Floor:
        floor = self.repo.get_floor(apartment_id, block_id, floor_id)
        if not floor:
            raise NotFoundError("Floor not found")
        return floor

    def create_floor(self, apartment_id: str, block_id: str, data: FloorCreate) -> Floor:
        self.get_block(apartment_id, block_id)
        floor = Floor(
            id=new_uuid(),
            apartment_id=apartment_id,
            block_id=block_id,
            **data.model_dump(),
        )
        floor = self.repo.create_floor(floor)
        block = self.get_block(apartment_id, block_id)
        self.repo.refresh_block_counts(block)
        return floor

    def update_floor(
        self, apartment_id: str, block_id: str, floor_id: str, data: FloorUpdate
    ) -> Floor:
        floor = self.get_floor(apartment_id, block_id, floor_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(floor, key, value)
        floor = self.repo.update_floor(floor)
        block = self.get_block(apartment_id, block_id)
        self.repo.refresh_block_counts(block)
        return floor

    def delete_floor(
        self, apartment_id: str, block_id: str, floor_id: str, deleted_by: str | None = None
    ) -> None:
        floor = self.get_floor(apartment_id, block_id, floor_id)
        if self.repo.count_flats_for_floor(floor_id) > 0:
            raise ConflictError("Cannot delete floor with active flats")
        self.repo.soft_delete_floor(floor, deleted_by)
        block = self.get_block(apartment_id, block_id)
        self.repo.refresh_block_counts(block)

    # --- Flats ---

    def list_flats(
        self,
        apartment_id: str,
        block_id: str | None = None,
        floor_id: str | None = None,
    ) -> list[Flat]:
        self.get_apartment(apartment_id)
        if block_id:
            self.get_block(apartment_id, block_id)
        if floor_id and block_id:
            self.get_floor(apartment_id, block_id, floor_id)
        return self.repo.list_flats(apartment_id, block_id, floor_id)

    def get_flat(self, apartment_id: str, flat_id: str) -> Flat:
        flat = self.repo.get_flat(apartment_id, flat_id)
        if not flat:
            raise NotFoundError("Flat not found")
        return flat

    def create_flat(self, apartment_id: str, data: FlatCreate) -> Flat:
        if data.occupancy_status not in self.VALID_OCCUPANCY:
            raise ConflictError(f"Invalid occupancy_status: {data.occupancy_status}")
        block = self.get_block(apartment_id, data.block_id)
        floor = self.get_floor(apartment_id, data.block_id, data.floor_id)
        flat = Flat(
            id=new_uuid(),
            apartment_id=apartment_id,
            block_id=data.block_id,
            floor_id=data.floor_id,
            floor=floor.floor_number,
            flat_number=data.flat_number,
            area_sqft=data.area_sqft,
            bedrooms=data.bedrooms,
            flat_type=data.flat_type,
            parking_slots=data.parking_slots,
            occupancy_status=data.occupancy_status,
        )
        flat = self.repo.create_flat(flat)
        self.repo.refresh_block_counts(block)
        return flat

    def update_flat(self, apartment_id: str, flat_id: str, data: FlatUpdate) -> Flat:
        flat = self.get_flat(apartment_id, flat_id)
        updates = data.model_dump(exclude_unset=True)
        if "occupancy_status" in updates and updates["occupancy_status"] not in self.VALID_OCCUPANCY:
            raise ConflictError(f"Invalid occupancy_status: {updates['occupancy_status']}")
        if "floor_id" in updates:
            floor = self.get_floor(apartment_id, flat.block_id, updates["floor_id"])
            flat.floor_id = floor.id
            flat.floor = floor.floor_number
        for key, value in updates.items():
            if key != "floor_id":
                setattr(flat, key, value)
        flat = self.repo.update_flat(flat)
        block = self.get_block(apartment_id, flat.block_id)
        self.repo.refresh_block_counts(block)
        return flat

    def delete_flat(self, apartment_id: str, flat_id: str, deleted_by: str | None = None) -> None:
        flat = self.get_flat(apartment_id, flat_id)
        block_id = flat.block_id
        self.repo.soft_delete_flat(flat, deleted_by)
        block = self.get_block(apartment_id, block_id)
        self.repo.refresh_block_counts(block)
