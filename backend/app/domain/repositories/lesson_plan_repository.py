from __future__ import annotations

from typing import Any


class LessonPlanRepository:
    def savePersonalPlan(self, studentId: int, plan: Any) -> int:
        pass

    def saveGeneralPlan(self, studentId: int, generalPlan: Any) -> int:
        pass

    def findByStudentId(self, studentId: int) -> Any:
        pass

    def update(self, plan: Any) -> None:
        pass
