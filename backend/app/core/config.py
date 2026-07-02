from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "ApartmentERP API"
    environment: str = "development"
    debug: bool = True
    database_url: str = "sqlite:///./apartment.db"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    jwt_secret_key: str = "dev-secret-change-in-production-use-openssl-rand"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    max_login_attempts: int = 5
    login_lockout_minutes: int = 15

    demo_password: str = "Demo@1234"

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, str):
            return value.lower() in {"1", "true", "yes", "on"}
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


settings = Settings()
