from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal


LLMRole = Literal["system", "user", "assistant"]


@dataclass(frozen=True)
class LLMMessage:
    role: LLMRole
    content: str


@dataclass(frozen=True)
class LLMChatRequest:
    messages: list[LLMMessage]
    model: str | None = None
    temperature: float | None = None
    max_output_tokens: int | None = None


@dataclass(frozen=True)
class LLMChatResponse:
    text: str
    raw: Any | None = None
