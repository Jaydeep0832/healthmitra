from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class GeoLocation(BaseModel):
    """GeoJSON Point for MongoDB 2dsphere queries."""
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]


class HospitalBase(BaseModel):
    """Base hospital schema."""
    name: str
    hospital_type: str = Field(..., alias="type")
    address: str
    location: GeoLocation
    contact: str
    services: List[str]
    bed_count: int = 0
    ambulance: bool = False
    operating_hours: str = "24/7"
    state: str = "Gujarat"
    district: str
    rating: float = 0.0

    class Config:
        populate_by_name = True


class HospitalCreate(HospitalBase):
    """Schema for creating a hospital."""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class HospitalResponse(HospitalBase):
    """Schema for hospital API responses."""
    id: str
    distance_km: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class HospitalSearchQuery(BaseModel):
    """Query parameters for hospital search."""
    latitude: float
    longitude: float
    radius_km: int = 10
    service: Optional[str] = None
    district: Optional[str] = None
    hospital_type: Optional[str] = None
    sort_by: str = "distance"  # distance, rating, bed_count
    limit: int = 20
    page: int = 1
