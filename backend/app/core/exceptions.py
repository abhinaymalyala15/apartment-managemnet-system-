from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400, code: str = "error"):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404, code="not_found")


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Not authenticated"):
        super().__init__(message, status_code=401, code="unauthorized")


class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status_code=403, code="forbidden")


class ConflictError(AppException):
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message, status_code=409, code="conflict")


async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "http_error", "message": detail}},
    )
