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
	# Default dev CORS origins (Vite React defaults to :3000). Override via .env if needed.
	cors_origins: list[str] = Field(
		default_factory=lambda: [
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://localhost:5173",
			"http://127.0.0.1:5173",
		]
	)

	# SQLite database (relative to backend/)
	database_url: str = Field(default="sqlite:///./app.db")

	# Security (dev defaults; override with .env in real deployment)
	secret_key: str = Field(default="dev-secret-change-me")
	access_token_exp_minutes: int = Field(default=60 * 24)  # 1 day
	action_token_exp_minutes: int = Field(default=30)  # verify/reset tokens

	# LLM provider configuration
	ai_provider: str = Field(default="mock")
	google_api_key: str | None = Field(default=None)
	google_genai_model: str = Field(default="gemini-2.5-flash")
	google_genai_temperature: float = Field(default=0.1)
	google_genai_max_output_tokens: int = Field(default=14000)

@lru_cache
def get_settings() -> Settings:
	return Settings()