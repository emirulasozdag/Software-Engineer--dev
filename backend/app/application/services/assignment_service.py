from __future__ import annotations


class AssignmentService:
    def createAssignment(self, assignment) -> int:
        pass

    def assignToStudents(self, assignmentId: int, studentIds: list[int]) -> None:
        pass

    def getStudentAssignments(self, studentId: int):
        pass

    def submitAssignment(self, studentAssignmentId: int) -> None:
        pass

    def gradeAssignment(self, studentAssignmentId: int, score: int) -> None:
        pass
