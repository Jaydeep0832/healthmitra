"""
Patient API routes — profile, medical history, dashboard stats.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List

from app.security.roles import get_current_user
from app.services.patient_service import patient_service

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's patient profile."""
    user_id = current_user.get("user_id") or str(current_user.get("_id", ""))
    email = current_user.get("email", "")
    name = current_user.get("full_name", "") or current_user.get("name", "")

    profile = await patient_service.get_or_create_profile(
        user_id=user_id, name=name, email=email
    )
    return profile


@router.put("/me")
async def update_my_profile(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Update current user's patient profile."""
    user_id = current_user.get("user_id") or str(current_user.get("_id", ""))

    # Only allow safe fields
    safe_fields = {"name", "age", "gender", "language", "phone", "location"}
    update_data = {k: v for k, v in data.items() if k in safe_fields}

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    profile = await patient_service.update_profile(user_id, update_data)
    return profile


@router.get("/me/medical-history")
async def get_my_medical_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    """Get current user's medical history."""
    user_id = current_user.get("user_id") or str(current_user.get("_id", ""))
    history = await patient_service.get_medical_history(user_id, limit=limit)
    return {"records": history, "total": len(history)}


@router.post("/me/add-record")
async def add_medical_record(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Add a medical record from chatbot diagnosis."""
    user_id = current_user.get("user_id") or str(current_user.get("_id", ""))

    record = await patient_service.add_medical_record(
        user_id=user_id,
        symptoms=data.get("symptoms", []),
        ai_diagnosis=data.get("ai_diagnosis", ""),
        confidence=data.get("confidence", 0.0),
        recommended_action=data.get("recommended_action", ""),
        language=data.get("language", "en"),
    )
    return {"message": "Record added", "record": record}


@router.get("/me/chat-history")
async def get_my_chat_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
):
    """Get current user's chat sessions."""
    user_id = current_user.get("user_id") or str(current_user.get("_id", ""))
    sessions = await patient_service.get_chat_history(user_id, limit=limit)
    return {"sessions": sessions, "total": len(sessions)}


@router.get("/me/dashboard")
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
):
    """Get dashboard summary for current user."""
    user_id = current_user.get("user_id") or str(current_user.get("_id", ""))
    stats = await patient_service.get_dashboard_stats(user_id)
    return stats
