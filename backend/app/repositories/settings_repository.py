from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.settings import (
    CommitteeMember,
    EmergencyContact,
    GalleryImage,
    IntegrationSetting,
    OfficeContact,
    SystemPreference,
)


def _active(model):
    return model.deleted_at.is_(None)


class SettingsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_preferences(self, apartment_id: str) -> SystemPreference | None:
        return self.db.scalar(
            select(SystemPreference).where(
                SystemPreference.apartment_id == apartment_id,
                _active(SystemPreference),
            )
        )

    def save_preferences(self, prefs: SystemPreference) -> SystemPreference:
        self.db.add(prefs)
        self.db.commit()
        self.db.refresh(prefs)
        return prefs

    def update_preferences(self, prefs: SystemPreference) -> SystemPreference:
        self.db.commit()
        self.db.refresh(prefs)
        return prefs

    def list_committee(self, apartment_id: str) -> list[CommitteeMember]:
        return list(
            self.db.scalars(
                select(CommitteeMember)
                .where(CommitteeMember.apartment_id == apartment_id, _active(CommitteeMember))
                .order_by(CommitteeMember.sort_order)
            ).all()
        )

    def list_emergency(self, apartment_id: str) -> list[EmergencyContact]:
        return list(
            self.db.scalars(
                select(EmergencyContact)
                .where(EmergencyContact.apartment_id == apartment_id, _active(EmergencyContact))
                .order_by(EmergencyContact.sort_order)
            ).all()
        )

    def get_office(self, apartment_id: str) -> OfficeContact | None:
        return self.db.scalar(
            select(OfficeContact).where(
                OfficeContact.apartment_id == apartment_id,
                _active(OfficeContact),
            )
        )

    def list_integrations(self, apartment_id: str) -> list[IntegrationSetting]:
        return list(
            self.db.scalars(
                select(IntegrationSetting).where(
                    IntegrationSetting.apartment_id == apartment_id,
                    _active(IntegrationSetting),
                )
            ).all()
        )

    def get_integration(self, apartment_id: str, integration_id: str) -> IntegrationSetting | None:
        return self.db.scalar(
            select(IntegrationSetting).where(
                IntegrationSetting.id == integration_id,
                IntegrationSetting.apartment_id == apartment_id,
                _active(IntegrationSetting),
            )
        )

    def update_integration(self, integration: IntegrationSetting) -> IntegrationSetting:
        self.db.commit()
        self.db.refresh(integration)
        return integration

    def list_gallery(self, apartment_id: str) -> list[GalleryImage]:
        return list(
            self.db.scalars(
                select(GalleryImage)
                .where(GalleryImage.apartment_id == apartment_id, _active(GalleryImage))
                .order_by(GalleryImage.sort_order)
            ).all()
        )
