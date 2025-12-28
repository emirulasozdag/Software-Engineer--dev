from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user
from app.api.schemas.placement_test import (
	ModuleQuestionsResponse,
	StartPlacementTestResponse,
	SubmitModuleRequest,
	TestModuleResult,
	TestQuestion,
)
from app.application.controllers.placement_test_controller import PlacementTestController
from app.application.services.placement_test_service import PlacementTestService
from app.infrastructure.db.session import get_db

router = APIRouter()


def _ensure_dummy_audio_files() -> None:
	# Minimal placeholder files. These are not guaranteed to be valid audio,
	# but they satisfy the "empty audio files" requirement for now.
	root = Path(__file__).resolve().parents[2]  # backend/app
	audio_dir = root / "static" / "audio"
	audio_dir.mkdir(parents=True, exist_ok=True)
	for name in ("silence.wav", "silence2.wav"):
		p = audio_dir / name
		if not p.exists():
			p.write_bytes(b"")


def _to_question(q, module_type: str) -> TestQuestion:
	options = None
	if q.options_json:
		try:
			options = json.loads(q.options_json)
		except Exception:
			options = None

	audio_url = None
	if module_type == "listening":
		_ensure_dummy_audio_files()
		audio_url = "/static/audio/silence.wav"

	return TestQuestion(
		id=str(q.id),
		type=module_type,  # type: ignore[arg-type]
		question=q.text,
		options=options,
		audioUrl=audio_url,
	)


@router.post("/start", response_model=StartPlacementTestResponse, status_code=status.HTTP_201_CREATED)
def start_placement_test(
	db: Session = Depends(get_db),
	user=Depends(get_current_user),
) -> StartPlacementTestResponse:
	controller = PlacementTestController(PlacementTestService(db))
	try:
		started = controller.startPlacementTest(user.userId)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	return StartPlacementTestResponse(
		testId=str(started.testId),
		modules=[m.moduleType for m in started.modules],
	)


@router.get("/{testId}/module/{moduleType}", response_model=ModuleQuestionsResponse)
def get_module_questions(
	testId: int,
	moduleType: str,
	db: Session = Depends(get_db),
	user=Depends(get_current_user),
) -> ModuleQuestionsResponse:
	controller = PlacementTestController(PlacementTestService(db))
	try:
		questions = controller.getModuleQuestions(testId=testId, moduleType=moduleType)  # type: ignore[arg-type]
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	return ModuleQuestionsResponse(
		testId=str(testId),
		moduleType=moduleType,  # type: ignore[arg-type]
		questions=[_to_question(q, moduleType) for q in questions],
	)


@router.post("/{testId}/module/{moduleType}/submit", response_model=TestModuleResult)
def submit_module(
	testId: int,
	moduleType: str,
	payload: SubmitModuleRequest,
	db: Session = Depends(get_db),
	user=Depends(get_current_user),
) -> TestModuleResult:
	controller = PlacementTestController(PlacementTestService(db))
	try:
		result = controller.submitModule(
			userId=user.userId,
			testId=testId,
			moduleType=moduleType,  # type: ignore[arg-type]
			submissions=[s.model_dump() for s in payload.submissions],
		)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	return TestModuleResult(
		moduleType=result.moduleType,
		level=result.level.value,
		score=result.score,
		feedback=result.feedback,
	)


@router.post("/{testId}/module/speaking/submit-audio", response_model=TestModuleResult)
async def submit_speaking_audio(
	testId: int,
	questionId: str = Form(...),
	audio: UploadFile = File(...),
	db: Session = Depends(get_db),
	user=Depends(get_current_user),
) -> TestModuleResult:
	controller = PlacementTestController(PlacementTestService(db))
	try:
		audio_bytes = await audio.read()
		result = controller.submitSpeakingAudio(
			userId=user.userId,
			testId=testId,
			questionId=questionId,
			audioBytes=audio_bytes,
			contentType=audio.content_type,
		)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	return TestModuleResult(
		moduleType=result.moduleType,
		level=result.level.value,
		score=result.score,
		feedback=result.feedback,
	)


@router.post("/{testId}/complete")
def complete_test(
	testId: int,
	db: Session = Depends(get_db),
	user=Depends(get_current_user),
):
	controller = PlacementTestController(PlacementTestService(db))
	try:
		res = controller.completeTest(userId=user.userId, testId=testId)
	except ValueError as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

	return {
		"id": str(res.id),
		"studentId": str(res.studentId),
		"overallLevel": res.overallLevel.value,
		"readingLevel": res.readingLevel.value,
		"writingLevel": res.writingLevel.value,
		"listeningLevel": res.listeningLevel.value,
		"speakingLevel": res.speakingLevel.value,
		"completedAt": res.completedAt,
	}
