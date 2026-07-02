from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.db.base import Base
from app.models import (  # noqa: F401
    AdminRoleDefinition,
    Apartment,
    ApartmentMembership,
    AssetAmcRecord,
    AssetInternalNote,
    AssetServiceRecord,
    AssetVendorLink,
    AuditLog,
    BillingPeriod,
    Block,
    CommitteeMember,
    CommunityAsset,
    Document,
    EmergencyContact,
    FacilityVendor,
    FamilyMemberProfile,
    Flat,
    FlatInternalNote,
    Floor,
    FollowUpRecord,
    GalleryImage,
    IntegrationSetting,
    LoginAttempt,
    MaintenanceBill,
    MaintenanceBillingConfig,
    Notice,
    NoticeBlockTarget,
    NoticeHistoryEvent,
    Notification,
    OccupancyHistory,
    OfficeContact,
    OwnerProfile,
    Payment,
    PaymentAllocation,
    Permission,
    Person,
    PlatformRole,
    Receipt,
    RefreshToken,
    ResidentRequest,
    RolePermission,
    ServiceSchedule,
    StaffBlockScope,
    StaffProfile,
    SystemPreference,
    TenantProfile,
    TimelineEvent,
    User,
    VisitorRecord,
)

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
