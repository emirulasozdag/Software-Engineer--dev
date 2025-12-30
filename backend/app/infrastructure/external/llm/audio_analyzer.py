"""Audio analysis using Google Gemini API for speaking assessment."""
from __future__ import annotations

import json
import logging
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any


logger = logging.getLogger(__name__)


@dataclass
class SpeakingAnalysis:
    """Result of speaking audio analysis."""
    transcript: str
    pronunciation_score: float  # 0-100
    fluency_score: float  # 0-100
    grammar_score: float  # 0-100
    vocabulary_score: float  # 0-100
    overall_score: float  # 0-100
    cefr_level: str  # A1, A2, B1, B2, C1, C2
    strength_tags: list[str]
    weakness_tags: list[str]


@dataclass
class SpeakingFeedback:
    """Detailed feedback for AI content delivery."""
    transcript: str
    pronunciation_feedback: str
    fluency_feedback: str
    grammar_feedback: str
    vocabulary_feedback: str
    overall_feedback: str
    pronunciation_score: float  # 0-100
    fluency_score: float  # 0-100
    grammar_score: float  # 0-100
    vocabulary_score: float  # 0-100
    overall_score: float  # 0-100


class AudioAnalyzer:
    """Analyze audio files using Google Gemini API."""
    
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is required for audio analysis")
        self._api_key = api_key
    
    def analyze_for_placement(self, audio_bytes: bytes, content_type: str | None = None, question: str | None = None) -> SpeakingAnalysis:
        """
        Analyze speaking audio for placement test.
        Returns CEFR level and scores for pronunciation, fluency, grammar, vocabulary.
        """
        print(f"[PLACEMENT] Starting audio analysis. Audio size: {len(audio_bytes)} bytes, Content-Type: {content_type}, Question: {question}")
        
        try:
            from google import genai
            from google.genai import types
        except ImportError as e:
            raise RuntimeError("google-genai package not installed") from e
        
        client = genai.Client(api_key=self._api_key)
        
        # Upload audio to Gemini
        print("[PLACEMENT] Uploading audio to Gemini...")
        file_uri = self._upload_audio(client, audio_bytes, content_type)
        print(f"[PLACEMENT] Audio uploaded successfully. File URI: {file_uri}")
        
        question_text = f"\n\nQuestion asked: {question}" if question else ""
        
        prompt = f"""
        Analyze this English speaking sample and provide a comprehensive assessment.{question_text}
        
        Focus on:
        1. Pronunciation clarity and accuracy
        2. Fluency and natural flow of speech
        3. Grammatical correctness
        4. Vocabulary range and appropriateness
        
        Provide scores (0-100) for each category and an overall CEFR level (A1, A2, B1, B2, C1, C2).
        Also provide strength_tags (2-3 short tags for what the speaker does well) and weakness_tags (2-3 short tags for areas to improve).
        Use short tags suitable for learning topics (e.g., 'pronunciation: clarity', 'fluency: natural pace', 'grammar: verb tenses', 'vocabulary: range').
        """
        
        print("[PLACEMENT] Sending request to Gemini API...")
        print(f"[PLACEMENT] Prompt: {prompt[:200]}...")
        
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Content(
                        parts=[
                            types.Part(file_data=types.FileData(file_uri=file_uri)),
                            types.Part(text=prompt)
                        ]
                    )
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "transcript": types.Schema(type=types.Type.STRING),
                            "pronunciation_score": types.Schema(type=types.Type.NUMBER),
                            "fluency_score": types.Schema(type=types.Type.NUMBER),
                            "grammar_score": types.Schema(type=types.Type.NUMBER),
                            "vocabulary_score": types.Schema(type=types.Type.NUMBER),
                            "overall_score": types.Schema(type=types.Type.NUMBER),
                            "cefr_level": types.Schema(
                                type=types.Type.STRING,
                                enum=["A1", "A2", "B1", "B2", "C1", "C2"]
                            ),
                            "strength_tags": types.Schema(
                                type=types.Type.ARRAY,
                                items=types.Schema(type=types.Type.STRING)
                            ),
                            "weakness_tags": types.Schema(
                                type=types.Type.ARRAY,
                                items=types.Schema(type=types.Type.STRING)
                            ),
                        },
                        required=[
                            "transcript", "pronunciation_score", "fluency_score",
                            "grammar_score", "vocabulary_score", "overall_score",
                            "cefr_level", "strength_tags", "weakness_tags"
                        ],
                    ),
                ),
            )
            
            print("[PLACEMENT] Received response from Gemini API")
            print(f"[PLACEMENT] Response type: {type(response)}")
            print(f"[PLACEMENT] Response attributes: {dir(response)}")
            
            # Log raw response text
            try:
                raw_text = response.text
                print(f"[PLACEMENT] Raw response text: {raw_text}")
            except Exception as e:
                print(f"[PLACEMENT] Failed to get response.text: {e}")
                print(f"[PLACEMENT] Full response object: {response}")
            
            result = json.loads(response.text)
            print(f"[PLACEMENT] Parsed JSON result: {json.dumps(result, indent=2)}")
            
            return SpeakingAnalysis(
                transcript=result.get("transcript", ""),
                pronunciation_score=float(result.get("pronunciation_score", 0)),
                fluency_score=float(result.get("fluency_score", 0)),
                grammar_score=float(result.get("grammar_score", 0)),
                vocabulary_score=float(result.get("vocabulary_score", 0)),
                overall_score=float(result.get("overall_score", 0)),
                cefr_level=result.get("cefr_level", "A1"),
                strength_tags=result.get("strength_tags", []),
                weakness_tags=result.get("weakness_tags", []),
            )
        except Exception as e:
            print(f"[PLACEMENT] Failed to analyze audio with Gemini: {str(e)}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Failed to analyze audio with Gemini: {str(e)}") from e
    
    def analyze_for_feedback(self, audio_bytes: bytes, content_type: str | None = None, question: str | None = None) -> SpeakingFeedback:
        """
        Analyze speaking audio for AI content delivery.
        Returns detailed feedback for each category.
        """
        print(f"[FEEDBACK] Starting audio analysis. Audio size: {len(audio_bytes)} bytes, Content-Type: {content_type}, Question: {question}")
        
        try:
            from google import genai
            from google.genai import types
        except ImportError as e:
            raise RuntimeError("google-genai package not installed") from e
        
        client = genai.Client(api_key=self._api_key)
        
        # Upload audio to Gemini
        print("[FEEDBACK] Uploading audio to Gemini...")
        file_uri = self._upload_audio(client, audio_bytes, content_type)
        print(f"[FEEDBACK] Audio uploaded successfully. File URI: {file_uri}")
        
        question_text = f"\n\nQuestion asked: {question}" if question else ""
        
        prompt = f"""
        Analyze this English speaking sample and provide detailed constructive feedback.{question_text}
        
        For each category, provide:
        1. Pronunciation: clarity, accuracy, and areas to improve
        2. Fluency: natural flow, pace, pauses, and smoothness
        3. Grammar: correctness, complexity, and common errors
        4. Vocabulary: range, appropriateness, and suggestions
        5. Overall: summary and key recommendations
        
        Provide scores (0-100) for each category and detailed feedback for improvement.
        """
        
        print("[FEEDBACK] Sending request to Gemini API...")
        print(f"[FEEDBACK] Prompt: {prompt[:200]}...")
        
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Content(
                        parts=[
                            types.Part(file_data=types.FileData(file_uri=file_uri)),
                            types.Part(text=prompt)
                        ]
                    )
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "transcript": types.Schema(type=types.Type.STRING),
                            "pronunciation_feedback": types.Schema(type=types.Type.STRING),
                            "fluency_feedback": types.Schema(type=types.Type.STRING),
                            "grammar_feedback": types.Schema(type=types.Type.STRING),
                            "vocabulary_feedback": types.Schema(type=types.Type.STRING),
                            "overall_feedback": types.Schema(type=types.Type.STRING),
                            "pronunciation_score": types.Schema(type=types.Type.NUMBER),
                            "fluency_score": types.Schema(type=types.Type.NUMBER),
                            "grammar_score": types.Schema(type=types.Type.NUMBER),
                            "vocabulary_score": types.Schema(type=types.Type.NUMBER),
                            "overall_score": types.Schema(type=types.Type.NUMBER),
                        },
                        required=[
                            "transcript", "pronunciation_feedback", "fluency_feedback",
                            "grammar_feedback", "vocabulary_feedback", "overall_feedback",
                            "pronunciation_score", "fluency_score", "grammar_score",
                            "vocabulary_score", "overall_score"
                        ],
                    ),
                ),
            )
            
            print("[FEEDBACK] Received response from Gemini API")
            print(f"[FEEDBACK] Response type: {type(response)}")
            
            # Log raw response text
            try:
                raw_text = response.text
                print(f"[FEEDBACK] Raw response text: {raw_text}")
            except Exception as e:
                logger.error(f"[FEEDBACK] Failed to get response.text: {e}")
                print(f"[FEEDBACK] Full response object: {response}")
            
            result = json.loads(response.text)
            print(f"[FEEDBACK] Parsed JSON result: {json.dumps(result, indent=2)}")
            
            return SpeakingFeedback(
                transcript=result.get("transcript", ""),
                pronunciation_feedback=result.get("pronunciation_feedback", ""),
                fluency_feedback=result.get("fluency_feedback", ""),
                grammar_feedback=result.get("grammar_feedback", ""),
                vocabulary_feedback=result.get("vocabulary_feedback", ""),
                overall_feedback=result.get("overall_feedback", ""),
                pronunciation_score=float(result.get("pronunciation_score", 0)),
                fluency_score=float(result.get("fluency_score", 0)),
                grammar_score=float(result.get("grammar_score", 0)),
                vocabulary_score=float(result.get("vocabulary_score", 0)),
                overall_score=float(result.get("overall_score", 0)),
            )
        except Exception as e:
            logger.error(f"[FEEDBACK] Failed to analyze audio with Gemini: {str(e)}", exc_info=True)
            raise RuntimeError(f"Failed to analyze audio with Gemini: {str(e)}") from e
    
    def _upload_audio(self, client: Any, audio_bytes: bytes, content_type: str | None) -> str:
        """Upload audio bytes to Gemini and return file URI."""
        # Convert to MP3 format - Gemini API works better with MP3
        # First save original audio
        ext = self._get_extension(content_type)
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp_in:
            tmp_in.write(audio_bytes)
            tmp_in.flush()
            tmp_in_path = tmp_in.name
        
        print(f"[UPLOAD] Original file created: {tmp_in_path}, size: {len(audio_bytes)} bytes, format: {ext}")
        
        # Convert to MP3 using pydub
        try:
            from pydub import AudioSegment
            print(f"[UPLOAD] Converting to MP3 format...")
            audio = AudioSegment.from_file(tmp_in_path)
            
            # Export as MP3
            tmp_out_path = tmp_in_path.replace(ext, '.mp3')
            audio.export(tmp_out_path, format='mp3', bitrate='128k')
            print(f"[UPLOAD] Converted to MP3: {tmp_out_path}")
            
            # Clean up original file
            Path(tmp_in_path).unlink(missing_ok=True)
            tmp_path = tmp_out_path
        except ImportError:
            print(f"[UPLOAD] pydub not available, using original format {ext}")
            tmp_path = tmp_in_path
        except Exception as e:
            print(f"[UPLOAD] Failed to convert to MP3: {e}, using original format")
            tmp_path = tmp_in_path
        
        print(f"[UPLOAD] Final file for upload: {tmp_path}")
        
        try:
            # Upload to Gemini using the correct API
            from google.genai import types
            print(f"[UPLOAD] Uploading file to Gemini...")
            uploaded_file = client.files.upload(file=tmp_path)
            print(f"[UPLOAD] File uploaded. Name: {uploaded_file.name}, URI: {uploaded_file.uri}")
            
            # Wait for the file to be processed and become ACTIVE
            # Files need to be in ACTIVE state before they can be used
            max_wait = 60  # Maximum 60 seconds
            wait_interval = 5  # Check every 5 seconds
            elapsed = 0
            
            print(f"[UPLOAD] Waiting for file to become ACTIVE...")
            while elapsed < max_wait:
                file_info = client.files.get(name=uploaded_file.name)
                print(f"[UPLOAD] File state: {file_info.state.name} (elapsed: {elapsed}s)")
                
                if file_info.state.name == 'ACTIVE':
                    print(f"[UPLOAD] File is ACTIVE and ready to use")
                    return uploaded_file.uri
                elif file_info.state.name == 'FAILED':
                    logger.error(f"[UPLOAD] File processing failed: {file_info.state}")
                    raise RuntimeError(f"File processing failed: {file_info.state}")
                
                time.sleep(wait_interval)
                elapsed += wait_interval
            
            logger.error(f"[UPLOAD] File did not become ACTIVE within {max_wait} seconds")
            raise RuntimeError(f"File did not become ACTIVE within {max_wait} seconds")
        finally:
            # Clean up temp file
            Path(tmp_path).unlink(missing_ok=True)
            print(f"[UPLOAD] Temp file cleaned up: {tmp_path}")
    
    def _get_extension(self, content_type: str | None) -> str:
        """Get file extension from content type."""
        if not content_type:
            return ".webm"
        
        type_map = {
            "audio/webm": ".webm",
            "audio/mp4": ".mp4",
            "audio/mpeg": ".mp3",
            "audio/wav": ".wav",
            "audio/ogg": ".ogg",
        }
        return type_map.get(content_type.lower(), ".webm")
