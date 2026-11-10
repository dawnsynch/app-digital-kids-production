from functools import lru_cache
from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Digital Kids Assistant"
    app_env: str = "development"
    database_url: str = "sqlite:///./data/digital_kids_assistant.db"
    api_base_url: str = "http://localhost:8000"
    public_api_url: str = "http://localhost:8000"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"
    mock_ai_mode: bool = Field(
        default=False,
        validation_alias=AliasChoices("MOCK_AI_MODE", "USE_MOCK_AI"),
    )
    allowed_origins: str = Field(
        default=(
            "http://localhost:5173,http://127.0.0.1:5173,"
            "http://localhost:8501,http://127.0.0.1:8501"
        ),
        validation_alias=AliasChoices("ALLOWED_ORIGINS", "BACKEND_CORS_ORIGINS"),
    )
    jwt_secret_key: str | None = None
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    learner_session_expire_minutes: int = 30
    learner_handoff_expire_seconds: int = 180
    learner_pin_max_attempts: int = 5
    learner_pin_cooldown_seconds: int = 60
    tz: str = "Africa/Nairobi"
    max_questions_per_request: int = 10
    max_answer_length: int = 2000
    max_ai_requests_per_learner_per_hour: int = 50
    max_marking_requests_per_parent_per_hour: int = 50
    openai_timeout_seconds: int = 60
    openai_retry_count: int = 2

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("app_env")
    @classmethod
    def normalize_app_env(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"development", "staging", "production", "test"}:
            raise ValueError("APP_ENV must be one of: development, staging, production, test")
        return normalized

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret(cls, value: str | None, info):
        app_env = (info.data.get("app_env") or "development").lower()
        if app_env == "production" and not value:
            raise ValueError("JWT_SECRET_KEY is required in production")
        return value

    @model_validator(mode="after")
    def validate_production_requirements(self):
        if self.app_env == "production" and not self.mock_ai_mode and not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required when MOCK_AI_MODE is false in production")
        return self

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
