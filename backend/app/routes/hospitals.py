from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.services.hospital_service import HospitalService
from app.utils.jwt_handler import get_current_user
from typing import Optional

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])
hospital_service = HospitalService()


@router.get("/nearby", response_model=dict)
async def get_nearby_hospitals(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius_km: float = Query(default=500.0),
    hospital_type: Optional[str] = Query(default=None),
    emergency_only: bool = Query(default=False),
    current_user: dict = Depends(get_current_user)
):
    try:
        hospitals = await hospital_service.find_nearby(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            hospital_type=hospital_type,
            emergency_only=emergency_only
        )
        return {
            "hospitals": hospitals,
            "total": len(hospitals),
            "search_radius_km": radius_km
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{hospital_id}", response_model=dict)
async def get_hospital(hospital_id: str, current_user: dict = Depends(get_current_user)):
    try:
        hospital = await hospital_service.get_hospital_by_id(hospital_id)
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")
        return {"hospital": hospital}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/seed", response_model=dict)
async def seed_hospitals():
    try:
        count = await hospital_service.seed_hospitals()
        return {"message": f"Successfully seeded {count} hospitals"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))