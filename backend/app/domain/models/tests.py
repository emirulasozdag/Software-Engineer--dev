from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class Question:
    questionId: int
    text: str
    options: list[str]
    correctAnswer: str
    points: int

    def validateAnswer(self, answer: str) -> bool:
        pass


@dataclass
class TestModule:
    moduleId: int
    moduleType: str
    questions: list[Question]
    score: int

    def loadQuestions(self) -> None:
        pass

    def submitModule(self) -> None:
        pass


@dataclass
class Test(ABC):
    testId: int
    title: str
    description: str
    duration: int
    maxScore: int
    createdAt: datetime

    def start(self) -> None:
        pass

    def submit(self) -> None:
        pass

    @abstractmethod
    def calculateScore(self) -> int:
        raise NotImplementedError


@dataclass
class PlacementTest(Test):
    readingModule: TestModule
    writingModule: TestModule
    listeningModule: TestModule
    speakingModule: TestModule

    def evaluateLevel(self) -> Any:
        pass

    def calculateScore(self) -> int:
        pass


@dataclass
class SpeakingTest(Test):
    sampleSentence: str
    audioFile: str
    pronunciationCriteria: list[str]

    def displaySample(self) -> None:
        pass

    def recordAudio(self) -> None:
        pass

    def analyzeAccuracy(self) -> float:
        pass

    def calculateScore(self) -> int:
        pass


@dataclass
class ListeningTest(Test):
    audioFiles: list[str]
    questions: list[Question]

    def playAudio(self) -> None:
        pass

    def submitAnswers(self) -> None:
        pass

    def calculateScore(self) -> int:
        pass


@dataclass
class ReadingTest(Test):
    passages: list[str]
    questions: list[Question]

    def displayPassage(self) -> None:
        pass

    def submitAnswers(self) -> None:
        pass

    def calculateScore(self) -> int:
        pass


@dataclass
class WritingTest(Test):
    topic: str
    minWords: int
    maxWords: int

    def submitText(self, text: str) -> None:
        pass

    def evaluateWriting(self) -> int:
        pass

    def calculateScore(self) -> int:
        pass
