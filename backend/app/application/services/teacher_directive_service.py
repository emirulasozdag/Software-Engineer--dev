"""Service for managing teacher directives for AI content generation (FR35).

Teachers can create directives that customize how AI generates content for specific students.
These directives are persisted and included in all LLM prompts for the targeted student.
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.db.models.teacher_directive import TeacherDirectiveDB
from app.infrastructure.db.models.user import StudentDB, UserDB


class TeacherDirectiveService:
    """Manages teacher directives for AI content generation."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_directive(
        self,
        *,
        teacher_user_id: int,
        student_user_id: int,
        content_type: str | None,
        focus_areas: list[str],
        instructions: str,
    ) -> TeacherDirectiveDB:
        """Create a new teacher directive for a student.
        
        Args:
            teacher_user_id: The user ID of the teacher creating the directive
            student_user_id: The user ID of the student this directive applies to
            content_type: Optional content type focus (e.g., 'lesson', 'exercise')
            focus_areas: List of areas to focus on
            instructions: Free-form instructions for the AI engine
            
        Returns:
            The created directive
        """
        directive = TeacherDirectiveDB(
            teacher_user_id=teacher_user_id,
            student_user_id=student_user_id,
            content_type=content_type,
            focus_areas_json=json.dumps(focus_areas) if focus_areas else None,
            instructions=instructions,
            is_active=True,
        )
        self.db.add(directive)
        self.db.commit()
        self.db.refresh(directive)
        return directive

    def get_active_directives_for_student(self, student_user_id: int) -> list[TeacherDirectiveDB]:
        """Get all active directives for a student.
        
        Args:
            student_user_id: The user ID of the student
            
        Returns:
            List of active directives ordered by creation date (newest first)
        """
        return list(
            self.db.scalars(
                select(TeacherDirectiveDB)
                .where(
                    TeacherDirectiveDB.student_user_id == student_user_id,
                    TeacherDirectiveDB.is_active == True,  # noqa: E712
                )
                .order_by(TeacherDirectiveDB.created_at.desc())
            ).all()
        )

    def get_directives_by_teacher(
        self,
        teacher_user_id: int,
        student_user_id: int | None = None,
    ) -> list[TeacherDirectiveDB]:
        """Get directives created by a teacher, optionally filtered by student.
        
        Args:
            teacher_user_id: The user ID of the teacher
            student_user_id: Optional filter by student user ID
            
        Returns:
            List of directives ordered by creation date (newest first)
        """
        query = select(TeacherDirectiveDB).where(
            TeacherDirectiveDB.teacher_user_id == teacher_user_id
        )
        if student_user_id is not None:
            query = query.where(TeacherDirectiveDB.student_user_id == student_user_id)
        
        return list(
            self.db.scalars(
                query.order_by(TeacherDirectiveDB.created_at.desc())
            ).all()
        )

    def deactivate_directive(self, directive_id: int, teacher_user_id: int) -> TeacherDirectiveDB | None:
        """Deactivate a directive (soft delete).
        
        Args:
            directive_id: The ID of the directive to deactivate
            teacher_user_id: The user ID of the teacher (for authorization)
            
        Returns:
            The updated directive, or None if not found or not authorized
        """
        directive = self.db.get(TeacherDirectiveDB, directive_id)
        if not directive:
            return None
        if directive.teacher_user_id != teacher_user_id:
            return None  # Not authorized
        
        directive.is_active = False
        directive.deactivated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(directive)
        return directive

    def format_directives_for_prompt(self, student_user_id: int) -> str:
        """Format all active directives for a student into a prompt-friendly string.
        
        This is used to inject teacher instructions into LLM prompts.
        
        Args:
            student_user_id: The user ID of the student
            
        Returns:
            Formatted string to include in LLM prompts, or empty string if no directives
        """
        directives = self.get_active_directives_for_student(student_user_id)
        if not directives:
            return ""
        
        # Get teacher names for context
        teacher_ids = list(set(d.teacher_user_id for d in directives))
        teachers = {
            u.id: u.name for u in self.db.scalars(
                select(UserDB).where(UserDB.id.in_(teacher_ids))
            ).all()
        }
        
        lines = ["## Teacher Directives (IMPORTANT - Follow these instructions from the student's teacher)"]
        lines.append("")
        
        for i, d in enumerate(directives, 1):
            teacher_name = teachers.get(d.teacher_user_id, "Teacher")
            lines.append(f"### Directive {i} (from {teacher_name})")
            
            if d.content_type:
                lines.append(f"- Content Type Focus: {d.content_type}")
            
            if d.focus_areas_json:
                try:
                    areas = json.loads(d.focus_areas_json)
                    if areas:
                        lines.append(f"- Focus Areas: {', '.join(areas)}")
                except Exception:
                    pass
            
            lines.append(f"- Instructions: {d.instructions}")
            lines.append("")
        
        lines.append("**You MUST follow these teacher directives when generating content for this student.**")
        lines.append("")
        
        return "\n".join(lines)

    def get_directives_as_dict(self, student_user_id: int) -> list[dict[str, Any]]:
        """Get all active directives for a student as a list of dictionaries.
        
        Useful for including in prompt context JSON.
        
        Args:
            student_user_id: The user ID of the student
            
        Returns:
            List of directive dictionaries
        """
        directives = self.get_active_directives_for_student(student_user_id)
        result = []
        
        for d in directives:
            focus_areas = []
            if d.focus_areas_json:
                try:
                    focus_areas = json.loads(d.focus_areas_json)
                except Exception:
                    pass
            
            result.append({
                "id": d.id,
                "teacherUserId": d.teacher_user_id,
                "contentType": d.content_type,
                "focusAreas": focus_areas,
                "instructions": d.instructions,
                "createdAt": d.created_at.isoformat() if d.created_at else None,
            })
        
        return result

    @staticmethod
    def parse_focus_areas(directive: TeacherDirectiveDB) -> list[str]:
        """Parse focus areas from a directive's JSON field."""
        if not directive.focus_areas_json:
            return []
        try:
            areas = json.loads(directive.focus_areas_json)
            return areas if isinstance(areas, list) else []
        except Exception:
            return []
