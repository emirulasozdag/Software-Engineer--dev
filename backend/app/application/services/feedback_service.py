from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.db.models.student_engagement import ContentAutoFeedbackDB


class FeedbackService:
    def __init__(self, db: Session):
        self.db = db

    def generateFeedbackForStudent(self, studentId: int) -> list[str]:
        """Legacy hook (test-based) - not used in this module."""
        return ["Feedback is generated after completing content."]

    def analyzeIncorrectAnswers(self, results: Any) -> list[str]:
        """Legacy hook - kept for UML parity."""
        return []

    def saveFeedback(self, studentId: int, feedbackList: list[str]) -> None:
        """Legacy hook (test feedback) - no-op here."""
        return None

    def generateContentFeedback(
        self,
        *,
        studentId: int,
        contentId: int,
        correctAnswerRate: float | None = None,
        mistakes: list[str] | None = None,
    ) -> list[str]:
        """UC12: Generate automatic feedback based on mistakes during content."""
        items: list[str] = []
        clean_mistakes = [m.strip() for m in (mistakes or []) if str(m).strip()]
        if clean_mistakes:
            for m in clean_mistakes[:10]:
                items.append(
                    f"Focus on: '{m}'. Review the rule/meaning, write 3 example sentences, and retry a similar exercise."
                )
        elif correctAnswerRate is not None:
            rate = float(correctAnswerRate)
            if rate < 0.5:
                items.append("You struggled on this lesson. Re-read the explanation and practice with simpler examples.")
            elif rate < 0.7:
                items.append("Good effort, but some gaps remain. Review your weak points and do a short recap exercise.")
            elif rate < 0.9:
                items.append("Nice work. To improve, challenge yourself with 5 extra practice questions on the same topic.")
            else:
                items.append("Excellent! You're ready to move to the next topic.")
        else:
            items.append("Lesson completed. If you had any mistakes, add them next time to get targeted feedback.")

        return items

    def saveContentFeedback(self, *, studentId: int, contentId: int, feedbackList: list[str]) -> int:
        row = ContentAutoFeedbackDB(
            student_id=int(studentId),
            content_id=int(contentId),
            feedback_list_json=json.dumps(feedbackList),
            generated_at=datetime.utcnow(),
        )
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return int(row.id)

    def getLatestContentFeedback(self, *, studentId: int) -> ContentAutoFeedbackDB | None:
        return self.db.scalar(
            select(ContentAutoFeedbackDB)
            .where(ContentAutoFeedbackDB.student_id == int(studentId))
            .order_by(ContentAutoFeedbackDB.generated_at.desc())
            .limit(1)
        )

    def getContentFeedback(self, *, studentId: int, contentId: int, limit: int = 10) -> list[ContentAutoFeedbackDB]:
        return list(
            self.db.scalars(
                select(ContentAutoFeedbackDB)
                .where(ContentAutoFeedbackDB.student_id == int(studentId))
                .where(ContentAutoFeedbackDB.content_id == int(contentId))
                .order_by(ContentAutoFeedbackDB.generated_at.desc())
                .limit(max(1, min(int(limit), 50)))
            ).all()
        )
