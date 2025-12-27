from fastapi import APIRouter

router = APIRouter()

class ChatbotController:
    @router.post("/chatbot/message")
    def send_message():
        return {"message": "Not implemented"}

class AnnouncementController:
    @router.post("/announcement/create")
    def create_announcement():
        return {"message": "Not implemented"}

class MessageController:
    @router.post("/message/send")
    def send_message():
        return {"message": "Not implemented"}
