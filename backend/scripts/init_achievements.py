"""Script to initialize achievements in the database.

Run this once to populate the achievements table with predefined achievements.
"""

from sqlalchemy.orm import Session
from app.infrastructure.db.session import SessionLocal
from app.application.services.achievement_service import AchievementService


def main():
    """Initialize achievements in the database."""
    db: Session = SessionLocal()
    try:
        print("Initializing achievements...")
        service = AchievementService(db)
        service.initialize_achievements()
        print("✅ Achievements initialized successfully!")
        
    except Exception as e:
        print(f"❌ Error initializing achievements: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
