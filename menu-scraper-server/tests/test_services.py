import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.services.ocr_service import OCRService
from app.services.llm_service import LLMService
from app.services.core_api_service import CoreAPIService
from app.models.errors import OCRProcessingError, LLMProcessingError, CoreAPIError
from app.models.purchase_entry import PurchaseEntry


class TestOCRService:
    """Test OCR service functionality."""
    
    @pytest.fixture
    def ocr_service(self):
        return OCRService()
    
    @pytest.mark.asyncio
    async def test_extract_text_async_success(self, ocr_service):
        """Test successful text extraction."""
        with patch('app.services.ocr_service.file_processor') as mock_processor:
            mock_processor.extract_text.return_value = "Sample extracted text"
            
            result = await ocr_service.extract_text_async("/test/path", ".png")
            
            assert result == "Sample extracted text"
            mock_processor.extract_text.assert_called_once_with("/test/path", ".png")
    
    @pytest.mark.asyncio
    async def test_extract_text_async_no_text(self, ocr_service):
        """Test text extraction with no text."""
        with patch('app.services.ocr_service.file_processor') as mock_processor:
            mock_processor.extract_text.return_value = ""
            
            with pytest.raises(OCRProcessingError, match="No text extracted from file"):
                await ocr_service.extract_text_async("/test/path", ".png")
    
    @pytest.mark.asyncio
    async def test_extract_text_with_retry_success(self, ocr_service):
        """Test text extraction with retry logic."""
        with patch('app.services.ocr_service.file_processor') as mock_processor:
            mock_processor.extract_text.return_value = "Sample text"
            
            result = await ocr_service.extract_text_with_retry("/test/path", ".png")
            
            assert result == "Sample text"
            mock_processor.extract_text.assert_called_once()
    
    def test_get_supported_formats(self, ocr_service):
        """Test getting supported formats."""
        with patch('app.services.ocr_service.file_processor') as mock_processor:
            mock_processor.supported_formats = {'.png', '.jpg', '.pdf'}
            
            formats = ocr_service.get_supported_formats()
            
            assert formats == ['.png', '.jpg', '.pdf']
    
    def test_validate_file_format(self, ocr_service):
        """Test file format validation."""
        with patch('app.services.ocr_service.file_processor') as mock_processor:
            mock_processor.supported_formats = {'.png', '.jpg', '.pdf'}
            
            assert ocr_service.validate_file_format('.png') is True
            assert ocr_service.validate_file_format('.txt') is False


class TestLLMService:
    """Test LLM service functionality."""
    
    @pytest.fixture
    def llm_service(self):
        return LLMService()
    
    @pytest.mark.asyncio
    async def test_process_text_to_purchase_entries_success(self, llm_service):
        """Test successful LLM processing."""
        sample_text = "Sample menu text"
        expected_entries = [
            PurchaseEntry(item_name="Test Item", price=10.99)
        ]
        
        with patch.object(llm_service, '_call_openai_api') as mock_api:
            mock_api.return_value = '[{"item_name": "Test Item", "price": 10.99}]'
            
            with patch.object(llm_service, '_parse_llm_response') as mock_parse:
                mock_parse.return_value = expected_entries
                
                result = await llm_service.process_text_to_purchase_entries(sample_text)
                
                assert result == expected_entries
                mock_api.assert_called_once()
                mock_parse.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_text_to_purchase_entries_api_failure(self, llm_service):
        """Test LLM processing with API failure."""
        with patch.object(llm_service, '_call_openai_api') as mock_api:
            mock_api.side_effect = Exception("API Error")
            
            with pytest.raises(LLMProcessingError, match="LLM processing failed"):
                await llm_service.process_text_to_purchase_entries("Sample text")
    
    def test_build_prompt(self, llm_service):
        """Test prompt building."""
        text = "Sample text"
        meta_prompt = "Custom instructions"
        
        prompt = llm_service._build_prompt(text, meta_prompt)
        
        assert text in prompt
        assert meta_prompt in prompt
        assert "menu parsing assistant" in prompt
    
    def test_clean_llm_response(self, llm_service):
        """Test LLM response cleaning."""
        # Test with markdown code blocks
        response = "```json\n{\"test\": true}\n```"
        cleaned = llm_service._clean_llm_response(response)
        assert cleaned == '{"test": true}'
        
        # Test without markdown
        response = '{"test": true}'
        cleaned = llm_service._clean_llm_response(response)
        assert cleaned == '{"test": true}'


class TestCoreAPIService:
    """Test Core API service functionality."""
    
    @pytest.fixture
    def core_api_service(self):
        return CoreAPIService()
    
    @pytest.mark.asyncio
    async def test_send_purchase_entries_success(self, core_api_service):
        """Test successful API call."""
        entries = [PurchaseEntry(item_name="Test Item", price=10.99)]
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"success": True}
            
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
            
            result = await core_api_service.send_purchase_entries(entries)
            
            assert result == {"success": True}
    
    @pytest.mark.asyncio
    async def test_send_purchase_entries_http_error(self, core_api_service):
        """Test API call with HTTP error."""
        entries = [PurchaseEntry(item_name="Test Item", price=10.99)]
        
        with patch('httpx.AsyncClient') as mock_client:
            from httpx import HTTPStatusError, Response
            
            mock_response = Mock(spec=Response)
            mock_response.status_code = 400
            mock_response.text = "Bad Request"
            
            mock_client.return_value.__aenter__.return_value.post.side_effect = HTTPStatusError(
                "Bad Request", request=Mock(), response=mock_response
            )
            
            with pytest.raises(CoreAPIError, match="Core API HTTP error: 400"):
                await core_api_service.send_purchase_entries(entries)
    
    @pytest.mark.asyncio
    async def test_health_check_success(self, core_api_service):
        """Test successful health check."""
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 200
            
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            result = await core_api_service.health_check()
            
            assert result is True
    
    @pytest.mark.asyncio
    async def test_health_check_failure(self, core_api_service):
        """Test failed health check."""
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.status_code = 500
            
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            result = await core_api_service.health_check()
            
            assert result is False
    
    def test_prepare_payload(self, core_api_service):
        """Test payload preparation."""
        entries = [PurchaseEntry(item_name="Test Item", price=10.99)]
        metadata = {"source": "test"}
        
        payload = core_api_service._prepare_payload(entries, metadata)
        
        assert "purchase_entries" in payload
        assert "timestamp" in payload
        assert "source" in payload
        assert payload["source"] == "menu_scraper_server"
        assert payload["metadata"] == metadata


class TestServiceIntegration:
    """Test service integration scenarios."""
    
    @pytest.mark.asyncio
    async def test_full_pipeline_success(self):
        """Test full processing pipeline success."""
        # This would test the integration between all services
        # Implementation would depend on the specific integration requirements
        pass
    
    @pytest.mark.asyncio
    async def test_pipeline_with_ocr_failure(self):
        """Test pipeline behavior when OCR fails."""
        # This would test error handling in the pipeline
        pass 