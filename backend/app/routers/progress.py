from fastapi import APIRouter

router = APIRouter()

class ProgressTrackingController:
    @router.get("/progress/{student_id}")
    def get_progress(student_id: int):
        return {"message": "Not implemented"}

class DataExportController:
    @router.get("/export/data")
    def export_data():
        return {"message": "Not implemented"}
