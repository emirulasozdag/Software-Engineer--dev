from datetime import datetime
from typing import List, Optional
from .enums import UserRole, LanguageLevel

class User:
    def __init__(self):
        self.userId: int = 0
        self.name: str = ""
        self.email: str = ""
        self.password: str = ""
        self.role: UserRole = UserRole.STUDENT
        self.isVerified: bool = False
        self.createdAt: datetime = datetime.now()
        self.lastLogin: datetime = datetime.now()

    def register(self):
        # Not implemented
        pass

    def login(self):
        # Not implemented
        pass

    def logout(self):
        # Not implemented
        pass

    def verifyEmail(self, token: str):
        # Not implemented
        pass

    def resetPassword(self, newPassword: str):
        # Not implemented
        pass

    def updateProfile(self):
        # Not implemented
        pass

class Student(User):
    def __init__(self):
        super().__init__()
        self.level: LanguageLevel = LanguageLevel.A1
        self.dailyStreak: int = 0
        self.totalPoints: int = 0
        self.enrollmentDate: datetime = datetime.now()

    def takePlacementTest(self):
        # Not implemented
        pass

    def viewProgress(self):
        # Not implemented
        pass

    def viewResults(self):
        # Not implemented
        pass

    def submitFeedback(self):
        # Not implemented
        pass

    def startChatbot(self):
        # Not implemented
        pass

class Teacher(User):
    def __init__(self):
        super().__init__()
        self.department: str = ""
        self.specialization: str = ""

    def assignHomework(self):
        # Not implemented
        pass

    def viewStudentProgress(self):
        # Not implemented
        pass

    def createContent(self):
        # Not implemented
        pass

    def sendAnnouncement(self):
        # Not implemented
        pass

    def collaborateWithAI(self):
        # Not implemented
        pass

class Admin(User):
    def __init__(self):
        super().__init__()
        self.adminLevel: int = 0
        self.permissions: List[str] = []

    def manageUsers(self):
        # Not implemented
        pass

    def changeUserRole(self, userId: int, role: UserRole):
        # Not implemented
        pass

    def viewSystemPerformance(self):
        # Not implemented
        pass

    def enableMaintenanceMode(self):
        # Not implemented
        pass

    def viewSystemLogs(self):
        # Not implemented
        pass
