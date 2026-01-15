"""
Migration: Add announcement column to maintenance_logs table

Run this script once to add the announcement column to existing databases.
"""

from sqlalchemy import create_engine, text
from app.config.settings import get_settings

def migrate():
    settings = get_settings()
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        # Check if column exists
        try:
            result = conn.execute(text("SELECT announcement FROM maintenance_logs LIMIT 1"))
            print("✓ Column 'announcement' already exists in maintenance_logs table")
        except Exception:
            # Column doesn't exist, add it
            print("Adding 'announcement' column to maintenance_logs table...")
            conn.execute(text("ALTER TABLE maintenance_logs ADD COLUMN announcement TEXT"))
            conn.commit()
            print("✓ Column 'announcement' added successfully")

if __name__ == "__main__":
    migrate()
