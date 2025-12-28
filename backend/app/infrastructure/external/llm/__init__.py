"""LLM provider abstraction.

This package provides a small interface + factory so application code can call an LLM
without depending on a specific vendor SDK.
"""

from .client import LLMClient
from .factory import get_llm_client
from .types import LLMChatRequest, LLMChatResponse, LLMMessage

__all__ = [
    "LLMClient",
    "LLMChatRequest",
    "LLMChatResponse",
    "LLMMessage",
    "get_llm_client",
]
