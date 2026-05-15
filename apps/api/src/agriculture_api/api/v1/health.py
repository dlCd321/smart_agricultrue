from fastapi import APIRouter

from agriculture_api.api.responses import success_response
from agriculture_api.core.config import get_settings
from agriculture_api.schemas.common import ApiResponse, HealthResponse

router = APIRouter()


@router.get("/health", response_model=ApiResponse[HealthResponse])
def health_check() -> ApiResponse[HealthResponse]:
    settings = get_settings()
    return success_response(
        HealthResponse(
            status="ok",
            service="agriculture-api",
            version=settings.app_version,
        )
    )
