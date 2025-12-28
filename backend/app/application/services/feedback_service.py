from __future__ import annotations

class FeedbackService:
    def __init__(self, db, notification_service=None):
        self.db = db
        self.notification_service = notification_service

    def generateFeedbackForStudent(self, studentId: int) -> tuple[list[str], int]:
        """Generate feedback for the student's latest test result.

        Returns: (feedback_list, test_result_id)
        """
        from sqlalchemy import select
        from app.infrastructure.db.models.results import TestResultDB

        latest = self.db.scalar(
            select(TestResultDB)
            .where(TestResultDB.student_id == int(studentId))
            .order_by(TestResultDB.completed_at.desc())
        )
        if not latest:
            raise ValueError("No test result found for student")
        feedback = self.analyzeIncorrectAnswers(latest)
        return feedback, int(latest.id)

    def analyzeIncorrectAnswers(self, result) -> list[str]:
        import json

        feedback: list[str] = []
        weak_modules: list[str] = []
        try:
            payload = json.loads(result.weaknesses_json) if result.weaknesses_json else {}
            weak_modules = list((payload or {}).get("weaknesses") or [])
        except Exception:
            weak_modules = []

        if not weak_modules:
            # Fallback: generic feedback if no structured weaknesses.
            return [
                "Good job! Review your incorrect answers and try again.",
                "Focus on one skill area at a time and practice daily.",
            ]

        for m in weak_modules:
            m = str(m).lower()
            if m == "reading":
                feedback.append("Reading: Practice skimming/scanning and learn key vocabulary.")
            elif m == "writing":
                feedback.append("Writing: Review connectors and verb tenses; write short paragraphs daily.")
            elif m == "listening":
                feedback.append("Listening: Listen to short clips and repeat; focus on keywords first.")
            elif m == "speaking":
                feedback.append("Speaking: Practice pronunciation slowly, then increase speed; record yourself.")
            else:
                feedback.append(f"{m.title()}: Practice this skill daily with focused exercises.")
        return feedback

    def saveFeedback(self, studentId: int, testResultId: int, feedbackList: list[str]) -> int:
        import json
        from datetime import datetime
        from app.infrastructure.db.models.feedback import FeedbackDB

        row = FeedbackDB(
            student_id=int(studentId),
            test_result_id=int(testResultId),
            feedback_list_json=json.dumps(list(feedbackList)),
            generated_at=datetime.utcnow(),
        )
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return int(row.id)
