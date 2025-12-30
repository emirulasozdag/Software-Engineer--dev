"""Service for generating listening comprehension questions using LLM."""
from __future__ import annotations

import json
import logging
from typing import Any

from app.config.settings import get_settings
from app.domain.enums import LanguageLevel
from app.infrastructure.external.llm import LLMChatRequest, LLMMessage, get_llm_client


logger = logging.getLogger(__name__)


class ListeningQuestionGeneratorService:
    """Generates listening comprehension questions from audio transcripts using LLM."""
    
    def __init__(self):
        self.settings = get_settings()
        self.llm_client = get_llm_client(self.settings)
    
    def generate_questions(
        self,
        script: str,
        level: LanguageLevel,
        num_questions: int = 3,
    ) -> list[dict[str, Any]]:
        """Generate listening comprehension questions from an audio transcript.
        
        Args:
            script: The audio transcript/script
            level: The CEFR level of the audio
            num_questions: Number of questions to generate
            
        Returns:
            List of question dictionaries with structure:
            {
                "question": str,
                "options": list[str],  # 4 options
                "correct_answer": str,
            }
        """
        prompt = self._build_prompt(script, level, num_questions)
        
        try:
            provider = str(getattr(self.settings, "ai_provider", "mock") or "mock")
            logger.info(
                "Generating listening questions (level=%s, provider=%s, questions=%s)",
                level.value,
                provider,
                num_questions,
            )
            
            resp = self.llm_client.generate(
                LLMChatRequest(
                    messages=[
                        LLMMessage(role="system", content="You are a strict JSON generator for educational content."),
                        LLMMessage(role="user", content=prompt),
                    ],
                    model=getattr(self.settings, "google_genai_model", None),
                    temperature=float(getattr(self.settings, "google_genai_temperature", 0.2)),
                    max_output_tokens=int(getattr(self.settings, "google_genai_max_output_tokens", 1024)),
                )
            )
            
            raw_text = (resp.text or "").strip()
            
            if not raw_text:
                logger.warning("LLM returned empty text for listening questions")
                return self._fallback_questions(level)
            
            logger.info("LLM response length: %s chars", len(raw_text))
            
            # Try to extract JSON
            data = self._extract_json(raw_text)
            
            if not isinstance(data, dict) or "questions" not in data:
                logger.warning("LLM response was not valid JSON or missing 'questions' key")
                return self._fallback_questions(level)
            
            questions = data.get("questions", [])
            
            if not isinstance(questions, list):
                logger.warning("'questions' field is not a list")
                return self._fallback_questions(level)
            
            # Validate and clean questions
            validated_questions = []
            for q in questions:
                if not isinstance(q, dict):
                    continue
                
                question_text = q.get("question", "").strip()
                options = q.get("options", [])
                correct = q.get("correct_answer", "").strip()
                
                if not question_text or not options or not correct:
                    continue
                
                if not isinstance(options, list) or len(options) != 4:
                    continue
                
                # Ensure correct answer is one of the options
                if correct not in options:
                    continue
                
                validated_questions.append({
                    "question": question_text,
                    "options": options,
                    "correct_answer": correct,
                })
            
            if not validated_questions:
                logger.warning("No valid questions after validation")
                return self._fallback_questions(level)
            
            logger.info("Successfully generated %s listening questions", len(validated_questions))
            return validated_questions[:num_questions]  # Return at most num_questions
        
        except Exception as e:
            logger.error("Error generating listening questions: %s", str(e), exc_info=True)
            return self._fallback_questions(level)
    
    def _build_prompt(self, script: str, level: LanguageLevel, num_questions: int) -> str:
        """Build the prompt for LLM question generation."""
        return f"""You are an English language teacher creating listening comprehension questions.

Based on the following audio transcript, create {num_questions} multiple-choice questions at CEFR level {level.value}.

Audio Transcript:
{script}

Requirements:
- Generate exactly {num_questions} questions
- Each question must have exactly 4 options
- One option must be the correct answer
- Questions should test comprehension at {level.value} level
- Questions should be about main ideas, details, or inference from the audio
- Options should be plausible but only one should be correct

Return ONLY valid minified JSON (single line, no markdown formatting) with this exact structure:
{{
  "questions": [
    {{
      "question": "What is the main topic discussed?",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_answer": "option1"
    }}
  ]
}}

Do not include markdown code blocks, backticks, or any other formatting. Return only the raw JSON."""
    
    def _extract_json(self, text: str) -> dict[str, Any] | None:
        """Extract JSON object from LLM response text."""
        text = text.strip()
        
        # Remove markdown code blocks if present
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove first and last lines (markdown markers)
            if len(lines) > 2:
                text = "\n".join(lines[1:-1])
                # Remove json label if present
                if text.startswith("json"):
                    text = text[4:].strip()
        
        # Try to find JSON object
        start = text.find("{")
        end = text.rfind("}") + 1
        
        if start == -1 or end == 0:
            return None
        
        json_str = text[start:end]
        
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            return None
    
    def _fallback_questions(self, level: LanguageLevel) -> list[dict[str, Any]]:
        """Generate simple fallback questions when LLM fails."""
        return [
            {
                "question": f"What is the main topic of this audio? (Level: {level.value})",
                "options": [
                    "A conversation about daily life",
                    "A news report",
                    "A business meeting",
                    "A lecture"
                ],
                "correct_answer": "A conversation about daily life",
            },
            {
                "question": "Who is speaking in the audio?",
                "options": [
                    "Two or more people",
                    "One person",
                    "A robot",
                    "No one"
                ],
                "correct_answer": "Two or more people",
            },
            {
                "question": "What language is being spoken?",
                "options": [
                    "English",
                    "Spanish",
                    "French",
                    "German"
                ],
                "correct_answer": "English",
            },
        ]
