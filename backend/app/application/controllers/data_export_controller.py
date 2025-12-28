from __future__ import annotations


class DataExportController:
    def listReportTypes(self, userId: int):
        pass

    def exportData(self, userId: int, reportType: str, format: str):
        pass

    def generateDownloadLink(self, fileId: int):
        pass
