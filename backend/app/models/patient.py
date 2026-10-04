from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


class MedicalRecord(BaseModel):
    """A single medical record from chatbot interaction."""
    date: datetime = Field(default_factory=datetime.utcnow)
    symptoms: List[str] = []
    ai_diagnosis: Optional[str] = None
    confidence: float = 0.0
    recommended_action: Optional[str] = None
    language: str = "en"


class PatientProfile(BaseModel):
    """Patient profile stored in MongoDB."""
    user_id: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    language: str = "en"
    phone: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    medical_history: List[MedicalRecord] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PatientProfileUpdate(BaseModel):
    """Fields that can be updated."""
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    language: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[Dict[str, Any]] = None


class PatientProfileResponse(PatientProfile):
    """API response for patient profile."""
    id: str
    consultation_count: int = 0
    last_visit: Optional[datetime] = None
