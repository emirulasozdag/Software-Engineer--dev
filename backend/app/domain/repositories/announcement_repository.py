from __future__ import annotations


class AnnouncementRepository:
    def save(self, announcement) -> int:
        pass

    def findById(self, announcementId: int):
        pass

    def findByTeacherId(self, teacherId: int):
        pass
