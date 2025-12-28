from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.db.models.progress import ProgressDB, ProgressSnapshotDB


@dataclass(frozen=True)
class ProgressRow:
	student_id: int
	completed_lessons: list[int]
	completed_tests: list[int]
	correct_answer_rate: float
	last_updated: datetime


@dataclass(frozen=True)
class ProgressSnapshotRow:
	student_id: int
	snapshot_date: date
	correct_answer_rate: float


class SqlAlchemyProgressRepository:
	def __init__(self, db: Session):
		self.db = db

	def fetch_progress(self, student_id: int) -> ProgressRow | None:
		row = self.db.scalar(select(ProgressDB).where(ProgressDB.student_id == student_id))
		if not row:
			return None
		return ProgressRow(
			student_id=int(row.student_id),
			completed_lessons=self._load_int_list(row.completed_lessons_json),
			completed_tests=self._load_int_list(row.completed_tests_json),
			correct_answer_rate=float(row.correct_answer_rate or 0.0),
			last_updated=row.last_updated,
		)

	def fetch_snapshots(self, student_id: int, days: int = 30) -> list[ProgressSnapshotRow]:
		start = date.today() - timedelta(days=max(0, int(days)))
		rows = list(
			self.db.scalars(
				select(ProgressSnapshotDB)
				.where(ProgressSnapshotDB.student_id == student_id)
				.where(ProgressSnapshotDB.snapshot_date >= start)
				.order_by(ProgressSnapshotDB.snapshot_date.asc())
			).all()
		)
		out: list[ProgressSnapshotRow] = []
		for r in rows:
			correct_rate = 0.0
			try:
				payload = json.loads(r.progress_data_json or "{}")
				correct_rate = float(payload.get("correctAnswerRate", payload.get("correct_answer_rate", 0.0)) or 0.0)
			except Exception:
				correct_rate = 0.0
			out.append(
				ProgressSnapshotRow(
					student_id=int(r.student_id),
					snapshot_date=r.snapshot_date,
					correct_answer_rate=correct_rate,
				)
			)
		return out

	@staticmethod
	def _load_int_list(raw: str | None) -> list[int]:
		if not raw:
			return []
		try:
			data = json.loads(raw)
			if isinstance(data, list):
				return [int(x) for x in data]
		except Exception:
			return []
		return []
