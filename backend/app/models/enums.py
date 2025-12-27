from enum import Enum

class UserRole(str, Enum):
    STUDENT = "STUDENT"
    TEACHER = "TEACHER"
    ADMIN = "ADMIN"

class LanguageLevel(str, Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"

class ContentType(str, Enum):
    LESSON = "LESSON"
    EXERCISE = "EXERCISE"
    ROLEPLAY = "ROLEPLAY"
    VOCABULARY = "VOCABULARY"
    GRAMMAR = "GRAMMAR"

class AssignmentStatus(str, Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    GRADED = "GRADED"
    LATE = "LATE"
