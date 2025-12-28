from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from app.domain.enums import AssignmentStatus


@dataclass
class Assignment:
    assignmentId: int
    teacherId: int
    title: str
    description: str
    dueDate: datetime
    assignmentType: str
    createdAt: datetime

    def assign(self, studentIds: list[int]) -> None:
        pass

    def updateDueDate(self, newDate: datetime) -> None:
        pass


@dataclass
class StudentAssignment:
    studentAssignmentId: int
    assignmentId: int
    studentId: int
    status: AssignmentStatus
    submittedAt: datetime
    score: int

    def submit(self) -> None:
        pass

    def grade(self, score: int) -> None:
        pass
