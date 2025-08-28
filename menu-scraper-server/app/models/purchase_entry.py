from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class PurchaseEntry(BaseModel):
    """Model representing a purchase entry from menu OCR."""
    
    item_name: str = Field(..., description="Name of the menu item")
    price: float = Field(..., description="Price of the item")
    description: Optional[str] = Field(None, description="Description of the item")
    category: Optional[str] = Field(None, description="Category of the item")
    allergens: Optional[List[str]] = Field(None, description="List of allergens")
    nutritional_info: Optional[dict] = Field(None, description="Nutritional information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "item_name": "Margherita Pizza",
                "price": 18.99,
                "description": "Fresh mozzarella, tomato sauce, basil",
                "category": "Pizza",
                "allergens": ["dairy", "gluten"],
                "nutritional_info": {
                    "calories": 1200,
                    "protein": "45g",
                    "carbs": "120g"
                }
            }
        }


class MenuUploadRequest(BaseModel):
    """Request model for menu upload."""
    
    file_type: str = Field(..., description="Type of uploaded file")
    file_size: int = Field(..., description="Size of uploaded file in bytes")
    meta_prompt: Optional[str] = Field(None, description="Custom prompt for LLM processing")


class MenuUploadResponse(BaseModel):
    """Response model for menu upload."""
    
    success: bool = Field(..., description="Whether the upload was successful")
    message: str = Field(..., description="Response message")
    items: Optional[List[PurchaseEntry]] = Field(None, description="Extracted purchase entries")
    errors: Optional[List[str]] = Field(None, description="List of errors if any")
    processing_time: float = Field(..., description="Time taken to process in seconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    success: bool = Field(default=False)
    message: str = Field(..., description="Error message")
    errors: List[str] = Field(..., description="List of error details")
    timestamp: datetime = Field(default_factory=datetime.utcnow) 