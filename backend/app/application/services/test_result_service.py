from __future__ import annotations

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.infrastructure.db.models.results import TestResultDB


class TestResultService:
    def __init__(self, db: Session):
        self.db = db

    def saveTestResult(self, result: TestResultDB) -> None:
        self.db.add(result)
        self.db.commit()

    def getTestResult(self, studentId: int, testId: int) -> TestResultDB | None:
        return self.db.scalar(
            select(TestResultDB)
            .where(
                TestResultDB.student_id == int(studentId),
                TestResultDB.test_id == int(testId),
            )
            .order_by(desc(TestResultDB.completed_at))
        )

    def getStudentResults(self, studentId: int) -> list[TestResultDB]:
        return list(
            self.db.scalars(select(TestResultDB).where(TestResultDB.student_id == int(studentId))).all()
        )

    def generateErrorAnalysis(self, resultId: int):
        # Placeholder for UC6 error analysis.
        return {"resultId": int(resultId), "analysis": "Not implemented"}
