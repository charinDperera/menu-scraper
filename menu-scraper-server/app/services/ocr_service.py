import asyncio
from typing import Optional
from app.core.logging import get_logger
from app.models.errors import OCRProcessingError
from app.utils.file_utils import file_processor

logger = get_logger(__name__)


class OCRService:
    """Service for OCR text extraction operations."""
    
    def __init__(self):
        self.logger = logger
    
    async def extract_text_async(self, file_path: str, file_format: str) -> str:
        """Extract text from file asynchronously."""
        try:
            self.logger.info(f"Starting OCR text extraction for {file_path}")
            
            # Run OCR in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            text = await loop.run_in_executor(
                None, 
                file_processor.extract_text, 
                file_path, 
                file_format
            )
            
            if not text or not text.strip():
                raise OCRProcessingError("No text extracted from file")
            
            self.logger.info(f"OCR completed successfully. Extracted {len(text)} characters")
            return text.strip()
            
        except Exception as e:
            self.logger.error(f"OCR processing failed: {e}")
            if isinstance(e, OCRProcessingError):
                raise
            raise OCRProcessingError(f"OCR processing failed: {str(e)}")
    
    async def extract_text_with_retry(
        self, 
        file_path: str, 
        file_format: str, 
        max_retries: int = 3
    ) -> str:
        """Extract text with retry logic."""
        last_error = None
        
        for attempt in range(max_retries):
            try:
                return await self.extract_text_async(file_path, file_format)
            except Exception as e:
                last_error = e
                self.logger.warning(f"OCR attempt {attempt + 1} failed: {e}")
                
                if attempt < max_retries - 1:
                    await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
        
        # All retries failed
        raise OCRProcessingError(f"OCR failed after {max_retries} attempts. Last error: {str(last_error)}")
    
    def get_supported_formats(self) -> list:
        """Get list of supported file formats."""
        return list(file_processor.supported_formats)
    
    def validate_file_format(self, file_format: str) -> bool:
        """Validate if file format is supported."""
        return file_format.lower() in file_processor.supported_formats


# Global OCR service instance
ocr_service = OCRService() 