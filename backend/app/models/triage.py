from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class TriageRequest(BaseModel):
    symptoms: str = Field(..., min_length=3)
    language: str = Field(default="english")
    input_type: str = Field(default="text")  # text, voice, image, pdf
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    additional_notes: Optional[str] = ""

    class Config:
        json_schema_extra = {
            "example": {
                "symptoms": "I have high fever and headache since 2 days",
                "language": "english",
                "input_type": "text",
                "latitude": 25.3176,
                "longitude": 82.9739
            }
        }


class TriageResponse(BaseModel):
    urgency_level: str  # self-care, visit-clinic, emergency
    urgency_color: str  # green, yellow, red
    confidence: float
    extracted_symptoms: List[str]
    possible_conditions: List[str]
    recommendations: List[str]
    precautions: List[str]
    medicines_info: List[Dict[str, str]]
    when_to_see_doctor: str
    disclaimer: str
    nearby_hospitals: Optional[List[dict]] = []
    translated_response: Optional[str] = None


class TriageRecord(BaseModel):
    user_id: str
    symptoms: str
    input_type: str
    language: str
    urgency_level: str
    urgency_color: str
    confidence: float
    extracted_symptoms: List[str]
    possible_conditions: List[str]
    recommendations: List[str]
    precautions: List[str]
    medicines_info: List[Dict[str, str]]
    when_to_see_doctor: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)