from fastapi import APIRouter

from app.api.v1 import (
    assets,
    auth,
    communication,
    complaints,
    documents,
    finance,
    people,
    reports,
    roles,
    settings,
    structure,
    visitors,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(structure.router)
api_router.include_router(people.router)
api_router.include_router(finance.router)
api_router.include_router(communication.router)
api_router.include_router(assets.router)
api_router.include_router(visitors.router)
api_router.include_router(complaints.router)
api_router.include_router(documents.router)
api_router.include_router(settings.router)
api_router.include_router(reports.router)
api_router.include_router(roles.router)
