from fastapi import APIRouter, HTTPException, status, Depends
from app.models.triage import TriageRequest, TriageResponse
from app.services.triage_service import TriageService
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/triage", tags=["Triage"])
triage_service = TriageService()

@router.post("/text", response_model=dict)
async def text_triage(request: TriageRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = await triage_service.process_symptoms(
            user_id=current_user["user_id"],
            symptoms=request.symptoms,
            language=request.language,
            input_type=request.input_type,
            latitude=request.latitude,
            longitude=request.longitude,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=dict)
async def get_triage_history(current_user: dict = Depends(get_current_user)):
    try:
        history = await triage_service.get_user_history(current_user["user_id"])
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{triage_id}", response_model=dict)
async def get_triage_record(triage_id: str, current_user: dict = Depends(get_current_user)):
    try:
        record = await triage_service.get_triage_record(triage_id)
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        return {"record": record}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))