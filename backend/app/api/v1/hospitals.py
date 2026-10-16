"""
Hospital API routes — geospatial search, details, seeding.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
import logging

from app.services.hospital_service import hospital_service
from app.security.roles import require_role

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])
logger = logging.getLogger(__name__)


def _database_unavailable() -> HTTPException:
    return HTTPException(
        status_code=503,
        detail="Healthcare facility data is temporarily unavailable.",
    )


@router.get("/nearby")
async def find_nearby_hospitals(
    lat: float = Query(..., ge=-90, le=90, description="User latitude"),
    lng: float = Query(..., ge=-180, le=180, description="User longitude"),
    radius: int = Query(10, ge=1, le=1000, description="Search radius in km"),
    service: Optional[str] = Query(None, description="Filter by service type"),
    district: Optional[str] = Query(None, description="Filter by district"),
    type: Optional[str] = Query(None, description="Filter by hospital type"),
    facility_type: Optional[str] = Query(
        None, description="Filter by facility: hospital, clinic, or pharmacy"
    ),
    include_external: bool = Query(
        True, description="Import nearby clinics and pharmacies from OpenStreetMap"
    ),
    sort_by: str = Query("distance", description="Sort: distance, rating, bed_count"),
    limit: int = Query(20, ge=1, le=500, description="Results per page"),
    page: int = Query(1, ge=1, description="Page number"),
):
    """
    Find healthcare facilities near a location.
    
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
            facility_type=facility_type,
            include_external=include_external,
            sort_by=sort_by,
            limit=limit,
            page=page,
        )
        return result
    except Exception as exc:
        logger.warning("Hospital nearby search failed: %s", type(exc).__name__)
        raise _database_unavailable() from exc


@router.get("/search")
async def search_hospitals(
    service: str = Query(..., description="Service type to search"),
    state: str = Query("Gujarat", description="State to search in"),
    limit: int = Query(50, ge=1, le=200),
):
    """Search hospitals by service type within a state."""
    try:
        hospitals = await hospital_service.search_by_service(
            service=service, state=state, limit=limit
        )
    except Exception as exc:
        logger.warning("Hospital service search failed: %s", type(exc).__name__)
        raise _database_unavailable() from exc
    return {"hospitals": hospitals, "total": len(hospitals)}


@router.get("/districts")
async def get_districts():
    """Get all available districts."""
    try:
        districts = await hospital_service.get_districts()
    except Exception as exc:
        logger.warning("Hospital district lookup failed: %s", type(exc).__name__)
        raise _database_unavailable() from exc
    return {"districts": sorted(districts)}


@router.get("/services")
async def get_services():
    """Get all available service types."""
    try:
        services = await hospital_service.get_all_services()
    except Exception as exc:
        logger.warning("Hospital service lookup failed: %s", type(exc).__name__)
        raise _database_unavailable() from exc
    return {"services": sorted(services)}


@router.get("/facility-types")
async def get_facility_types():
    """Get all available healthcare facility categories."""
    try:
        facility_types = await hospital_service.get_facility_types()
    except Exception as exc:
        logger.warning("Facility type lookup failed: %s", type(exc).__name__)
        raise _database_unavailable() from exc
    return {"facility_types": sorted(facility_types)}


@router.get("/stats")
async def get_stats():
    """Get hospital database statistics."""
    try:
        return await hospital_service.get_stats()
    except Exception as exc:
        logger.warning("Hospital statistics lookup failed: %s", type(exc).__name__)
        raise _database_unavailable() from exc


@router.post("/seed")
async def seed_hospitals(current_user: dict = Depends(require_role("admin"))):
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


@router.post("/sync-gujarat")
async def sync_gujarat_facilities(current_user: dict = Depends(require_role("admin"))):
    """Synchronize mapped clinics and pharmacies across Gujarat."""
    from app.services.openstreetmap_service import openstreetmap_service

    try:
        count = await openstreetmap_service.sync_region("Gujarat")
        return {
            "message": f"Gujarat facility data ready ({count} records)",
            "count": count,
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gujarat sync error: {str(e)}")


@router.get("/{hospital_id}")
async def get_hospital(hospital_id: str):
    """Get details of a specific hospital."""
    try:
        hospital = await hospital_service.get_hospital_by_id(hospital_id)
    except Exception as exc:
        logger.warning("Hospital detail lookup failed: %s", type(exc).__name__)
        raise _database_unavailable() from exc
    if not hospital:
        raise HTTPException(status_code=404, detail="Healthcare facility not found")
    return hospital
