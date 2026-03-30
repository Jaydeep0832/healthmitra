from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class HospitalModel(BaseModel):
    name: str
    hospital_type: str  # PHC, CHC, District, Private, Emergency
    address: str
    district: str
    state: str
    latitude: float
    longitude: float
    phone: str = ""
    facilities: List[str] = []
    emergency_available: bool = False
    beds_available: Optional[int] = None
    rating: float = 0.0
    open_hours: str = "24/7"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HospitalResponse(BaseModel):
    id: str
    name: str
    hospital_type: str
    address: str
    district: str
    state: str
    latitude: float
    longitude: float
    phone: str
    facilities: List[str]
    emergency_available: bool
    beds_available: Optional[int]
    rating: float
    open_hours: str
    distance_km: Optional[float] = None
    estimated_travel_time: Optional[str] = None


class NearbyHospitalRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = Field(default=50.0, le=200.0)
    hospital_type: Optional[str] = None
    emergency_only: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 25.3176,
                "longitude": 82.9739,
                "radius_km": 50.0,
                "hospital_type": None,
                "emergency_only": False
            }
        }   