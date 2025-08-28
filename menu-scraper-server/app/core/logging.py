import logging
import sys
from typing import Any, Dict
from app.core.config import settings


def setup_logging() -> None:
    """Configure logging for the application."""
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ]
    )
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    # Create logger instance
    logger = logging.getLogger(__name__)
    logger.info("Logging configured successfully")


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name."""
    return logging.getLogger(name)


class RequestResponseLogger:
    """Middleware logger for request/response lifecycle."""
    
    def __init__(self, logger_name: str = "request_response"):
        self.logger = get_logger(logger_name)
    
    def log_request(self, request_data: Dict[str, Any]) -> None:
        """Log incoming request data."""
        self.logger.info("Incoming request", extra=request_data)
    
    def log_response(self, response_data: Dict[str, Any]) -> None:
        """Log outgoing response data."""
        self.logger.info("Outgoing response", extra=response_data)
    
    def log_error(self, error_data: Dict[str, Any]) -> None:
        """Log error data."""
        self.logger.error("Error occurred", extra=error_data) 