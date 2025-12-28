from __future__ import annotations


class AnnouncementService:
    def createAnnouncement(self, announcement) -> int:
        pass

    def publishAnnouncement(self, announcementId: int) -> None:
        pass

    def getAnnouncementsForUser(self, userId: int):
        pass
