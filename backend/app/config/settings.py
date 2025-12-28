from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
	model_config = SettingsConfigDict(
		env_file=".env",
		env_file_encoding="utf-8",
		extra="ignore",
	)

	app_name: str = Field(default="adaptive-learning-backend")
	version: str = Field(default="0.1.0")
	environment: str = Field(default="development")
	debug: bool = Field(default=False)

	api_prefix: str = Field(default="/api")
	cors_origins: list[str] = Field(default_factory=list)

	# SQLite database (relative to backend/)
	database_url: str = Field(default="sqlite:///./app.db")

	# Security (dev defaults; override with .env in real deployment)
	secret_key: str = Field(default="dev-secret-change-me")
	access_token_exp_minutes: int = Field(default=60 * 24)  # 1 day
	action_token_exp_minutes: int = Field(default=30)  # verify/reset tokens

@lru_cache
def get_settings() -> Settings:
	return Settings()