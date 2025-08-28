from typing import Generator
from fastapi import Depends, HTTPException, status
from app.core.logging import get_logger
from app.services.ocr_service import ocr_service
from app.services.llm_service import llm_service
from app.services.core_api_service import core_api_service
from app.utils.file_utils import file_processor

logger = get_logger(__name__)


def get_ocr_service():
    """Dependency for OCR service."""
    return ocr_service


def get_llm_service():
    """Dependency for LLM service."""
    return llm_service


def get_core_api_service():
    """Dependency for Core API service."""
    return core_api_service


def get_file_processor():
    """Dependency for file processor."""
    return file_processor


def get_logger_dep():
    """Dependency for logger."""
    return logger


def validate_api_key(api_key: str = None) -> bool:
    """Validate API key if required."""
    # This is a placeholder - implement your API key validation logic
    # For now, we'll assume no API key is required
    return True


def get_authenticated_user(api_key: str = None):
    """Dependency for authenticated user."""
    if not validate_api_key(api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return {"authenticated": True} 