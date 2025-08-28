import asyncio
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings
from app.core.logging import get_logger
from app.models.errors import CoreAPIError
from app.models.purchase_entry import PurchaseEntry

logger = get_logger(__name__)


class CoreAPIService:
    """Service for Core API integration."""
    
    def __init__(self):
        self.base_url = settings.core_api_base_url.rstrip('/')
        self.api_key = settings.core_api_key
        self.logger = logger
        self.timeout = httpx.Timeout(30.0)
    
    async def send_purchase_entries(
        self, 
        purchase_entries: List[PurchaseEntry],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Send purchase entries to Core API."""
        try:
            self.logger.info(f"Sending {len(purchase_entries)} purchase entries to Core API")
            
            # Prepare payload
            payload = self._prepare_payload(purchase_entries, metadata)
            
            # Make API call
            response = await self._make_api_call(payload)
            
            self.logger.info("Successfully sent purchase entries to Core API")
            return response
            
        except Exception as e:
            self.logger.error(f"Failed to send purchase entries to Core API: {e}")
            if isinstance(e, CoreAPIError):
                raise
            raise CoreAPIError(f"Core API call failed: {str(e)}")
    
    def _prepare_payload(self, purchase_entries: List[PurchaseEntry], metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Prepare payload for Core API."""
        payload = {
            "purchase_entries": [entry.model_dump() for entry in purchase_entries],
            "timestamp": asyncio.get_event_loop().time(),
            "source": "menu_scraper_server"
        }
        
        if metadata:
            payload["metadata"] = metadata
        
        return payload
    
    async def _make_api_call(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Make HTTP call to Core API."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "MenuScraperServer/1.0"
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/v1/purchase-entries",
                    json=payload,
                    headers=headers
                )
                
                response.raise_for_status()
                
                return response.json()
                
            except httpx.HTTPStatusError as e:
                self.logger.error(f"Core API HTTP error: {e.response.status_code} - {e.response.text}")
                raise CoreAPIError(f"Core API HTTP error: {e.response.status_code}")
            except httpx.RequestError as e:
                self.logger.error(f"Core API request error: {e}")
                raise CoreAPIError(f"Core API request error: {str(e)}")
            except Exception as e:
                self.logger.error(f"Unexpected error in Core API call: {e}")
                raise CoreAPIError(f"Unexpected error in Core API call: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check Core API health."""
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
                response = await client.get(
                    f"{self.base_url}/health",
                    headers={"User-Agent": "MenuScraperServer/1.0"}
                )
                
                if response.status_code == 200:
                    return True
                else:
                    self.logger.warning(f"Core API health check failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            self.logger.error(f"Core API health check error: {e}")
            return False
    
    async def send_with_retry(
        self, 
        purchase_entries: List[PurchaseEntry],
        metadata: Optional[Dict[str, Any]] = None,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """Send purchase entries with retry logic."""
        last_error = None
        
        for attempt in range(max_retries):
            try:
                return await self.send_purchase_entries(purchase_entries, metadata)
            except Exception as e:
                last_error = e
                self.logger.warning(f"Core API attempt {attempt + 1} failed: {e}")
                
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 * (attempt + 1))  # Exponential backoff
        
        # All retries failed
        raise CoreAPIError(f"Core API call failed after {max_retries} attempts. Last error: {str(last_error)}")


# Global Core API service instance
core_api_service = CoreAPIService() 