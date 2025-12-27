from fastapi import APIRouter

router = APIRouter()

class AdminController:
    @router.get("/admin/users")
    def get_users():
        return {"message": "Not implemented"}

    @router.get("/admin/performance")
    def get_performance():
        return {"message": "Not implemented"}
