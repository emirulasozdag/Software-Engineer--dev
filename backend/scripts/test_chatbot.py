"""Test script for chatbot overhaul.

This script verifies that the chatbot context service and LLM integration work correctly.
Run from the backend directory with: python scripts/test_chatbot.py
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.infrastructure.db.base import Base
from app.infrastructure.db.models.user import UserDB, StudentDB
from app.application.services.chatbot_context_service import ChatbotContextService
from app.application.services.chatbot_service import ChatbotService
from app.domain.enums import LanguageLevel, UserRole
from datetime import datetime

# Create in-memory test database
engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)


def setup_test_student(db):
    """Create a test student with some data."""
    # Create user
    user = UserDB(
        name="Test Student",
        email="test@example.com",
        password="hashed",
        role=UserRole.STUDENT,
        is_verified=True,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.flush()

    # Create student profile
    student = StudentDB(
        user_id=user.id,
        level=LanguageLevel.B1,
        daily_streak=5,
        total_points=250,
        enrollment_date=datetime.utcnow(),
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    return student


def test_context_service():
    """Test chatbot context service."""
    print("\n=== Testing ChatbotContextService ===\n")

    db = SessionLocal()
    try:
        student = setup_test_student(db)
        context_service = ChatbotContextService(db)

        # Build context
        print("Building student context...")
        context = context_service.build_student_context(student.id)

        print(f"✓ Student name: {context.get('student_name')}")
        print(f"✓ Overall level: {context.get('overall_level')}")
        print(f"✓ Daily streak: {context.get('daily_streak')}")
        print(f"✓ Total points: {context.get('total_points')}")

        # Format for prompt
        print("\nFormatting context for prompt...")
        prompt_text = context_service.format_context_for_prompt(context)
        print(f"✓ Prompt length: {len(prompt_text)} characters")
        print(f"\nFirst 500 chars of prompt:\n{prompt_text[:500]}...")

        print("\n✓ Context service test PASSED")
        return True

    except Exception as e:
        print(f"\n✗ Context service test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def test_chatbot_service():
    """Test chatbot service."""
    print("\n=== Testing ChatbotService ===\n")

    db = SessionLocal()
    try:
        student = setup_test_student(db)
        chatbot_service = ChatbotService(db)

        # Create session
        print("Creating chat session...")
        session = chatbot_service.createSession(student.id)
        print(f"✓ Session created: ID={session.id}")

        # Save user message
        print("\nSaving user message...")
        user_msg = chatbot_service.saveMessage(
            session.id, sender="user", content="What is present perfect?"
        )
        print(f"✓ User message saved: ID={user_msg.id}")

        # Process message (will use mock LLM by default)
        print("\nProcessing message with chatbot...")
        response = chatbot_service.processMessage(session.id, "What is present perfect?")
        print(f"✓ Bot response received ({len(response)} chars)")
        print(f"\nResponse preview:\n{response[:200]}...")

        # Save bot message
        bot_msg = chatbot_service.saveMessage(
            session.id, sender="bot", content=response
        )
        print(f"\n✓ Bot message saved: ID={bot_msg.id}")

        # Get history
        print("\nRetrieving chat history...")
        history = chatbot_service.getChatHistory(session.id)
        print(f"✓ History length: {len(history)} messages")

        print("\n✓ Chatbot service test PASSED")
        return True

    except Exception as e:
        print(f"\n✗ Chatbot service test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def test_system_prompt():
    """Test system prompt generation."""
    print("\n=== Testing System Prompt Generation ===\n")

    db = SessionLocal()
    try:
        student = setup_test_student(db)
        context_service = ChatbotContextService(db)
        chatbot_service = ChatbotService(db)

        # Build context
        context = context_service.build_student_context(student.id)
        context_text = context_service.format_context_for_prompt(context)

        # Build system prompt
        system_prompt = chatbot_service._build_system_prompt(context_text)

        print(f"✓ System prompt length: {len(system_prompt)} characters")
        print(f"\n✓ System prompt includes student context: {context_text[:100] in system_prompt}")
        print(f"✓ System prompt mentions plan updates: {'update_learning_plan' in system_prompt}")
        print(f"✓ System prompt has response guidelines: {'Response Guidelines' in system_prompt}")

        print("\n✓ System prompt test PASSED")
        return True

    except Exception as e:
        print(f"\n✗ System prompt test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("CHATBOT OVERHAUL TEST SUITE")
    print("=" * 60)

    results = []

    # Run tests
    results.append(("Context Service", test_context_service()))
    results.append(("Chatbot Service", test_chatbot_service()))
    results.append(("System Prompt", test_system_prompt()))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{name:20s}: {status}")

    print("\n" + "=" * 60)
    print(f"TOTAL: {passed}/{total} tests passed")
    print("=" * 60)

    sys.exit(0 if passed == total else 1)
