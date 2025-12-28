from __future__ import annotations


class AIContentController:
    def startContentCreationSession(self, teacherId: int):
        pass

    def submitContentInputs(self, teacherId: int, title: str, instructions: str):
        pass

    def saveApprovedContent(self, teacherId: int, finalContent):
        pass

    def saveDraftRequest(self, teacherId: int, contentDraft):
        pass

    def showRegenerateOption(self):
        pass

    def updateTeacherContentView(self):
        pass
