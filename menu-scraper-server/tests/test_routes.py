import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "services" in data
        assert "version" in data
    
    def test_readiness_check(self):
        """Test readiness check endpoint."""
        response = client.get("/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "message" in data
    
    def test_liveness_check(self):
        """Test liveness check endpoint."""
        response = client.get("/health/live")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"


class TestRootEndpoints:
    """Test root endpoints."""
    
    def test_root(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Menu Scraper Server"
        assert data["version"] == "1.0.0"
    
    def test_info(self):
        """Test info endpoint."""
        response = client.get("/info")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Menu Scraper Server"
        assert "supported_formats" in data


class TestMenuEndpoints:
    """Test menu-related endpoints."""
    
    def test_supported_formats(self):
        """Test supported formats endpoint."""
        response = client.get("/v1/menu/supported-formats")
        assert response.status_code == 200
        data = response.json()
        assert "supported_formats" in data
        assert "max_file_size_mb" in data
    
    def test_validate_menu_data_valid(self):
        """Test menu validation with valid data."""
        valid_data = [
            {
                "item_name": "Test Item",
                "price": 10.99,
                "description": "Test description"
            }
        ]
        
        response = client.post("/v1/menu/validate", json=valid_data)
        assert response.status_code == 200
        data = response.json()
        assert data["valid_entries"] == 1
        assert data["total_entries"] == 1
        assert len(data["errors"]) == 0
    
    def test_validate_menu_data_invalid(self):
        """Test menu validation with invalid data."""
        invalid_data = [
            {
                "item_name": "",  # Invalid: empty name
                "price": "invalid_price"  # Invalid: not a number
            }
        ]
        
        response = client.post("/v1/menu/validate", json=invalid_data)
        assert response.status_code == 200
        data = response.json()
        assert data["valid_entries"] == 0
        assert data["total_entries"] == 1
        assert len(data["errors"]) > 0


class TestOpenAPI:
    """Test OpenAPI documentation."""
    
    def test_openapi_schema(self):
        """Test OpenAPI schema endpoint."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data
    
    def test_docs_endpoint(self):
        """Test docs endpoint (development only)."""
        response = client.get("/docs")
        # In development, this should return 200
        # In production, this might return 404
        assert response.status_code in [200, 404] 