import time
from typing import List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, status
from app.core.logging import get_logger
from app.services.ocr_service import ocr_service
from app.services.llm_service import llm_service
from app.services.core_api_service import core_api_service
from app.utils.file_utils import file_processor
from app.models.purchase_entry import MenuUploadResponse, PurchaseEntry
from app.models.errors import (
    MenuScraperException, 
    FileProcessingError, 
    OCRProcessingError, 
    LLMProcessingError, 
    CoreAPIError,
    create_http_exception
)

router = APIRouter()
logger = get_logger(__name__)


@router.post("/menu/upload", response_model=MenuUploadResponse)
async def upload_menu(
    file: UploadFile = File(...),
    meta_prompt: Optional[str] = Form(None),
    ocr_service_dep: ocr_service = Depends(),
    llm_service_dep: llm_service = Depends(),
    core_api_service_dep: core_api_service = Depends(),
    file_processor_dep: file_processor = Depends()
):
    """Upload and process menu file."""
    start_time = time.time()
    temp_file_path = None
    
    try:
        logger.info(f"Processing menu upload: {file.filename}")
        
        # Validate file
        file_content = await file.read()
        is_valid, error_msg = file_processor_dep.validate_file(file.filename, len(file_content))
        
        if not is_valid:
            raise FileProcessingError(error_msg)
        
        # Save file temporarily
        temp_file_path = file_processor_dep.save_uploaded_file(file_content, file.filename)
        file_format = file.filename.lower().split('.')[-1]
        
        # Extract text using OCR
        logger.info("Starting OCR text extraction")
        extracted_text = await ocr_service_dep.extract_text_async(temp_file_path, f".{file_format}")
        
        if not extracted_text or not extracted_text.strip():
            raise OCRProcessingError("No text extracted from uploaded file")
        
        # Process text with LLM
        logger.info("Starting LLM processing")
        purchase_entries = await llm_service_dep.process_text_to_purchase_entries(
            extracted_text, 
            meta_prompt
        )
        
        if not purchase_entries:
            raise LLMProcessingError("No purchase entries generated from LLM processing")
        
        # Send to Core API
        logger.info("Sending data to Core API")
        core_api_response = await core_api_service_dep.send_purchase_entries(
            purchase_entries,
            metadata={
                "filename": file.filename,
                "file_size": len(file_content),
                "meta_prompt": meta_prompt,
                "extracted_text_length": len(extracted_text)
            }
        )
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Prepare response
        response = MenuUploadResponse(
            success=True,
            message=f"Successfully processed {len(purchase_entries)} menu items",
            items=purchase_entries,
            errors=[],
            processing_time=round(processing_time, 3)
        )
        
        logger.info(f"Menu upload completed successfully in {processing_time:.3f}s")
        return response
        
    except MenuScraperException as e:
        processing_time = time.time() - start_time
        logger.error(f"Menu processing failed: {e.message}")
        
        # Create error response
        response = MenuUploadResponse(
            success=False,
            message=f"Menu processing failed: {e.message}",
            items=[],
            errors=e.details or [e.message],
            processing_time=round(processing_time, 3)
        )
        
        return response
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Unexpected error in menu processing: {e}")
        
        response = MenuUploadResponse(
            success=False,
            message="An unexpected error occurred during processing",
            items=[],
            errors=[str(e)],
            processing_time=round(processing_time, 3)
        )
        
        return response
        
    finally:
        # Clean up temporary file
        if temp_file_path:
            file_processor_dep.cleanup_temp_file(temp_file_path)


@router.get("/menu/supported-formats")
async def get_supported_formats():
    """Get list of supported file formats."""
    formats = file_processor.get_supported_formats()
    return {
        "supported_formats": formats,
        "max_file_size_mb": file_processor.max_file_size / (1024 * 1024)
    }


@router.post("/menu/validate")
async def validate_menu_data(
    purchase_entries: List[dict],
    file_processor_dep: file_processor = Depends()
):
    """Validate menu data without processing."""
    try:
        from app.utils.validation import validate_purchase_entry_data
        
        validated_entries = []
        errors = []
        
        for i, entry in enumerate(purchase_entries):
            try:
                validated_data = validate_purchase_entry_data(entry)
                validated_entries.append(validated_data)
            except Exception as e:
                errors.append(f"Entry {i}: {str(e)}")
        
        return {
            "valid_entries": len(validated_entries),
            "total_entries": len(purchase_entries),
            "errors": errors,
            "validated_data": validated_entries if not errors else []
        }
        
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(e)}"
        ) 