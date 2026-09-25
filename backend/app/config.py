from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HealthMitra 2.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "super_secret_key_change_in_production"
    ENCRYPTION_KEY: str = "super_secret_32_byte_aes_key_pad" # Must be 32 bytes for AES-256
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    
    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "healthmitra_v2"
    
    # Third-party APIs
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
