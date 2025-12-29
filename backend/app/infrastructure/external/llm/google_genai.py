from __future__ import annotations

from typing import Any

from .types import LLMChatRequest, LLMChatResponse


class GoogleGenAIClient:
    def __init__(
        self,
        *,
        api_key: str,
        default_model: str = "gemini-2.0-flash",
        default_temperature: float = 0.2,
        default_max_output_tokens: int = 512,
    ) -> None:
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is required for AI_PROVIDER=google")

        # Import lazily so environments without google-genai can still boot with mock provider.
        from google import genai  # type: ignore

        self._genai = genai
        self._client = genai.Client(api_key=api_key)
        self._default_model = default_model
        self._default_temperature = default_temperature
        self._default_max_output_tokens = default_max_output_tokens

    def generate(self, request: LLMChatRequest) -> LLMChatResponse:
        model = request.model or self._default_model
        temperature = request.temperature if request.temperature is not None else self._default_temperature
        max_output_tokens = (
            request.max_output_tokens if request.max_output_tokens is not None else self._default_max_output_tokens
        )

        system_text = "\n\n".join(m.content for m in request.messages if m.role == "system").strip()
        dialogue_text = "\n\n".join(
            f"{m.role.upper()}: {m.content}" for m in request.messages if m.role != "system"
        ).strip()
        prompt = dialogue_text if not system_text else f"SYSTEM: {system_text}\n\n{dialogue_text}"

        print("GoogleGenAIClient.generate prompt:", prompt)

        response: Any

        # Prefer typed config if available, but keep a fallback that still passes settings.
        try:
            from google.genai import types as genai_types  # type: ignore

            config = genai_types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
                response_mime_type="application/json",
            )
            response = self._client.models.generate_content(model=model, contents=prompt, config=config)
        except Exception:
            # Some versions accept a plain dict for config.
            response = self._client.models.generate_content(
                model=model,
                contents=prompt,
                config={
                    "temperature": temperature,
                    "max_output_tokens": max_output_tokens,
                    "response_mime_type": "application/json",
                },
            )

        text = _extract_text(response)
        print("GoogleGenAIClient.generate response text:", text)
        return LLMChatResponse(text=text, raw=response)


def _extract_text(response: Any) -> str:
    # google-genai response typically exposes `.text`.
    text = getattr(response, "text", None)
    if isinstance(text, str) and text.strip():
        return text.strip()

    # Best-effort fallback for alternate response shapes.
    candidates = getattr(response, "candidates", None)
    if isinstance(candidates, list) and candidates:
        cand0 = candidates[0]
        content = getattr(cand0, "content", None)
        parts = getattr(content, "parts", None)
        if isinstance(parts, list) and parts:
            part0 = parts[0]
            t = getattr(part0, "text", None)
            if isinstance(t, str) and t.strip():
                return t.strip()

    return ""
