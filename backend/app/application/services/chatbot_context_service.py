"""Service for building comprehensive user context for chatbot LLM prompts.

This service aggregates student data to provide the chatbot with full context:
- Per-module CEFR levels (Reading, Writing, Listening, Speaking)
- Current learning plan with completion percentage
- Latest placement test results
- Strengths and weaknesses
- AI content completion count and feedbacks
- Student name and general info
"""

from __future__ import annotations

import json
from typing import Any

from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session

from app.domain.enums import LanguageLevel
from app.infrastructure.db.models.content import LessonPlanDB
from app.infrastructure.db.models.feedback import FeedbackDB
from app.infrastructure.db.models.progress import ProgressDB
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.student_ai_content import StudentAIContentDB
from app.infrastructure.db.models.user import StudentDB, UserDB


class ChatbotContextService:
    """Builds context for chatbot LLM prompts based on student data."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def build_student_context(self, student_id: int) -> dict[str, Any]:
        """Build comprehensive context for a student.

        Args:
            student_id: The student.id (not user_id)

        Returns:
            Dictionary containing all relevant student context for the chatbot
        """
        # Get student and user info
        student = self.db.get(StudentDB, student_id)
        if not student:
            return {"error": "Student not found"}

        user = self.db.get(UserDB, student.user_id)
        if not user:
            return {"error": "User not found"}

        context = {
            "student_name": user.name,
            "student_id": student_id,
            "enrollment_date": student.enrollment_date.isoformat() if student.enrollment_date else None,
            "overall_level": student.level.value if student.level else "Not assessed",
            "daily_streak": student.daily_streak,
            "total_points": student.total_points,
        }

        # Get per-module CEFR levels from latest test result
        module_levels = self._get_module_levels(student_id)
        context["module_levels"] = module_levels

        # Get learning plan
        plan_info = self._get_learning_plan(student_id)
        context["learning_plan"] = plan_info

        # Get latest placement test results
        test_results = self._get_latest_test_results(student_id)
        context["latest_test_results"] = test_results

        # Get strengths and weaknesses
        sw = self._get_strengths_weaknesses(student_id)
        context["strengths"] = sw["strengths"]
        context["weaknesses"] = sw["weaknesses"]

        # Get AI content stats
        content_stats = self._get_ai_content_stats(student_id)
        context["ai_content_stats"] = content_stats

        # Get recent feedbacks
        feedbacks = self._get_recent_feedbacks(student_id)
        context["recent_feedbacks"] = feedbacks

        return context

    def _get_module_levels(self, student_id: int) -> dict[str, str]:
        """Get per-module CEFR levels from latest test result."""
        latest = self.db.scalar(
            select(TestResultDB)
            .where(TestResultDB.student_id == student_id)
            .order_by(TestResultDB.completed_at.desc())
        )

        if not latest:
            return {
                "reading": "Not assessed",
                "writing": "Not assessed",
                "listening": "Not assessed",
                "speaking": "Not assessed",
            }

        return {
            "reading": latest.reading_level.value if latest.reading_level else "Not assessed",
            "writing": latest.writing_level.value if latest.writing_level else "Not assessed",
            "listening": latest.listening_level.value if latest.listening_level else "Not assessed",
            "speaking": latest.speaking_level.value if latest.speaking_level else "Not assessed",
        }

    def _get_learning_plan(self, student_id: int) -> dict[str, Any]:
        """Get current learning plan with completion info."""
        plan = self.db.scalar(
            select(LessonPlanDB)
            .where(LessonPlanDB.student_id == student_id)
            .order_by(LessonPlanDB.created_at.desc())
        )

        if not plan:
            return {
                "exists": False,
                "message": "No learning plan generated yet",
            }

        topics = []
        if plan.topics_json:
            try:
                topics = json.loads(plan.topics_json) or []
            except Exception:
                topics = []

        # Calculate completion percentage based on completed AI content
        # (This is simplified; could be more sophisticated)
        total_topics = len(topics)
        completed = self.db.scalar(
            select(func.count(StudentAIContentDB.id))
            .where(
                and_(
                    StudentAIContentDB.student_id == student_id,
                    StudentAIContentDB.completed_at.isnot(None),
                )
            )
        ) or 0

        # Estimate: assume 3 content items per topic
        expected_total = total_topics * 3
        completion_pct = (completed / expected_total * 100) if expected_total > 0 else 0

        return {
            "exists": True,
            "recommended_level": plan.recommended_level.value if plan.recommended_level else None,
            "is_general": plan.is_general,
            "topics": topics,
            "topic_count": total_topics,
            "completion_percentage": round(completion_pct, 1),
            "created_at": plan.created_at.isoformat() if plan.created_at else None,
            "updated_at": plan.updated_at.isoformat() if plan.updated_at else None,
        }

    def _get_latest_test_results(self, student_id: int, limit: int = 3) -> list[dict[str, Any]]:
        """Get latest placement test results."""
        results = list(
            self.db.scalars(
                select(TestResultDB)
                .where(TestResultDB.student_id == student_id)
                .order_by(TestResultDB.completed_at.desc())
                .limit(limit)
            ).all()
        )

        return [
            {
                "test_id": r.test_id,
                "score": r.score,
                "level": r.level.value if r.level else None,
                "completed_at": r.completed_at.isoformat() if r.completed_at else None,
            }
            for r in results
        ]

    def _get_strengths_weaknesses(self, student_id: int) -> dict[str, list[str]]:
        """Extract strengths and weaknesses from latest test result."""
        latest = self.db.scalar(
            select(TestResultDB)
            .where(TestResultDB.student_id == student_id)
            .order_by(TestResultDB.completed_at.desc())
        )

        if not latest:
            return {"strengths": [], "weaknesses": []}

        strengths = []
        weaknesses = []

        if latest.strengths_json:
            try:
                strength_data = json.loads(latest.strengths_json) or []
                # Can be list[str] or list[dict]; normalize
                for item in strength_data:
                    if isinstance(item, str):
                        strengths.append(item)
                    elif isinstance(item, dict):
                        # Extract readable label
                        label = (
                            item.get("skill", "")
                            or item.get("tag", "")
                            or item.get("area", "")
                            or str(item)
                        )
                        note = item.get("note", "")
                        score = item.get("score", "")
                        parts = [p for p in [label, note, f"(Score: {score})" if score else ""] if p]
                        strengths.append(" - ".join(parts))
            except Exception:
                pass

        if latest.weaknesses_json:
            try:
                weakness_data = json.loads(latest.weaknesses_json) or []
                for item in weakness_data:
                    if isinstance(item, str):
                        weaknesses.append(item)
                    elif isinstance(item, dict):
                        label = (
                            item.get("skill", "")
                            or item.get("tag", "")
                            or item.get("area", "")
                            or str(item)
                        )
                        note = item.get("note", "")
                        score = item.get("score", "")
                        parts = [p for p in [label, note, f"(Score: {score})" if score else ""] if p]
                        weaknesses.append(" - ".join(parts))
            except Exception:
                pass

        return {"strengths": strengths, "weaknesses": weaknesses}

    def _get_ai_content_stats(self, student_id: int) -> dict[str, Any]:
        """Get AI content completion stats and recent feedbacks."""
        total = self.db.scalar(
            select(func.count(StudentAIContentDB.id)).where(StudentAIContentDB.student_id == student_id)
        ) or 0

        completed = self.db.scalar(
            select(func.count(StudentAIContentDB.id)).where(
                and_(
                    StudentAIContentDB.student_id == student_id,
                    StudentAIContentDB.completed_at.isnot(None),
                )
            )
        ) or 0

        active = self.db.scalar(
            select(func.count(StudentAIContentDB.id)).where(
                and_(
                    StudentAIContentDB.student_id == student_id,
                    StudentAIContentDB.is_active == True,
                    StudentAIContentDB.completed_at.is_(None),
                )
            )
        ) or 0

        # Get recent feedbacks from completed content
        recent_with_feedback = list(
            self.db.scalars(
                select(StudentAIContentDB)
                .where(
                    and_(
                        StudentAIContentDB.student_id == student_id,
                        StudentAIContentDB.feedback_json.isnot(None),
                    )
                )
                .order_by(StudentAIContentDB.completed_at.desc())
                .limit(5)
            ).all()
        )

        feedbacks = []
        for item in recent_with_feedback:
            if item.feedback_json:
                try:
                    fb_data = json.loads(item.feedback_json)
                    feedbacks.append(
                        {
                            "content_id": item.content_id,
                            "completed_at": item.completed_at.isoformat() if item.completed_at else None,
                            "feedback": fb_data,
                        }
                    )
                except Exception:
                    pass

        return {
            "total_assigned": total,
            "completed": completed,
            "active": active,
            "recent_feedbacks": feedbacks,
        }

    def _get_recent_feedbacks(self, student_id: int, limit: int = 5) -> list[dict[str, Any]]:
        """Get recent automatic feedbacks from test results."""
        feedbacks = list(
            self.db.scalars(
                select(FeedbackDB)
                .where(FeedbackDB.student_id == student_id)
                .order_by(FeedbackDB.generated_at.desc())
                .limit(limit)
            ).all()
        )

        result = []
        for fb in feedbacks:
            if fb.feedback_list_json:
                try:
                    fb_list = json.loads(fb.feedback_list_json) or []
                    result.append(
                        {
                            "test_result_id": fb.test_result_id,
                            "generated_at": fb.generated_at.isoformat() if fb.generated_at else None,
                            "feedback_items": fb_list,
                        }
                    )
                except Exception:
                    pass

        return result

    def format_context_for_prompt(self, context: dict[str, Any]) -> str:
        """Format the context dictionary into a readable prompt section.

        This creates a structured text representation of the student's context
        that can be included in the system prompt for the LLM.
        """
        if "error" in context:
            return f"Error: {context['error']}"

        lines = [
            "# Student Context",
            f"Name: {context.get('student_name', 'Unknown')}",
            f"Overall Level: {context.get('overall_level', 'Not assessed')}",
            f"Daily Streak: {context.get('daily_streak', 0)} days",
            f"Total Points: {context.get('total_points', 0)}",
            "",
            "## Module Levels (Latest Test Results)",
        ]

        module_levels = context.get("module_levels", {})
        for module, level in module_levels.items():
            lines.append(f"- {module.capitalize()}: {level}")

        lines.append("")
        lines.append("## Learning Plan")
        plan = context.get("learning_plan", {})
        if plan.get("exists"):
            lines.append(f"- Recommended Level: {plan.get('recommended_level', 'N/A')}")
            lines.append(f"- Type: {'General (no test results yet)' if plan.get('is_general') else 'Personalized'}")
            lines.append(f"- Topics: {plan.get('topic_count', 0)}")
            lines.append(f"- Completion: {plan.get('completion_percentage', 0)}%")
            
            topics = plan.get("topics", [])
            if topics:
                lines.append("")
                lines.append("### Current Topics:")
                for topic in topics[:5]:  # Show first 5 topics
                    name = topic.get("name", "Unknown")
                    difficulty = topic.get("difficulty", "")
                    priority = topic.get("priority", 0)
                    reason = topic.get("reason", "")
                    lines.append(f"- [{priority}] {name} ({difficulty}): {reason}")
        else:
            lines.append("- No learning plan generated yet")

        lines.append("")
        lines.append("## Strengths")
        strengths = context.get("strengths", [])
        if strengths:
            for s in strengths[:5]:
                lines.append(f"- {s}")
        else:
            lines.append("- Not assessed yet")

        lines.append("")
        lines.append("## Weaknesses")
        weaknesses = context.get("weaknesses", [])
        if weaknesses:
            for w in weaknesses[:5]:
                lines.append(f"- {w}")
        else:
            lines.append("- Not assessed yet")

        lines.append("")
        lines.append("## AI Content Progress")
        stats = context.get("ai_content_stats", {})
        lines.append(f"- Total Assigned: {stats.get('total_assigned', 0)}")
        lines.append(f"- Completed: {stats.get('completed', 0)}")
        lines.append(f"- Active: {stats.get('active', 0)}")

        recent_fb = stats.get("recent_feedbacks", [])
        if recent_fb:
            lines.append("")
            lines.append("### Recent AI Content Feedbacks:")
            for fb in recent_fb[:3]:
                lines.append(f"- Content {fb.get('content_id')}: {fb.get('feedback')}")

        lines.append("")
        lines.append("## Recent Test Feedbacks")
        test_feedbacks = context.get("recent_feedbacks", [])
        if test_feedbacks:
            for fb in test_feedbacks[:3]:
                items = fb.get("feedback_items", [])
                if items:
                    lines.append(f"- {items[:2]}")  # Show first 2 items
        else:
            lines.append("- No test feedbacks yet")

        return "\n".join(lines)
