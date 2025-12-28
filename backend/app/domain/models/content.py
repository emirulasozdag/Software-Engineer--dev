from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

from app.domain.enums import ContentType, LanguageLevel
from app.domain.models.tests import Question


@dataclass
class Exercise:
    exerciseId: int
    type: str
    instructions: str
    questions: list[Question]
    maxScore: int

    def start(self) -> None:
        pass

    def submit(self) -> None:
        pass

    def getScore(self) -> int:
        pass


@dataclass
class Topic:
    topicId: int
    name: str
    category: str
    difficulty: LanguageLevel
    priority: int

    def getExercises(self) -> list[Exercise]:
        pass


@dataclass
class LessonPlan:
    planId: int
    studentId: int
    topics: list[Topic]
    recommendedLevel: LanguageLevel
    createdAt: datetime
    updatedAt: datetime
    isGeneral: bool

    def getTopicList(self) -> list[Topic]:
        pass

    def updatePlan(self, topics: list[Topic]) -> None:
        pass


@dataclass
class Content:
    contentId: int
    title: str
    body: str
    contentType: ContentType
    level: LanguageLevel
    createdBy: int
    createdAt: datetime
    isDraft: bool

    def display(self) -> None:
        pass

    def edit(self, newBody: str) -> None:
        pass

    def publish(self) -> None:
        pass
