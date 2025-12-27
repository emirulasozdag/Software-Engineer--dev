from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GeneratedContent:
    title: str
    body: str
    rationale: str


class AIProvider:
    def generate_content(
        self,
        *,
        content_type: str,
        skill: str,
        level: str,
        topic: str | None,
        teacher_directive: str | None,
    ) -> GeneratedContent:
        raise NotImplementedError

    def chat(self, *, message: str, level: str | None = None, topic: str | None = None) -> str:
        raise NotImplementedError


class MockAIProvider(AIProvider):
    def generate_content(
        self,
        *,
        content_type: str,
        skill: str,
        level: str,
        topic: str | None,
        teacher_directive: str | None,
    ) -> GeneratedContent:
        safe_topic = topic or "daily life"
        directive = f"Teacher directive: {teacher_directive}\n\n" if teacher_directive else ""

        title = f"{content_type.title()} ({skill}, {level})"

        if content_type == "lesson":
            body = (
                f"{directive}Topic: {safe_topic}\n\n"
                f"1) Mini explanation ({level}):\n"
                f"- Key points for {skill} practice in simple steps.\n\n"
                "2) Examples:\n"
                "- Example 1\n- Example 2\n\n"
                "3) Quick check:\n"
                "- Q1: ...\n- Q2: ...\n"
            )
        elif content_type == "exercise":
            body = (
                f"{directive}Exercise topic: {safe_topic}\n\n"
                "Task:\n"
                "- Do the following 5 items.\n\n"
                "Items:\n"
                "1) ...\n2) ...\n3) ...\n4) ...\n5) ...\n\n"
                "Answer key (hidden in real AI):\n"
                "- (mock)"
            )
        else:  # roleplay
            body = (
                f"{directive}Roleplay scenario ({level}): {safe_topic}\n\n"
                "Roles:\n- Student\n- Partner\n\n"
                "Goal:\n- Practice speaking with 6 turns.\n\n"
                "Prompts:\n"
                "1) Student: ...\n2) Partner: ...\n"
            )

        rationale = (
            f"Selected because your target level is {level} and the focus skill is {skill}. "
            "Content is kept short to encourage steady progress."
        )

        return GeneratedContent(title=title, body=body, rationale=rationale)

    def chat(self, *, message: str, level: str | None = None, topic: str | None = None) -> str:
        prefix = f"[{level}] " if level else ""
        hint = f" (topic: {topic})" if topic else ""
        return f"{prefix}I understand. You said: '{message}'. Let's practice step-by-step{hint}." 
