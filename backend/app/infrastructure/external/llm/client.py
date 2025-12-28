from __future__ import annotations

from typing import Protocol

from .types import LLMChatRequest, LLMChatResponse


class LLMClient(Protocol):
    def generate(self, request: LLMChatRequest) -> LLMChatResponse:
        ...
