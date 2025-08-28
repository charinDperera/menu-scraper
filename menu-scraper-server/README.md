# Menu Scraper Server

A FastAPI microservice for processing menu images and PDFs through OCR and LLM to extract structured purchase entry data.

## Features

- **File Upload**: Accepts PDF and image files (PNG, JPG, JPEG, TIFF, BMP)
- **OCR Processing**: Text extraction using Tesseract OCR
- **LLM Integration**: OpenAI API integration for structured data extraction
- **Core API Integration**: Sends processed data to external Core API
- **Async Processing**: Built with async/await for scalability
- **Comprehensive Error Handling**: Custom exceptions with proper HTTP status codes
- **Logging & Monitoring**: Request/response logging and health checks
- **OpenAPI Documentation**: Auto-generated API documentation
- **Container Ready**: Dockerfile and requirements included

## Project Structure

```
app/
├── main.py                 # FastAPI application entry point
├── api/                    # API layer
│   ├── v1/                # API version 1
│   │   ├── routes_menu.py # Menu processing endpoints
│   │   └── routes_health.py # Health check endpoints
│   └── deps.py            # Dependency injection
├── core/                   # Core configuration
│   ├── config.py          # Settings and configuration
│   └── logging.py         # Logging setup
├── services/               # Business logic services
│   ├── ocr_service.py     # OCR processing service
│   ├── llm_service.py     # LLM integration service
│   └── core_api_service.py # Core API integration
├── models/                 # Data models
│   ├── purchase_entry.py  # Pydantic models
│   └── errors.py          # Custom exceptions
├── utils/                  # Utility functions
│   ├── file_utils.py      # File processing utilities
│   └── validation.py      # Data validation utilities
└── tests/                  # Test suite
    ├── test_routes.py     # API endpoint tests
    └── test_services.py   # Service layer tests
```

## Quick Start

### Prerequisites

- Python 3.9+
- Tesseract OCR installed on your system
- OpenAI API key
- Core API credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd menu-scraper-server
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your actual API keys and configuration
```

5. Run the server:
```bash
uvicorn app.main:app --reload
```

The server will be available at `http://localhost:8000`

### Docker

```bash
# Build the image
docker build -t menu-scraper-server .

# Run the container
docker run -p 8000:8000 --env-file .env menu-scraper-server
```

## API Endpoints

### Health Checks
- `GET /health` - Overall health status
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Menu Processing
- `POST /v1/menu/upload` - Upload and process menu file
- `GET /v1/menu/supported-formats` - Get supported file formats
- `POST /v1/menu/validate` - Validate menu data without processing

### Documentation
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)

## Configuration

Environment variables (see `env.example`):

```bash
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Core API Configuration
CORE_API_BASE_URL=https://api.core.example.com
CORE_API_KEY=your_core_api_key_here

# OCR Configuration
OCR_ENGINE=tesseract
TESSERACT_CMD=/usr/bin/tesseract

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

## Usage Example

### Upload Menu File

```bash
curl -X POST "http://localhost:8000/v1/menu/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@menu.png" \
  -F "meta_prompt=Extract all food items with prices"
```

### Response Format

```json
{
  "success": true,
  "message": "Successfully processed 5 menu items",
  "items": [
    {
      "item_name": "Margherita Pizza",
      "price": 18.99,
      "description": "Fresh mozzarella, tomato sauce, basil",
      "category": "Pizza",
      "allergens": ["dairy", "gluten"],
      "nutritional_info": {
        "calories": 1200,
        "protein": "45g"
      }
    }
  ],
  "errors": [],
  "processing_time": 2.345,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Testing

Run the test suite:

```bash
# Install test dependencies
pip install -r requirements.txt

# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## Development

### Code Style

- Follow PEP 8 guidelines
- Use type hints throughout
- Maintain clean architecture principles
- Write comprehensive docstrings

### Adding New Features

1. Create models in `app/models/`
2. Implement business logic in `app/services/`
3. Add API endpoints in `app/api/v1/`
4. Write tests in `tests/`
5. Update documentation

## Deployment

### Production Considerations

- Set `DEBUG=false` in production
- Configure proper CORS origins
- Use environment-specific configuration
- Set up proper logging and monitoring
- Configure health check endpoints for load balancers

### Scaling

- The service is designed to be stateless
- Can be deployed behind a load balancer
- Consider using Redis for caching if needed
- Monitor OCR and LLM API rate limits

## Troubleshooting

### Common Issues

1. **Tesseract not found**: Install Tesseract OCR on your system
2. **OpenAI API errors**: Verify your API key and rate limits
3. **File upload failures**: Check file size and format restrictions
4. **Core API connection**: Verify network connectivity and credentials

### Logs

Check application logs for detailed error information. The service logs all requests, responses, and errors with structured logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

[Add your license information here]

## Support

For support and questions, please [create an issue](link-to-issues) or contact the development team. 