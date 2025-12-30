"""Audio file manager for listening comprehension tests.

Handles loading, parsing, and random selection of audio files with their transcripts.
"""
from __future__ import annotations

import json
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from app.domain.enums import LanguageLevel


CEFRLevel = Literal["A1", "A2", "B1", "B2", "C1", "C2"]


@dataclass
class AudioFile:
    """Represents an audio file with its metadata."""
    
    filename: str  # e.g., "1345.mp3"
    level: LanguageLevel
    script: str
    audio_path: str  # Full path to audio file
    json_path: str  # Full path to JSON file


class AudioFileManager:
    """Manages audio files for listening comprehension tests."""
    
    def __init__(self, audio_dir: Path | None = None):
        """Initialize audio manager.
        
        Args:
            audio_dir: Directory containing audio files. If None, uses default location.
        """
        if audio_dir is None:
            # Default: backend/app/static/audio/
            audio_dir = Path(__file__).resolve().parents[2] / "static" / "audio"
        
        self.audio_dir = audio_dir
        self._audio_files: list[AudioFile] | None = None
    
    def _load_audio_files(self) -> list[AudioFile]:
        """Load all audio files from the audio directory."""
        if self._audio_files is not None:
            return self._audio_files
        
        audio_files = []
        
        if not self.audio_dir.exists():
            return audio_files
        
        # Find all JSON files
        for json_path in self.audio_dir.glob("*.json"):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                level_str = data.get("level", "").upper()
                script = data.get("script", "")
                
                if not level_str or not script:
                    continue
                
                # Convert string level to LanguageLevel enum
                try:
                    level = LanguageLevel[level_str]
                except (KeyError, ValueError):
                    continue
                
                # Check if corresponding audio file exists
                audio_filename = json_path.stem  # Remove .json extension
                mp3_path = json_path.parent / f"{audio_filename}.mp3"
                
                if not mp3_path.exists():
                    continue
                
                audio_files.append(AudioFile(
                    filename=f"{audio_filename}.mp3",
                    level=level,
                    script=script,
                    audio_path=str(mp3_path),
                    json_path=str(json_path),
                ))
            
            except (json.JSONDecodeError, OSError):
                # Skip files that can't be parsed
                continue
        
        self._audio_files = audio_files
        return audio_files
    
    def get_by_level(self, level: LanguageLevel) -> list[AudioFile]:
        """Get all audio files for a specific CEFR level.
        
        Args:
            level: The CEFR level to filter by
            
        Returns:
            List of audio files matching the level
        """
        audio_files = self._load_audio_files()
        return [af for af in audio_files if af.level == level]
    
    def get_random_by_level(self, level: LanguageLevel, count: int = 1) -> list[AudioFile]:
        """Get random audio files for a specific CEFR level.
        
        Args:
            level: The CEFR level to filter by
            count: Number of random files to return
            
        Returns:
            List of randomly selected audio files (may be fewer than count if not enough available)
        """
        available = self.get_by_level(level)
        
        if not available:
            return []
        
        # Return up to 'count' random files
        sample_size = min(count, len(available))
        return random.sample(available, sample_size)
    
    def get_random_for_placement_test(self) -> dict[LanguageLevel, AudioFile]:
        """Get one random audio file for each level (A1, A2, B1, B2) for placement test.
        
        Returns:
            Dict mapping each level to a randomly selected audio file
        """
        levels = [LanguageLevel.A1, LanguageLevel.A2, LanguageLevel.B1, LanguageLevel.B2]
        result = {}
        
        for level in levels:
            audio_list = self.get_random_by_level(level, count=1)
            if audio_list:
                result[level] = audio_list[0]
        
        return result
    
    def get_audio_url(self, filename: str) -> str:
        """Get the URL path for serving an audio file.
        
        Args:
            filename: Name of the audio file (e.g., "1345.mp3")
            
        Returns:
            URL path relative to static files (e.g., "/static/audio/1345.mp3")
        """
        return f"/static/audio/{filename}"
