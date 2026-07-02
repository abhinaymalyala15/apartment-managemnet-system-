from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.structure import Apartment, Block, Flat, Floor


def _active_filter(model):
    return model.deleted_at.is_(None)


class StructureRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- Apartments ---

    def list_apartments(self, include_inactive: bool = False) -> list[Apartment]:
        stmt = select(Apartment)
        if not include_inactive:
            stmt = stmt.where(_active_filter(Apartment))
        return list(self.db.scalars(stmt.order_by(Apartment.name)).all())

    def get_apartment(self, apartment_id: str) -> Apartment | None:
        return self.db.scalar(
            select(Apartment).where(Apartment.id == apartment_id, _active_filter(Apartment))
        )

    def get_apartment_by_slug(self, slug: str) -> Apartment | None:
        return self.db.scalar(
            select(Apartment).where(Apartment.slug == slug, _active_filter(Apartment))
        )

    def create_apartment(self, apartment: Apartment) -> Apartment:
        if self.get_apartment_by_slug(apartment.slug):
            raise ConflictError(f"Apartment slug '{apartment.slug}' already exists")
        self.db.add(apartment)
        self.db.commit()
        self.db.refresh(apartment)
        return apartment

    def update_apartment(self, apartment: Apartment) -> Apartment:
        self.db.commit()
        self.db.refresh(apartment)
        return apartment

    def soft_delete_apartment(self, apartment: Apartment, deleted_by: str | None = None) -> None:
        apartment.is_active = False
        apartment.deleted_at = datetime.now(timezone.utc)
        apartment.deleted_by = deleted_by
        self.db.commit()

    # --- Blocks ---

    def list_blocks(self, apartment_id: str) -> list[Block]:
        return list(
            self.db.scalars(
                select(Block)
                .where(Block.apartment_id == apartment_id, _active_filter(Block))
                .order_by(Block.sort_order, Block.name)
            ).all()
        )

    def get_block(self, apartment_id: str, block_id: str) -> Block | None:
        return self.db.scalar(
            select(Block).where(
                Block.id == block_id,
                Block.apartment_id == apartment_id,
                _active_filter(Block),
            )
        )

    def create_block(self, block: Block) -> Block:
        self.db.add(block)
        self.db.commit()
        self.db.refresh(block)
        return block

    def update_block(self, block: Block) -> Block:
        self.db.commit()
        self.db.refresh(block)
        return block

    def soft_delete_block(self, block: Block, deleted_by: str | None = None) -> None:
        block.is_active = False
        block.deleted_at = datetime.now(timezone.utc)
        block.deleted_by = deleted_by
        self.db.commit()

    # --- Floors ---

    def list_floors(self, apartment_id: str, block_id: str) -> list[Floor]:
        return list(
            self.db.scalars(
                select(Floor)
                .where(
                    Floor.apartment_id == apartment_id,
                    Floor.block_id == block_id,
                    _active_filter(Floor),
                )
                .order_by(Floor.floor_number)
            ).all()
        )

    def get_floor(self, apartment_id: str, block_id: str, floor_id: str) -> Floor | None:
        return self.db.scalar(
            select(Floor).where(
                Floor.id == floor_id,
                Floor.apartment_id == apartment_id,
                Floor.block_id == block_id,
                _active_filter(Floor),
            )
        )

    def create_floor(self, floor: Floor) -> Floor:
        self.db.add(floor)
        self.db.commit()
        self.db.refresh(floor)
        return floor

    def update_floor(self, floor: Floor) -> Floor:
        self.db.commit()
        self.db.refresh(floor)
        return floor

    def soft_delete_floor(self, floor: Floor, deleted_by: str | None = None) -> None:
        floor.is_active = False
        floor.deleted_at = datetime.now(timezone.utc)
        floor.deleted_by = deleted_by
        self.db.commit()

    # --- Flats ---

    def list_flats(
        self,
        apartment_id: str,
        block_id: str | None = None,
        floor_id: str | None = None,
    ) -> list[Flat]:
        stmt = select(Flat).where(Flat.apartment_id == apartment_id, _active_filter(Flat))
        if block_id:
            stmt = stmt.where(Flat.block_id == block_id)
        if floor_id:
            stmt = stmt.where(Flat.floor_id == floor_id)
        return list(self.db.scalars(stmt.order_by(Flat.flat_number)).all())

    def get_flat(self, apartment_id: str, flat_id: str) -> Flat | None:
        return self.db.scalar(
            select(Flat).where(
                Flat.id == flat_id,
                Flat.apartment_id == apartment_id,
                _active_filter(Flat),
            )
        )

    def create_flat(self, flat: Flat) -> Flat:
        self.db.add(flat)
        self.db.commit()
        self.db.refresh(flat)
        return flat

    def update_flat(self, flat: Flat) -> Flat:
        self.db.commit()
        self.db.refresh(flat)
        return flat

    def soft_delete_flat(self, flat: Flat, deleted_by: str | None = None) -> None:
        flat.is_active = False
        flat.deleted_at = datetime.now(timezone.utc)
        flat.deleted_by = deleted_by
        self.db.commit()

    def count_flats_for_block(self, block_id: str) -> int:
        return len(
            list(
                self.db.scalars(
                    select(Flat).where(Flat.block_id == block_id, _active_filter(Flat))
                ).all()
            )
        )

    def count_flats_for_floor(self, floor_id: str) -> int:
        return len(
            list(
                self.db.scalars(
                    select(Flat).where(Flat.floor_id == floor_id, _active_filter(Flat))
                ).all()
            )
        )

    def refresh_block_counts(self, block: Block) -> None:
        floors = self.list_floors(block.apartment_id, block.id)
        block.floor_count = len(floors)
        block.total_flats = self.count_flats_for_block(block.id)
        for floor in floors:
            floor.flat_count = self.count_flats_for_floor(floor.id)
        self.db.commit()
