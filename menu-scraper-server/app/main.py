import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging, get_logger, RequestResponseLogger
from app.api.v1.routes_menu import router as menu_router
from app.api.v1.routes_health import router as health_router
from app.models.errors import MenuScraperException, HTTP_STATUS_MAPPING

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Menu Scraper Server")
    logger.info(f"Environment: {'Development' if settings.debug else 'Production'}")
    logger.info(f"Server will run on {settings.host}:{settings.port}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Menu Scraper Server")


# Create FastAPI app
app = FastAPI(
    title="Menu Scraper Server",
    description="FastAPI microservice for menu OCR and LLM processing",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log request and response information."""
    start_time = time.time()
    
    # Log request
    request_logger = RequestResponseLogger()
    request_data = {
        "method": request.method,
        "url": str(request.url),
        "client_ip": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "timestamp": start_time
    }
    request_logger.log_request(request_data)
    
    # Process request
    try:
        response = await call_next(request)
        
        # Log response
        response_data = {
            "status_code": response.status_code,
            "processing_time": time.time() - start_time,
            "timestamp": time.time()
        }
        request_logger.log_response(response_data)
        
        return response
        
    except Exception as e:
        # Log error
        error_data = {
            "error": str(e),
            "processing_time": time.time() - start_time,
            "timestamp": time.time()
        }
        request_logger.log_error(error_data)
        raise


# Exception handler for custom exceptions
@app.exception_handler(MenuScraperException)
async def menu_scraper_exception_handler(request: Request, exc: MenuScraperException):
    """Handle custom MenuScraperException."""
    status_code = HTTP_STATUS_MAPPING.get(type(exc), 500)
    
    error_response = {
        "success": False,
        "message": exc.message,
        "error_code": exc.error_code,
        "errors": exc.details or [exc.message],
        "timestamp": time.time()
    }
    
    logger.error(f"MenuScraperException: {exc.message}", extra=error_response)
    
    return JSONResponse(
        status_code=status_code,
        content=error_response
    )


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    error_response = {
        "success": False,
        "message": "An unexpected error occurred",
        "error_code": "INTERNAL_ERROR",
        "errors": [str(exc)],
        "timestamp": time.time()
    }
    
    logger.error(f"Unexpected error: {exc}", extra=error_response)
    
    return JSONResponse(
        status_code=500,
        content=error_response
    )


# Include routers
app.include_router(health_router, tags=["health"])
app.include_router(menu_router, prefix="/v1", tags=["menu"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Menu Scraper Server",
        "version": "1.0.0",
        "docs": "/docs" if settings.debug else "Documentation disabled in production",
        "health": "/health"
    }


@app.get("/info")
async def info():
    """Application information."""
    return {
        "name": "Menu Scraper Server",
        "version": "1.0.0",
        "description": "FastAPI microservice for menu OCR and LLM processing",
        "environment": "development" if settings.debug else "production",
        "supported_formats": [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"],
        "max_file_size_mb": 10
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    ) 