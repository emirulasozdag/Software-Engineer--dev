from datetime import datetime
from typing import List
from .enums import ContentType, LanguageLevel
from .assessment import Question

class Content:
    def __init__(self):
        self.contentId: int = 0
        self.title: str = ""
        self.body: str = ""
        self.contentType: ContentType = ContentType.LESSON
        self.level: LanguageLevel = LanguageLevel.A1
        self.createdBy: int = 0
        self.createdAt: datetime = datetime.now()
        self.isDraft: bool = True

    def display(self):
        # Not implemented
        pass

    def edit(self, newBody: str):
        # Not implemented
        pass

    def publish(self):
        # Not implemented
        pass

class Topic:
    def __init__(self):
        self.topicId: int = 0
        self.name: str = ""
        self.category: str = ""
        self.difficulty: LanguageLevel = LanguageLevel.A1
        self.priority: int = 0

class LessonPlan:
    def __init__(self):
        self.planId: int = 0
        self.studentId: int = 0
        self.topics: List[Topic] = []
        self.recommendedLevel: LanguageLevel = LanguageLevel.A1
        self.createdAt: datetime = datetime.now()
        self.updatedAt: datetime = datetime.now()

    def isGeneral(self) -> bool:
        # Not implemented
        return False

    def getTopics(self) -> List[Topic]:
        # Not implemented
        return []

    def updatePlan(self, topics: List[Topic]):
        # Not implemented
        pass

class Exercise:
    def __init__(self):
        self.exerciseId: int = 0
        self.type: str = ""
        self.instructions: str = ""
        self.questions: List[Question] = []
        self.maxScore: int = 0

    def start(self):
        # Not implemented
        pass

    def submit(self):
        # Not implemented
        pass

    def getScore(self) -> int:
        # Not implemented
        return 0
