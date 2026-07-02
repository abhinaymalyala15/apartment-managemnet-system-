from app.core.exceptions import NotFoundError
from app.repositories.settings_repository import SettingsRepository
from app.repositories.structure_repository import StructureRepository
from app.schemas.settings import (
    CommitteeMemberRead,
    ContactsBundle,
    EmergencyContactRead,
    GalleryImageRead,
    IntegrationRead,
    IntegrationUpdate,
    OfficeContactRead,
    PreferencesRead,
    PreferencesUpdate,
    SettingsBundle,
)


class SettingsService:
    def __init__(self, repo: SettingsRepository, structure_repo: StructureRepository):
        self.repo = repo
        self.structure_repo = structure_repo

    def _get_apartment(self, apartment_id: str):
        apt = self.structure_repo.get_apartment(apartment_id)
        if not apt:
            raise NotFoundError("Apartment not found")
        return apt

    def get_settings(self, apartment_id: str) -> SettingsBundle:
        self._get_apartment(apartment_id)
        prefs = self.repo.get_preferences(apartment_id)
        if not prefs:
            raise NotFoundError("Preferences not configured — run seed_settings.py")
        office = self.repo.get_office(apartment_id)
        return SettingsBundle(
            preferences=PreferencesRead.model_validate(prefs),
            integrations=[IntegrationRead.model_validate(i) for i in self.repo.list_integrations(apartment_id)],
            contacts=ContactsBundle(
                committee=[CommitteeMemberRead.model_validate(c) for c in self.repo.list_committee(apartment_id)],
                emergency=[EmergencyContactRead.model_validate(e) for e in self.repo.list_emergency(apartment_id)],
                office=OfficeContactRead.model_validate(office) if office else None,
            ),
        )

    def update_preferences(self, apartment_id: str, data: PreferencesUpdate) -> PreferencesRead:
        prefs = self.repo.get_preferences(apartment_id)
        if not prefs:
            raise NotFoundError("Preferences not found")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(prefs, key, value)
        return PreferencesRead.model_validate(self.repo.update_preferences(prefs))

    def update_integration(
        self, apartment_id: str, integration_id: str, data: IntegrationUpdate
    ) -> IntegrationRead:
        integration = self.repo.get_integration(apartment_id, integration_id)
        if not integration:
            raise NotFoundError("Integration not found")
        integration.enabled = data.enabled
        return IntegrationRead.model_validate(self.repo.update_integration(integration))

    def list_gallery(self, apartment_id: str) -> list[GalleryImageRead]:
        self._get_apartment(apartment_id)
        return [GalleryImageRead.model_validate(g) for g in self.repo.list_gallery(apartment_id)]

    def get_contacts(self, apartment_id: str) -> ContactsBundle:
        self._get_apartment(apartment_id)
        office = self.repo.get_office(apartment_id)
        return ContactsBundle(
            committee=[CommitteeMemberRead.model_validate(c) for c in self.repo.list_committee(apartment_id)],
            emergency=[EmergencyContactRead.model_validate(e) for e in self.repo.list_emergency(apartment_id)],
            office=OfficeContactRead.model_validate(office) if office else None,
        )
