from fastapi import APIRouter

router = APIRouter()

class PlacementTestController:
    @router.post("/placement-test/start")
    def start_test():
        return {"message": "Not implemented"}

class WritingTestController:
    @router.post("/writing-test/submit")
    def submit_test():
        return {"message": "Not implemented"}

class ReadingTestController:
    @router.post("/reading-test/submit")
    def submit_test():
        return {"message": "Not implemented"}

class ListeningTestController:
    @router.post("/listening-test/submit")
    def submit_test():
        return {"message": "Not implemented"}

class SpeakingTestController:
    @router.post("/speaking-test/submit")
    def submit_test():
        return {"message": "Not implemented"}

class TestResultController:
    @router.get("/results/{student_id}")
    def get_results(student_id: int):
        return {"message": "Not implemented"}
