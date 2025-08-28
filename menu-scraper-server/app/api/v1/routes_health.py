from fastapi import APIRouter, Depends
from app.services.core_api_service import core_api_service
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Check Core API health
        core_api_healthy = await core_api_service.health_check()
        
        health_status = {
            "status": "healthy" if core_api_healthy else "degraded",
            "timestamp": "2024-01-01T00:00:00Z",  # Placeholder
            "services": {
                "menu_scraper_server": "healthy",
                "core_api": "healthy" if core_api_healthy else "unhealthy"
            },
            "version": "1.0.0"
        }
        
        logger.info("Health check completed", extra={"health_status": health_status})
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": "2024-01-01T00:00:00Z",  # Placeholder
            "services": {
                "menu_scraper_server": "unhealthy",
                "core_api": "unknown"
            },
            "version": "1.0.0",
            "error": str(e)
        }


@router.get("/health/ready")
async def readiness_check():
    """Readiness check endpoint."""
    try:
        # Check if all services are ready
        core_api_ready = await core_api_service.health_check()
        
        if core_api_ready:
            return {"status": "ready", "message": "All services are ready"}
        else:
            return {"status": "not_ready", "message": "Core API is not ready"}
            
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {"status": "not_ready", "message": f"Service error: {str(e)}"}


@router.get("/health/live")
async def liveness_check():
    """Liveness check endpoint."""
    return {"status": "alive", "message": "Service is running"} 