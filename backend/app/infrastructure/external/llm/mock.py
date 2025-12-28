from __future__ import annotations

from .types import LLMChatRequest, LLMChatResponse


class MockLLMClient:
    """Deterministic placeholder LLM client.

    Useful for dev environments where no external API keys are configured.
    """

    def generate(self, request: LLMChatRequest) -> LLMChatResponse:
        user_parts = [m.content for m in request.messages if m.role == "user"]
        prompt = "\n\n".join(user_parts).strip()
        text = (
            "[MOCK_LLM]\n"
            "This is a mock LLM response. Configure AI_PROVIDER=google and GOOGLE_API_KEY to use Gemini.\n\n"
            f"Prompt:\n{prompt}"
        )
        return LLMChatResponse(text=text, raw=None)
