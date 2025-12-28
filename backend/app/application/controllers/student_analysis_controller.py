from __future__ import annotations

from sqlalchemy.orm import Session

from app.application.services.student_analysis_service import StudentAnalysisService

class StudentAnalysisController:
	def __init__(self, db: Session):
		self.service = StudentAnalysisService(db)

	def requestPersonalPlan(self, studentUserId: int):
		# Alias: for now we just generate (or refresh) plan
		return self.service.generatePersonalPlan(studentUserId)

	def generatePersonalPlan(self, studentUserId: int):
		return self.service.generatePersonalPlan(studentUserId)

	def updatePersonalPlanView(self, studentId: int, plan):
		# UI concern - no-op in backend
		return {"updated": True}
