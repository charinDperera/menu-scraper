from typing import List, Optional
from fastapi import HTTPException


class MenuScraperException(Exception):
    """Base exception for menu scraper application."""
    
    def __init__(self, message: str, error_code: str = None, details: Optional[List[str]] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or []
        super().__init__(self.message)


class FileProcessingError(MenuScraperException):
    """Raised when file processing fails."""
    pass


class OCRProcessingError(MenuScraperException):
    """Raised when OCR processing fails."""
    pass


class LLMProcessingError(MenuScraperException):
    """Raised when LLM processing fails."""
    pass


class CoreAPIError(MenuScraperException):
    """Raised when Core API calls fail."""
    pass


class ValidationError(MenuScraperException):
    """Raised when data validation fails."""
    pass


def create_http_exception(
    status_code: int,
    message: str,
    error_code: str = None,
    details: Optional[List[str]] = None
) -> HTTPException:
    """Create a standardized HTTPException."""
    error_detail = {
        "success": False,
        "message": message,
        "error_code": error_code,
        "errors": details or []
    }
    return HTTPException(status_code=status_code, detail=error_detail)


# HTTP status code mappings
HTTP_STATUS_MAPPING = {
    FileProcessingError: 400,
    OCRProcessingError: 422,
    LLMProcessingError: 500,
    CoreAPIError: 502,
    ValidationError: 400,
} 