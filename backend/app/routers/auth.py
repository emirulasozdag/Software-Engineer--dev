from fastapi import APIRouter

router = APIRouter()

class AuthController:
    @router.post("/login")
    def login():
        return {"message": "Not implemented"}

    @router.post("/register")
    def register():
        return {"message": "Not implemented"}
