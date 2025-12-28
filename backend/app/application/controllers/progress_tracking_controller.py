from __future__ import annotations


class ProgressTrackingController:
    def requestStudentProgress(self, studentId: int):
        """Return a progress view model for a student.

        Note: this controller method is currently not wired to routes;
        routes use repository directly for minimal coupling.
        """
        return {"studentId": studentId}
        pass

    def requestStudentProgressForTeacher(self, studentId: int):
        return self.requestStudentProgress(studentId)
        pass

    def displayStudentProgress(self, viewModel):
        return viewModel
        pass

    def displayStudentProgressSummary(self, summary):
        return summary
        pass
