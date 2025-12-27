from fastapi import APIRouter

router = APIRouter()

class AssignmentController:
    @router.post("/assignment/create")
    def create_assignment():
        return {"message": "Not implemented"}

class AutomaticFeedbackController:
    @router.get("/feedback/generate")
    def generate_feedback():
        return {"message": "Not implemented"}
