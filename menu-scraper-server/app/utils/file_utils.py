import os
import tempfile
from typing import Tuple, Optional
from pathlib import Path
from PIL import Image
import pytesseract
from app.core.config import settings
from app.core.logging import get_logger
from app.models.errors import FileProcessingError, OCRProcessingError

logger = get_logger(__name__)


class FileProcessor:
    """Handles file processing operations."""
    
    def __init__(self):
        self.supported_formats = {'.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp'}
        self.max_file_size = 10 * 1024 * 1024  # 10MB
    
    def validate_file(self, filename: str, file_size: int) -> Tuple[bool, str]:
        """Validate uploaded file format and size."""
        if file_size > self.max_file_size:
            return False, f"File size {file_size} exceeds maximum allowed size {self.max_file_size}"
        
        file_ext = Path(filename).suffix.lower()
        if file_ext not in self.supported_formats:
            return False, f"Unsupported file format: {file_ext}. Supported: {', '.join(self.supported_formats)}"
        
        return True, ""
    
    def save_uploaded_file(self, file_content: bytes, filename: str) -> str:
        """Save uploaded file to temporary location."""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name
            
            logger.info(f"File saved temporarily: {temp_file_path}")
            return temp_file_path
        except Exception as e:
            logger.error(f"Failed to save uploaded file: {e}")
            raise FileProcessingError(f"Failed to save uploaded file: {str(e)}")
    
    def cleanup_temp_file(self, file_path: str) -> None:
        """Clean up temporary file."""
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                logger.info(f"Temporary file cleaned up: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup temporary file {file_path}: {e}")
    
    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using OCR."""
        try:
            # Configure Tesseract
            pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd
            
            # Open and process image
            image = Image.open(image_path)
            
            # Extract text
            text = pytesseract.image_to_string(image)
            
            if not text.strip():
                raise OCRProcessingError("No text extracted from image")
            
            logger.info(f"Successfully extracted {len(text)} characters from image")
            return text.strip()
            
        except Exception as e:
            logger.error(f"OCR processing failed: {e}")
            if isinstance(e, OCRProcessingError):
                raise
            raise OCRProcessingError(f"OCR processing failed: {str(e)}")
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF (placeholder implementation)."""
        # This is a placeholder - in production you'd use pdfplumber or similar
        logger.warning("PDF text extraction not implemented - using placeholder")
        return "PDF text extraction placeholder - implement with pdfplumber or similar library"
    
    def extract_text(self, file_path: str, file_format: str) -> str:
        """Extract text from file based on format."""
        if file_format.lower() in {'.png', '.jpg', '.jpeg', '.tiff', '.bmp'}:
            return self.extract_text_from_image(file_path)
        elif file_format.lower() == '.pdf':
            return self.extract_text_from_pdf(file_path)
        else:
            raise FileProcessingError(f"Unsupported file format for text extraction: {file_format}")


# Global file processor instance
file_processor = FileProcessor() 