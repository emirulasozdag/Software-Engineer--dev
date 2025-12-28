from __future__ import annotations

from abc import ABC
from dataclasses import dataclass
from datetime import datetime

from app.domain.enums import LanguageLevel, UserRole


@dataclass
class User(ABC):
    userId: int
    name: str
    email: str
    password: str
    role: UserRole
    isVerified: bool
    createdAt: datetime
    lastLogin: datetime

    def register(self) -> None:
        pass

    def login(self) -> None:
        pass

    def logout(self) -> None:
        pass

    def verifyEmail(self, token: str) -> None:
        pass

    def resetPassword(self, newPassword: str) -> None:
        pass

    def updateProfile(self) -> None:
        pass


@dataclass
class Student(User):
    level: LanguageLevel
    dailyStreak: int
    totalPoints: int
    enrollmentDate: datetime

    def takePlacementTest(self) -> None:
        pass

    def viewProgress(self) -> None:
        pass

    def viewResults(self) -> None:
        pass

    def submitFeedback(self) -> None:
        pass

    def startChatbot(self) -> None:
        pass


@dataclass
class Teacher(User):
    department: str
    specialization: str

    def assignHomework(self) -> None:
        pass

    def viewStudentProgress(self) -> None:
        pass

    def createContent(self) -> None:
        pass

    def sendAnnouncement(self) -> None:
        pass

    def collaborateWithAI(self) -> None:
        pass


@dataclass
class Admin(User):
    adminLevel: int
    permissions: list[str]

    def manageUsers(self) -> None:
        pass

    def changeUserRole(self, userId: int, role: UserRole) -> None:
        pass

    def viewSystemPerformance(self) -> None:
        pass

    def enableMaintenanceMode(self) -> None:
        pass

    def viewSystemLogs(self) -> None:
        pass
