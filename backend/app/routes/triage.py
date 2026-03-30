from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from app.models.triage import TriageRequest, TriageResponse
from app.services.triage_service import TriageService
from app.utils.jwt_handler import get_current_user
from typing import Optional

router = APIRouter(prefix="/triage", tags=["Symptom Triage"])
triage_service = TriageService()


@router.post("/text", response_model=TriageResponse)
async def triage_text(
    request: TriageRequest,
    current_user: dict = Depends(get_current_user)
):
    """Process text-based symptom triage"""
    try:
        result = await triage_service.process_symptoms(
            user_id=current_user["user_id"],
            symptoms=request.symptoms,
            language=request.language,
            input_type="text",
            latitude=request.latitude,
            longitude=request.longitude
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Triage processing failed: {str(e)}"
        )


@router.post("/voice", response_model=TriageResponse)
async def triage_voice(
    symptoms_text: str = Form(...),
    language: str = Form(default="english"),
    latitude: Optional[float] = Form(default=None),
    longitude: Optional[float] = Form(default=None),
    current_user: dict = Depends(get_current_user)
):
    """Process voice-based symptom triage (text already converted by browser)"""
    try:
        result = await triage_service.process_symptoms(
            user_id=current_user["user_id"],
            symptoms=symptoms_text,
            language=language,
            input_type="voice",
            latitude=latitude,
            longitude=longitude
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice triage failed: {str(e)}"
        )


@router.get("/history", response_model=dict)
async def get_triage_history(
    current_user: dict = Depends(get_current_user)
):
    """Get user's triage history"""
    try:
        history = await triage_service.get_user_history(current_user["user_id"])
        return {"history": history}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/history/{triage_id}", response_model=dict)
async def get_triage_detail(
    triage_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific triage record"""
    try:
        record = await triage_service.get_triage_record(triage_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Triage record not found"
            )
        return {"record": record}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )