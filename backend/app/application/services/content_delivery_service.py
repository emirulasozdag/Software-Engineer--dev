from __future__ import annotations

from typing import Any


class ContentDeliveryService:
    def prepareContentForStudent(self, studentId: int) -> Any:
        pass

    def getStudentLevel(self, studentId: int) -> Any:
        pass

    def assignContentToStudent(self, studentId: int, contentId: int) -> None:
        pass
