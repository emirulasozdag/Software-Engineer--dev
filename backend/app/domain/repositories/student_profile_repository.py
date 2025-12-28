from __future__ import annotations

from typing import Any


class StudentProfileRepository:
    def save(self, student: Any) -> int:
        pass

    def findById(self, studentId: int) -> Any:
        pass

    def getStudentLevel(self, studentId: int) -> Any:
        pass

    def updateLevel(self, studentId: int, level: Any) -> None:
        pass
