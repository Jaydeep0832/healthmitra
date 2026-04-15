from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.services.admin_service import AdminService
from app.utils.jwt_handler import get_current_user
from app.services.database import get_database

router = APIRouter(prefix="/admin", tags=["Admin"])
admin_service = AdminService()


async def require_admin(current_user: dict = Depends(get_current_user)):
    """Middleware to check if user is admin/ASHA worker"""
    db = get_database()
    user = await db.users.find_one({"email": current_user["email"]})
    if not user or user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin/ASHA Worker role required."
        )
    return current_user


@router.get("/stats", response_model=dict)
async def get_stats(current_user: dict = Depends(get_current_user)):
    """Get system statistics"""
    try:
        stats = await admin_service.get_system_stats()
        return {"stats": stats}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/triage-trends", response_model=dict)
async def get_triage_trends(current_user: dict = Depends(get_current_user)):
    """Get triage distribution trends"""
    try:
        trends = await admin_service.get_triage_trends()
        return {"trends": trends}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/patients", response_model=dict)
async def get_all_patients(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: dict = Depends(require_admin)
):
    """Get all patients list — Admin/ASHA Worker only"""
    try:
        result = await admin_service.get_all_patients(skip=skip, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/patients/{patient_id}", response_model=dict)
async def get_patient_detail(
    patient_id: str,
    current_user: dict = Depends(require_admin)
):
    """Get detailed patient info — Admin/ASHA Worker only"""
    try:
        result = await admin_service.get_patient_detail(patient_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/village-stats", response_model=dict)
async def get_village_stats(current_user: dict = Depends(require_admin)):
    """Get village-wise health statistics — Admin/ASHA Worker only"""
    try:
        result = await admin_service.get_village_stats()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )