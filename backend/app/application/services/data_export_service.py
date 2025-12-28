from __future__ import annotations

from typing import Any


class DataExportService:
    def getAvailableReports(self, userId: int) -> list[str]:
        pass

    def exportToPDF(self, data: Any) -> bytes:
        pass

    def exportToCSV(self, data: Any) -> bytes:
        pass

    def generateDownloadLink(self, fileData: bytes) -> str:
        pass
