"""
Hospital API routes — geospatial search, details, seeding.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.services.hospital_service import hospital_service

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])


@router.get("/nearby")
async def find_nearby_hospitals(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius: int = Query(10, description="Search radius in km"),
    service: Optional[str] = Query(None, description="Filter by service type"),
    district: Optional[str] = Query(None, description="Filter by district"),
    type: Optional[str] = Query(None, description="Filter by hospital type"),
    sort_by: str = Query("distance", description="Sort: distance, rating, bed_count"),
    limit: int = Query(20, ge=1, le=100, description="Results per page"),
    page: int = Query(1, ge=1, description="Page number"),
):
    """
    Find hospitals near a location.
    
    Uses MongoDB 2dsphere index for fast geospatial queries.
    Response time target: <500ms.
    """
    try:
        result = await hospital_service.find_nearby(
            latitude=lat,
            longitude=lng,
            radius_km=radius,
            service=service,
            district=district,
            hospital_type=type,
            sort_by=sort_by,
            limit=limit,
            page=page,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@router.get("/search")
async def search_hospitals(
    service: str = Query(..., description="Service type to search"),
    state: str = Query("Gujarat", description="State to search in"),
    limit: int = Query(50, ge=1, le=200),
):
    """Search hospitals by service type within a state."""
    hospitals = await hospital_service.search_by_service(
        service=service, state=state, limit=limit
    )
    return {"hospitals": hospitals, "total": len(hospitals)}


@router.get("/districts")
async def get_districts():
    """Get all available districts."""
    districts = await hospital_service.get_districts()
    return {"districts": sorted(districts)}


@router.get("/services")
async def get_services():
    """Get all available service types."""
    services = await hospital_service.get_all_services()
    return {"services": sorted(services)}


@router.get("/stats")
async def get_stats():
    """Get hospital database statistics."""
    return await hospital_service.get_stats()


@router.post("/seed")
async def seed_hospitals():
    """
    Seed hospital data from CSV.
    Idempotent — skips if data already exists.
    """
    try:
        count = await hospital_service.seed_from_csv()
        return {
            "message": f"Hospital data ready ({count} hospitals)",
            "count": count,
        }
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="Hospital CSV data file not found",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Seed error: {str(e)}",
        )


@router.get("/{hospital_id}")
async def get_hospital(hospital_id: str):
    """Get details of a specific hospital."""
    hospital = await hospital_service.get_hospital_by_id(hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital
