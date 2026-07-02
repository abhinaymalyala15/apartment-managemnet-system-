from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, BaseModelMixin


class ResidentRequest(Base, BaseModelMixin):
    """Flat-scoped complaint / service request."""

    __tablename__ = "resident_requests"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    flat_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="open", nullable=False)
    priority: Mapped[str] = mapped_column(String(10), default="medium", nullable=False)
    assigned_to: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    flat: Mapped["Flat"] = relationship("Flat")


from app.models.structure import Flat  # noqa: E402
