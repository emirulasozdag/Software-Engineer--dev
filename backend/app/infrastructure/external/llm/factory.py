from __future__ import annotations

from typing import Any

from .client import LLMClient
from .google_genai import GoogleGenAIClient
from .mock import MockLLMClient


def get_llm_client(settings: Any) -> LLMClient:
    """Create an LLM client based on application settings.

    Expected settings fields (pydantic Settings):
    - ai_provider: str
    - google_api_key: str | None
    - google_genai_model: str
    - google_genai_temperature: float
    - google_genai_max_output_tokens: int
    """

    provider = str(getattr(settings, "ai_provider", "mock") or "mock").strip().lower()

    if provider in {"google", "google-genai", "gemini"}:
        api_key = getattr(settings, "google_api_key", None)
        model = getattr(settings, "google_genai_model", "gemini-2.0-flash")
        temperature = getattr(settings, "google_genai_temperature", 0.2)
        max_tokens = getattr(settings, "google_genai_max_output_tokens", 512)
        return GoogleGenAIClient(
            api_key=str(api_key or ""),
            default_model=str(model),
            default_temperature=float(temperature),
            default_max_output_tokens=int(max_tokens),
        )

    return MockLLMClient()
