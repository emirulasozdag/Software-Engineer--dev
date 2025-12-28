from __future__ import annotations


class LessonContentRepository:
    def saveDraftContent(self, teacherId: int, contentDraft) -> int:
        pass

    def saveLessonContent(self, teacherId: int, finalContent) -> int:
        pass

    def findByTeacherId(self, teacherId: int):
        pass
