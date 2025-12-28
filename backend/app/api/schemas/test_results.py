from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class PlacementTestResult(BaseModel):
	id: str
	studentId: str
	overallLevel: str
	readingLevel: str
	writingLevel: str
	listeningLevel: str
	speakingLevel: str
	completedAt: datetime
