"""
Patient API routes — profile, medical history, dashboard stats.
"""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from typing import Literal, Optional, List

from app.security.roles import get_current_user, require_role
from app.services.patient_service import patient_service

router = APIRouter(prefix="/patients", tags=["Patients"])


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=200)
    age: Optional[int] = Field(default=None, ge=0, le=120)
    gender: Optional[str] = Field(default=None, max_length=32)
    language: Optional[Literal["en", "hi", "gu", "mr", "bn"]] = None
    phone: Optional[str] = Field(default=None, max_length=32)
    location: Optional[str] = Field(default=None, max_length=200)


class MedicalRecordCreate(BaseModel):
    symptoms: List[str] = Field(default_factory=list, max_length=20)
    ai_diagnosis: str = Field(default="", max_length=500)
    confidence: float = Field(default=0.0, ge=0, le=1)
    recommended_action: str = Field(default="", max_length=2000)
    language: Literal["en", "hi", "gu", "mr", "bn"] = "en"


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
    data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update current user's patient profile."""
    user_id = current_user.get("user_id") or str(current_user.get("_id", ""))

    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    profile = await patient_service.update_profile(user_id, update_data)
    return profile


@router.get("/me/medical-history")
async def get_my_medical_history(
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    """Get current user's medical history."""
    user_id = current_user.get("user_id") or str(current_user.get("_id", ""))
    history = await patient_service.get_medical_history(user_id, limit=limit)
    return {"records": history, "total": len(history)}


@router.post("/me/add-record")
async def add_medical_record(
    data: MedicalRecordCreate,
    current_user: dict = Depends(get_current_user),
):
    """Add a medical record from chatbot diagnosis."""
    user_id = current_user.get("user_id") or str(current_user.get("_id", ""))

    record = await patient_service.add_medical_record(
        user_id=user_id,
        symptoms=data.symptoms,
        ai_diagnosis=data.ai_diagnosis,
        confidence=data.confidence,
        recommended_action=data.recommended_action,
        language=data.language,
    )
    return {"message": "Record added", "record": record}


@router.get("/me/chat-history")
async def get_my_chat_history(
    limit: int = Query(20, ge=1, le=200),
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
    email = current_user.get("email", "")
    name = current_user.get("full_name", "") or current_user.get("name", "")
    stats = await patient_service.get_dashboard_stats(user_id, name=name, email=email)
    return stats


# ── ASHA Worker Community Endpoints ─────────────────────────────────

class CommunityPatientCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    age: Optional[int] = Field(default=None, ge=0, le=120)
    gender: Optional[str] = Field(default=None, max_length=32)
    phone: Optional[str] = Field(default=None, max_length=32)
    village: Optional[str] = Field(default="Primary Ward", max_length=200)
    primary_condition: Optional[str] = Field(default="Routine Checkup", max_length=200)
    risk_level: Optional[Literal["NORMAL", "URGENT", "EMERGENCY"]] = "NORMAL"
    language: Optional[Literal["en", "hi", "gu", "mr", "bn"]] = "gu"


@router.get("/community")
async def get_community_patients(
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_role("asha_worker")),
):
    """Get village patient roster for ASHA workers."""
    asha_id = current_user.get("user_id") or str(current_user.get("_id", ""))
    patients = await patient_service.get_community_patients(asha_id=asha_id, limit=limit)
    return {"patients": patients, "total": len(patients)}


@router.post("/community/register")
async def register_community_patient(
    data: CommunityPatientCreate,
    current_user: dict = Depends(require_role("asha_worker")),
):
    """Register a new village patient under ASHA worker care."""
    asha_id = current_user.get("user_id") or str(current_user.get("_id", ""))
    patient = await patient_service.register_community_patient(asha_id=asha_id, data=data.model_dump())
    return {"message": "Village patient registered successfully", "patient": patient}


class CommunityPatientUpdate(BaseModel):
    risk_level: Optional[Literal["NORMAL", "URGENT", "EMERGENCY"]] = None
    primary_condition: Optional[str] = Field(default=None, max_length=200)
    village: Optional[str] = Field(default=None, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=1000)
    age: Optional[int] = Field(default=None, ge=0, le=120)
    phone: Optional[str] = Field(default=None, max_length=32)
    vitals: Optional[dict] = None


@router.patch("/community/{patient_id}")
async def update_community_patient(
    patient_id: str,
    data: CommunityPatientUpdate,
    current_user: dict = Depends(require_role("asha_worker")),
):
    """Update villager health condition, risk status, or vitals."""
    updates = data.model_dump(exclude_unset=True)
    updated = await patient_service.update_community_patient(patient_id, updates)
    if not updated:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Villager patient record not found")
    return {"message": "Patient record updated successfully", "patient": updated}


@router.delete("/community/{patient_id}")
async def delete_community_patient(
    patient_id: str,
    current_user: dict = Depends(require_role("asha_worker")),
):
    """Discharge or remove villager from active care roster."""
    deleted = await patient_service.delete_community_patient(patient_id)
    if not deleted:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Villager patient record not found")
    return {"message": "Patient discharged/removed from community roster successfully"}


class CommunityVisitCreate(BaseModel):
    bp: Optional[str] = Field(default=None, max_length=32)
    blood_sugar: Optional[str] = Field(default=None, max_length=32)
    temperature: Optional[str] = Field(default=None, max_length=32)
    weight: Optional[str] = Field(default=None, max_length=32)
    hemoglobin: Optional[str] = Field(default=None, max_length=32)
    notes: Optional[str] = Field(default="", max_length=1000)
    action_taken: Optional[str] = Field(default="Field visit vitals logged", max_length=300)
    follow_up_date: Optional[str] = Field(default=None, max_length=64)
    risk_level: Optional[Literal["NORMAL", "URGENT", "EMERGENCY"]] = None


@router.post("/community/{patient_id}/visit")
async def log_community_visit(
    patient_id: str,
    data: CommunityVisitCreate,
    current_user: dict = Depends(require_role("asha_worker")),
):
    """Log a home visit or vitals observation for a villager."""
    entry = await patient_service.record_community_visit(patient_id, data.model_dump())
    return {"message": "Visit observation recorded successfully", "visit": entry}
