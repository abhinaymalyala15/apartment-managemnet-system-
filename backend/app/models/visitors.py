from datetime import date, time

from sqlalchemy import Date, ForeignKey, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, BaseModelMixin


class VisitorRecord(Base, BaseModelMixin):
    __tablename__ = "visitor_records"

    apartment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("apartments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    flat_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("flats.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    guest_name: Mapped[str] = mapped_column(String(255), nullable=False)
    purpose: Mapped[str | None] = mapped_column(String(500), nullable=True)
    expected_date: Mapped[date] = mapped_column(Date, nullable=False)
    expected_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    approved_by: Mapped[str | None] = mapped_column(String(36), nullable=True)

    flat: Mapped["Flat"] = relationship("Flat")


from app.models.structure import Flat  # noqa: E402
