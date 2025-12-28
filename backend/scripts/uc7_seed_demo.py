from __future__ import annotations

"""
UC7 demo seeder (no schema changes).

Usage (from repo root):
  python backend/scripts/uc7_seed_demo.py --email ceyda@gmail.com --seed
  python backend/scripts/uc7_seed_demo.py --email ceyda@gmail.com --cleanup

What it does:
- Finds the User by email
- Ensures StudentDB exists
- Inserts a demo TestDB + TestResultDB with strengths/weaknesses JSON
- (Optional) removes the inserted demo rows
"""

import argparse
import json
from datetime import datetime

from sqlalchemy import select

from app.domain.enums import LanguageLevel, UserRole
from app.infrastructure.db.models.results import TestResultDB
from app.infrastructure.db.models.tests import TestDB
from app.infrastructure.db.models.user import StudentDB, UserDB
from app.infrastructure.db.session import SessionLocal


DEMO_TITLE = "UC7 Demo Placement Test"


def parse_csv(value: str) -> list[str]:
	if not value:
		return []
	return [v.strip() for v in value.split(",") if v.strip()]


def seed(email: str, level: str, strengths: list[str], weaknesses: list[str]) -> None:
	with SessionLocal() as db:
		user = db.scalar(select(UserDB).where(UserDB.email == email.strip().lower()))
		if not user:
			raise SystemExit(f"User not found for email: {email}")
		if user.role != UserRole.STUDENT:
			raise SystemExit(f"User is not STUDENT (role={user.role})")

		student = db.scalar(select(StudentDB).where(StudentDB.user_id == user.id))
		if not student:
			student = StudentDB(
				user_id=user.id,
				level=LanguageLevel(level),
				daily_streak=0,
				total_points=0,
				enrollment_date=datetime.utcnow(),
			)
			db.add(student)
			db.commit()
			db.refresh(student)

		test = TestDB(
			title=DEMO_TITLE,
			description="Seeded demo test result for UC7",
			duration=30,
			max_score=100,
			test_type="placement",
		)
		db.add(test)
		db.commit()
		db.refresh(test)

		tr = TestResultDB(
			student_id=student.id,
			test_id=test.id,
			score=72,
			level=LanguageLevel(level),
			completed_at=datetime.utcnow(),
			strengths_json=json.dumps(strengths),
			weaknesses_json=json.dumps(weaknesses),
		)
		db.add(tr)
		db.commit()
		db.refresh(tr)

		print("Seeded UC7 demo data:")
		print(f"- user_id={user.id} student_id={student.id} test_id={test.id} test_result_id={tr.id}")
		print(f"- strengths={strengths}")
		print(f"- weaknesses={weaknesses}")


def cleanup(email: str) -> None:
	with SessionLocal() as db:
		user = db.scalar(select(UserDB).where(UserDB.email == email.strip().lower()))
		if not user:
			raise SystemExit(f"User not found for email: {email}")

		# Remove demo tests + results (keep student/user)
		tests = list(db.scalars(select(TestDB).where(TestDB.title == DEMO_TITLE)).all())
		test_ids = [t.id for t in tests]
		if test_ids:
			for r in list(db.scalars(select(TestResultDB).where(TestResultDB.test_id.in_(test_ids))).all()):
				db.delete(r)
			for t in tests:
				db.delete(t)
			db.commit()

		print(f"Cleanup done. Removed {len(test_ids)} demo test(s) for {email}.")


def main() -> None:
	p = argparse.ArgumentParser()
	p.add_argument("--email", required=True)
	p.add_argument("--seed", action="store_true")
	p.add_argument("--cleanup", action="store_true")
	p.add_argument("--level", default="A2", choices=[l.value for l in LanguageLevel])
	p.add_argument("--strengths", default="reading comprehension,basic grammar")
	p.add_argument("--weaknesses", default="pronunciation,advanced vocabulary,speaking fluency")
	args = p.parse_args()

	if args.seed == args.cleanup:
		raise SystemExit("Choose exactly one: --seed or --cleanup")

	if args.seed:
		seed(
			email=args.email,
			level=args.level,
			strengths=parse_csv(args.strengths),
			weaknesses=parse_csv(args.weaknesses),
		)
	else:
		cleanup(args.email)


if __name__ == "__main__":
	main()


