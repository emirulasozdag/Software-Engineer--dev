from datetime import datetime
from typing import List
from .enums import AssignmentStatus

class Assignment:
    def __init__(self):
        self.assignmentId: int = 0
        self.teacherId: int = 0
        self.title: str = ""
        self.description: str = ""
        self.dueDate: datetime = datetime.now()
        self.assignmentType: str = ""

    def create(self):
        # Not implemented
        pass

    def assignToStudents(self, ids: List[int]):
        # Not implemented
        pass

    def updateDueDate(self, newDate: datetime):
        # Not implemented
        pass

class StudentAssignment:
    def __init__(self):
        self.studentAssignmentId: int = 0
        self.assignmentId: int = 0
        self.studentId: int = 0
        self.status: AssignmentStatus = AssignmentStatus.PENDING
        self.submittedAt: datetime = datetime.now()
        self.score: int = 0

    def submit(self):
        # Not implemented
        pass

    def grade(self, score: int):
        # Not implemented
        pass

class Feedback:
    def __init__(self):
        self.feedbackId: int = 0
        self.studentId: int = 0
        self.testResultId: int = 0
        self.feedbackList: List[str] = []
        self.generatedAt: datetime = datetime.now()

    def displayFeedback(self):
        # Not implemented
        pass
