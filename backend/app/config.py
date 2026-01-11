"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys
    google_api_key: str
    tavily_api_key: str
    
    # Frontend URL (for PDF export)
    frontend_url: str = "http://localhost:3000"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    log_level: str = "INFO"
    
    # Storage
    data_dir: str = "./data/reports"
    
    # LLM Configuration
    gemini_model: str = "gemini-2.5-pro"
    research_temperature: float = 0.3
    writer_temperature: float = 0.4
    extraction_temperature: float = 0.1
    
    # Timeouts
    section_timeout_seconds: int = 90
    max_search_iterations: int = 3
    
    class Config:
        env_file = ".env"  # Look for .env in current working directory (project root)
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
