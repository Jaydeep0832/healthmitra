from typing import Literal

from cryptography.fernet import Fernet
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    PROJECT_NAME: str = "HealthMitra 2.0"
    API_V1_STR: str = "/api/v1"

    # Environment mode — controls docs, CORS strictness, debug output
    ENVIRONMENT: Literal["development", "production"] = Field(
        default="development",
    )

    # Secrets are mandatory: deployments must provide their own unique values.
    SECRET_KEY: str = Field(
        min_length=32,
    )
    ENCRYPTION_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=15,
    )
    ALGORITHM: str = Field(default="HS256")
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017",
    )
    MONGODB_DB_NAME: str = Field(default="healthmitra")

    # Third-party APIs
    GROQ_API_KEY: str = ""

    # ASHA Worker registration passcode
    ASHA_REGISTRATION_PASSCODE: str = "ASHA2026"

    # Interactive API docs — auto-disabled in production unless overridden
    DOCS_ENABLED: bool | None = None

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def show_docs(self) -> bool:
        """Docs are enabled in development, disabled in production (unless forced)."""
        if self.DOCS_ENABLED is not None:
            return self.DOCS_ENABLED
        return not self.is_production

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        if value.startswith("REPLACE_"):
            raise ValueError("SECRET_KEY must be replaced with a unique random value")
        return value

    @field_validator("ENCRYPTION_KEY")
    @classmethod
    def validate_encryption_key(cls, value: str) -> str:
        try:
            Fernet(value.encode("ascii"))
        except (ValueError, UnicodeEncodeError) as exc:
            raise ValueError(
                "ENCRYPTION_KEY must be a valid Fernet key generated with Fernet.generate_key()"
            ) from exc
        return value


settings = Settings()
