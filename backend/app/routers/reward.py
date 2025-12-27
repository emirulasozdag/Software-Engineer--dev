from fastapi import APIRouter

router = APIRouter()

class RewardController:
    @router.post("/reward/award")
    def award_points():
        return {"message": "Not implemented"}
