from __future__ import annotations


class AssignmentController:
    def createAssignment(self, teacherId: int, assignment):
        pass

    def assignToStudents(self, assignmentId: int, studentIds: list[int]):
        pass

    def getStudentAssignments(self, studentId: int):
        pass

    def submitAssignment(self, studentAssignmentId: int):
        pass
