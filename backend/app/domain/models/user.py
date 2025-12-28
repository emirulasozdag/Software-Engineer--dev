"""Backward-compatible module name.

This project’s UML defines the user hierarchy in a single place.
We keep this file so existing imports don’t break.
"""

from app.domain.models.user_hierarchy import Admin, Student, Teacher, User

