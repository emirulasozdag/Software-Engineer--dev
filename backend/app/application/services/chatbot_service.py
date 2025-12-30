from __future__ import annotations

import json
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.application.services.chatbot_context_service import ChatbotContextService
from app.config.settings import get_settings
from app.infrastructure.db.models.chatbot import ChatMessageDB, ChatSessionDB
from app.infrastructure.external.llm.client import LLMClient
from app.infrastructure.external.llm.factory import get_llm_client
from app.infrastructure.external.llm.types import LLMChatRequest, LLMMessage


class ChatbotService:
    def __init__(self, db: Session, llm_client: LLMClient | None = None) -> None:
        self.db = db
        self.context_service = ChatbotContextService(db)
        self.llm_client = llm_client or get_llm_client(get_settings())

    def _get_open_session(self, student_id: int) -> ChatSessionDB | None:
        return self.db.scalar(
            select(ChatSessionDB)
            .where(ChatSessionDB.student_id == student_id, ChatSessionDB.ended_at.is_(None))
            .order_by(ChatSessionDB.started_at.desc())
        )

    def createSession(self, studentId: int) -> ChatSessionDB:
        session = ChatSessionDB(student_id=studentId, started_at=datetime.utcnow(), ended_at=None)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def getOrCreateOpenSession(self, studentId: int) -> ChatSessionDB:
        session = self._get_open_session(studentId)
        if session:
            return session
        return self.createSession(studentId)

    def processMessage(self, sessionId: int, message: str) -> str:
        """Process a user message and generate a response using LLM with full context."""
        session = self.db.get(ChatSessionDB, sessionId)
        if not session:
            return "Error: Session not found."

        student_id = session.student_id

        # Build comprehensive student context
        context = self.context_service.build_student_context(student_id)
        context_text = self.context_service.format_context_for_prompt(context)

        # Get conversation history for this session
        history = self.getChatHistory(sessionId)

        # Build messages for LLM
        messages: list[LLMMessage] = []

        # System prompt with context
        system_prompt = self._build_system_prompt(context_text)
        messages.append(LLMMessage(role="system", content=system_prompt))

        # Add conversation history (last 10 messages to avoid token limits)
        for msg in history[-10:]:
            role = "assistant" if msg.sender == "bot" else "user"
            messages.append(LLMMessage(role=role, content=msg.content))

        # Add current user message
        messages.append(LLMMessage(role="user", content=message))

        # Call LLM
        try:
            request = LLMChatRequest(
                messages=messages,
                temperature=0.7,  # More conversational
                max_output_tokens=1024,
            )
            response = self.llm_client.generate(request)
            
            # Try to parse JSON response for structured actions
            response_text = response.text.strip()
            try:
                parsed = json.loads(response_text)
                
                # Check if LLM wants to update learning plan
                if parsed.get("action") == "update_learning_plan":
                    plan_updates = parsed.get("plan_updates", {})
                    update_result = self._update_learning_plan(student_id, plan_updates)
                    
                    # Return the response message with update confirmation
                    bot_message = parsed.get("message", "I've updated your learning plan.")
                    if update_result.get("success"):
                        bot_message += f"\n\n✓ {update_result.get('message', 'Plan updated successfully.')}"
                    else:
                        bot_message += f"\n\n⚠ {update_result.get('message', 'Could not update plan.')}"
                    
                    return bot_message
                
                # Return the message from structured response
                return parsed.get("message", response_text)
            except json.JSONDecodeError:
                # Not JSON, return as-is
                return response_text
                
        except Exception as e:
            print(f"Error calling LLM: {e}")
            return (
                "I'm having trouble processing your request right now. "
                "Please try rephrasing your question or contact support if the issue persists."
            )

    def saveMessage(self, sessionId: int, *, sender: str, content: str) -> ChatMessageDB:
        msg = ChatMessageDB(session_id=sessionId, sender=sender, content=content, timestamp=datetime.utcnow())
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def endSession(self, sessionId: int) -> None:
        session = self.db.get(ChatSessionDB, sessionId)
        if not session:
            return
        if session.ended_at is None:
            session.ended_at = datetime.utcnow()
            self.db.commit()

    def endOpenSession(self, studentId: int) -> None:
        session = self._get_open_session(studentId)
        if not session:
            return
        self.endSession(session.id)

    def getChatHistory(self, sessionId: int) -> list[ChatMessageDB]:
        return list(
            self.db.scalars(
                select(ChatMessageDB)
                .where(ChatMessageDB.session_id == sessionId)
                .order_by(ChatMessageDB.timestamp.asc())
            ).all()
        )

    def _build_system_prompt(self, context_text: str) -> str:
        """Build comprehensive system prompt for the chatbot."""
        return f"""You are an intelligent English learning assistant for an adaptive learning platform.
Your role is to help students improve their English proficiency across all skill areas.

You have access to detailed information about the student, including their current levels, 
learning plan, strengths, weaknesses, and progress. Use this context to provide personalized,
helpful responses.

{context_text}

## Your Capabilities

1. **Answer Questions**: Help students understand grammar, vocabulary, pronunciation, and more.
2. **Provide Practice**: Suggest exercises or examples based on their level and needs.
3. **Explain Concepts**: Break down complex topics into understandable parts.
4. **Review Progress**: Discuss their strengths, weaknesses, and recent performance.
5. **Adjust Learning Plan**: If a student wants to focus on a specific area or skill, you can
   update their learning plan priorities.

## How to Update Learning Plans

When a student explicitly asks to focus on or improve a specific skill area (e.g., "I want to 
improve my speaking skills" or "Can we focus more on pronunciation?"), you should:

1. Respond with a JSON object (not markdown code blocks) with this structure:
{{
  "action": "update_learning_plan",
  "plan_updates": {{
    "add_topics": [
      {{"name": "Topic Name", "category": "speaking", "difficulty": "B1", "priority": 1, "reason": "Student requested focus on speaking"}}
    ],
    "increase_priority": ["existing topic name to prioritize"],
    "focus_areas": ["speaking", "pronunciation"]
  }},
  "message": "Your natural language response to the student"
}}

2. Only suggest plan updates when the student explicitly requests a change or focus area.

## Response Guidelines

- Be encouraging and supportive
- Use Turkish when helpful, but encourage English practice
- Keep responses clear and concise (2-4 paragraphs max)
- Provide specific, actionable advice based on their context
- Reference their actual levels, progress, and learning plan when relevant
- If responding normally (not updating plan), return plain text or JSON with just "message" field

Remember: You're a supportive tutor helping them achieve their language learning goals!"""

    def _update_learning_plan(self, student_id: int, plan_updates: dict) -> dict:
        """Update student's learning plan based on chatbot suggestions.
        
        Args:
            student_id: The student ID
            plan_updates: Dictionary containing plan modifications:
                - add_topics: List of new topics to add
                - increase_priority: List of topic names to prioritize
                - focus_areas: List of skill areas to focus on
        
        Returns:
            Dictionary with success status and message
        """
        from app.infrastructure.db.models.content import LessonPlanDB
        
        try:
            # Get current plan
            plan = self.db.scalar(
                select(LessonPlanDB)
                .where(LessonPlanDB.student_id == student_id)
                .order_by(LessonPlanDB.created_at.desc())
            )
            
            if not plan:
                return {
                    "success": False,
                    "message": "No learning plan found. Please complete a placement test first."
                }
            
            # Parse current topics
            current_topics = []
            if plan.topics_json:
                try:
                    current_topics = json.loads(plan.topics_json) or []
                except Exception:
                    current_topics = []
            
            # Apply updates
            modified = False
            
            # Add new topics
            add_topics = plan_updates.get("add_topics", [])
            if add_topics:
                for new_topic in add_topics:
                    # Check if topic already exists
                    exists = any(t.get("name", "").lower() == new_topic.get("name", "").lower() 
                                for t in current_topics)
                    if not exists:
                        current_topics.append(new_topic)
                        modified = True
            
            # Increase priority for specified topics
            increase_priority = plan_updates.get("increase_priority", [])
            if increase_priority:
                for topic_name in increase_priority:
                    for topic in current_topics:
                        if topic.get("name", "").lower() == topic_name.lower():
                            # Lower priority number = higher priority
                            current_priority = topic.get("priority", 5)
                            topic["priority"] = max(1, current_priority - 2)
                            modified = True
            
            # If focus_areas specified, adjust priorities for matching categories
            focus_areas = plan_updates.get("focus_areas", [])
            if focus_areas:
                for topic in current_topics:
                    category = topic.get("category", "").lower()
                    if any(focus in category for focus in focus_areas):
                        current_priority = topic.get("priority", 5)
                        topic["priority"] = max(1, current_priority - 1)
                        modified = True
            
            if modified:
                # Sort by priority
                current_topics.sort(key=lambda t: t.get("priority", 999))
                
                # Re-assign priority numbers sequentially
                for i, topic in enumerate(current_topics, start=1):
                    topic["priority"] = i
                
                # Save updated plan
                plan.topics_json = json.dumps(current_topics)
                plan.updated_at = datetime.utcnow()
                self.db.commit()
                
                return {
                    "success": True,
                    "message": f"Learning plan updated with {len(add_topics)} new topics and adjusted priorities."
                }
            else:
                return {
                    "success": False,
                    "message": "No changes were made to the learning plan."
                }
                
        except Exception as e:
            print(f"Error updating learning plan: {e}")
            return {
                "success": False,
                "message": f"Error updating plan: {str(e)}"
            }
