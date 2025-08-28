from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    debug: bool = Field(default=False, env="DEBUG")
    
    # OpenAI Configuration
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4", env="OPENAI_MODEL")
    
    # Core API Configuration
    core_api_base_url: str = Field(..., env="CORE_API_BASE_URL")
    core_api_key: str = Field(..., env="CORE_API_KEY")
    
    # OCR Configuration
    ocr_engine: str = Field(default="tesseract", env="OCR_ENGINE")
    tesseract_cmd: str = Field(default="/usr/bin/tesseract", env="TESSERACT_CMD")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings() 