import json
import asyncio
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.logging import get_logger
from app.models.errors import LLMProcessingError
from app.models.purchase_entry import PurchaseEntry
from app.utils.validation import validate_purchase_entry_data

logger = get_logger(__name__)


class LLMService:
    """Service for LLM processing operations."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.logger = logger
    
    async def process_text_to_purchase_entries(
        self, 
        extracted_text: str, 
        meta_prompt: Optional[str] = None
    ) -> List[PurchaseEntry]:
        """Process extracted text to structured purchase entries using LLM."""
        try:
            self.logger.info("Starting LLM processing of extracted text")
            
            # Construct the prompt
            prompt = self._build_prompt(extracted_text, meta_prompt)
            
            # Call OpenAI API
            response = await self._call_openai_api(prompt)
            
            # Parse and validate response
            purchase_entries = await self._parse_llm_response(response)
            
            self.logger.info(f"LLM processing completed. Generated {len(purchase_entries)} entries")
            return purchase_entries
            
        except Exception as e:
            self.logger.error(f"LLM processing failed: {e}")
            if isinstance(e, LLMProcessingError):
                raise
            raise LLMProcessingError(f"LLM processing failed: {str(e)}")
    
    def _build_prompt(self, extracted_text: str, meta_prompt: Optional[str] = None) -> str:
        """Build the prompt for LLM processing."""
        base_prompt = f"""
You are a menu parsing assistant. Extract menu items from the following text and structure them as JSON objects.

Each menu item should have:
- item_name: The name of the dish/item
- price: The price as a number (extract from text, handle currency symbols)
- description: Brief description if available
- category: Food category if identifiable
- allergens: List of allergens if mentioned
- nutritional_info: Any nutritional information if available

Return a JSON array of objects. Example format:
[
    {{
        "item_name": "Margherita Pizza",
        "price": 18.99,
        "description": "Fresh mozzarella, tomato sauce, basil",
        "category": "Pizza",
        "allergens": ["dairy", "gluten"],
        "nutritional_info": {{
            "calories": 1200,
            "protein": "45g"
        }}
    }}
]

Extracted text:
{extracted_text}

{f"Additional instructions: {meta_prompt}" if meta_prompt else ""}

Return only valid JSON, no additional text or explanations.
"""
        return base_prompt.strip()
    
    async def _call_openai_api(self, prompt: str) -> str:
        """Call OpenAI API to process the prompt."""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that extracts structured data from text."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            if not content:
                raise LLMProcessingError("Empty response from OpenAI API")
            
            return content.strip()
            
        except Exception as e:
            self.logger.error(f"OpenAI API call failed: {e}")
            raise LLMProcessingError(f"OpenAI API call failed: {str(e)}")
    
    async def _parse_llm_response(self, response: str) -> List[PurchaseEntry]:
        """Parse and validate LLM response."""
        try:
            # Clean response and extract JSON
            cleaned_response = self._clean_llm_response(response)
            
            # Parse JSON
            try:
                data = json.loads(cleaned_response)
            except json.JSONDecodeError as e:
                raise LLMProcessingError(f"Invalid JSON response from LLM: {str(e)}")
            
            # Validate data structure
            if not isinstance(data, list):
                raise LLMProcessingError("LLM response is not a list")
            
            # Process each entry
            purchase_entries = []
            errors = []
            
            for i, item in enumerate(data):
                try:
                    if not isinstance(item, dict):
                        errors.append(f"Item {i}: Not a dictionary")
                        continue
                    
                    # Validate and clean data
                    validated_data = validate_purchase_entry_data(item)
                    
                    # Create PurchaseEntry object
                    entry = PurchaseEntry(**validated_data)
                    purchase_entries.append(entry)
                    
                except Exception as e:
                    errors.append(f"Item {i}: {str(e)}")
                    continue
            
            if not purchase_entries:
                raise LLMProcessingError(f"No valid purchase entries found. Errors: {errors}")
            
            if errors:
                self.logger.warning(f"Some items had validation errors: {errors}")
            
            return purchase_entries
            
        except Exception as e:
            if isinstance(e, LLMProcessingError):
                raise
            raise LLMProcessingError(f"Failed to parse LLM response: {str(e)}")
    
    def _clean_llm_response(self, response: str) -> str:
        """Clean LLM response to extract JSON."""
        # Remove markdown code blocks
        if "```json" in response:
            start = response.find("```json") + 7
            end = response.find("```", start)
            if end != -1:
                response = response[start:end]
        elif "```" in response:
            start = response.find("```") + 3
            end = response.find("```", start)
            if end != -1:
                response = response[start:end]
        
        # Remove leading/trailing whitespace and newlines
        response = response.strip()
        
        return response
    
    async def process_with_retry(
        self, 
        extracted_text: str, 
        meta_prompt: Optional[str] = None,
        max_retries: int = 3
    ) -> List[PurchaseEntry]:
        """Process text with retry logic."""
        last_error = None
        
        for attempt in range(max_retries):
            try:
                return await self.process_text_to_purchase_entries(extracted_text, meta_prompt)
            except Exception as e:
                last_error = e
                self.logger.warning(f"LLM processing attempt {attempt + 1} failed: {e}")
                
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 * (attempt + 1))  # Exponential backoff
        
        # All retries failed
        raise LLMProcessingError(f"LLM processing failed after {max_retries} attempts. Last error: {str(last_error)}")


# Global LLM service instance
 