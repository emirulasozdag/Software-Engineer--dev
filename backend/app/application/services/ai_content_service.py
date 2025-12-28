from __future__ import annotations


class AIContentService:
    def prepareSuggestedContent(self, teacherId: int, title: str, instructions: str):
        pass

    def storeAndAssignContent(self, teacherId: int, finalContent) -> None:
        pass

    def saveDraftOnly(self, teacherId: int, contentDraft) -> None:
        pass
