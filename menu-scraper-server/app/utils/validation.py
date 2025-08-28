import re
from typing import List, Optional
from app.models.errors import ValidationError


def validate_price(price_str: str) -> float:
    """Validate and convert price string to float."""
    try:
        # Remove currency symbols and whitespace
        cleaned_price = re.sub(r'[^\d.,]', '', price_str)
        
        # Handle different decimal separators
        if ',' in cleaned_price and '.' in cleaned_price:
            # Format: 1,234.56
            cleaned_price = cleaned_price.replace(',', '')
        elif ',' in cleaned_price:
            # Format: 1,23 (European)
            if cleaned_price.count(',') == 1 and len(cleaned_price.split(',')[1]) <= 2:
                cleaned_price = cleaned_price.replace(',', '.')
            else:
                cleaned_price = cleaned_price.replace(',', '')
        
        price = float(cleaned_price)
        
        if price < 0:
            raise ValidationError("Price cannot be negative")
        
        return round(price, 2)
    except (ValueError, TypeError):
        raise ValidationError(f"Invalid price format: {price_str}")


def validate_item_name(name: str) -> str:
    """Validate and clean item name."""
    if not name or not name.strip():
        raise ValidationError("Item name cannot be empty")
    
    # Clean and normalize name
    cleaned_name = name.strip()
    
    # Remove excessive whitespace
    cleaned_name = re.sub(r'\s+', ' ', cleaned_name)
    
    if len(cleaned_name) < 2:
        raise ValidationError("Item name too short")
    
    if len(cleaned_name) > 200:
        raise ValidationError("Item name too long")
    
    return cleaned_name


def validate_category(category: str) -> Optional[str]:
    """Validate and clean category."""
    if not category:
        return None
    
    cleaned_category = category.strip()
    
    if len(cleaned_category) < 2:
        return None
    
    if len(cleaned_category) > 100:
        cleaned_category = cleaned_category[:100]
    
    return cleaned_category


def validate_allergens(allergens: List[str]) -> Optional[List[str]]:
    """Validate and clean allergens list."""
    if not allergens:
        return None
    
    valid_allergens = []
    for allergen in allergens:
        if allergen and allergen.strip():
            cleaned = allergen.strip().lower()
            if len(cleaned) > 50:
                cleaned = cleaned[:50]
            valid_allergens.append(cleaned)
    
    return valid_allergens if valid_allergens else None


def validate_nutritional_info(nutritional_info: dict) -> Optional[dict]:
    """Validate nutritional information."""
    if not nutritional_info:
        return None
    
    valid_info = {}
    for key, value in nutritional_info.items():
        if key and value is not None:
            # Clean key
            clean_key = str(key).strip().lower()
            if len(clean_key) > 50:
                clean_key = clean_key[:50]
            
            # Clean value
            if isinstance(value, (int, float)):
                if value < 0:
                    continue  # Skip negative values
                valid_info[clean_key] = value
            elif isinstance(value, str):
                clean_value = str(value).strip()
                if clean_value and len(clean_value) <= 100:
                    valid_info[clean_key] = clean_value
    
    return valid_info if valid_info else None


def validate_purchase_entry_data(data: dict) -> dict:
    """Validate and clean purchase entry data."""
    try:
        validated_data = {}
        
        # Validate required fields
        if 'item_name' not in data or not data['item_name']:
            raise ValidationError("Item name is required")
        
        if 'price' not in data:
            raise ValidationError("Price is required")
        
        # Validate and clean fields
        validated_data['item_name'] = validate_item_name(data['item_name'])
        validated_data['price'] = validate_price(data['price'])
        
        # Optional fields
        if 'description' in data:
            desc = data['description']
            if desc and isinstance(desc, str):
                validated_data['description'] = desc.strip()[:500] if desc.strip() else None
        
        if 'category' in data:
            validated_data['category'] = validate_category(data['category'])
        
        if 'allergens' in data:
            validated_data['allergens'] = validate_allergens(data['allergens'])
        
        if 'nutritional_info' in data:
            validated_data['nutritional_info'] = validate_nutritional_info(data['nutritional_info'])
        
        return validated_data
        
    except Exception as e:
        if isinstance(e, ValidationError):
            raise
        raise ValidationError(f"Data validation failed: {str(e)}") 