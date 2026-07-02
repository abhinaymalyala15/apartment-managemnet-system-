from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException, app_exception_handler
from app.core.middleware import RequestLoggingMiddleware

logging.basicConfig(
    level=logging.INFO if settings.is_production else logging.DEBUG,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        lifespan=lifespan,
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
    )
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_exception_handler(AppException, app_exception_handler)

    @app.get("/health")
    def health():
        return {"status": "ok", "environment": settings.environment}

    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
