from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.services.medicine_service import MedicineService
from app.utils.jwt_handler import get_current_user
from typing import Optional

router = APIRouter(prefix="/medicines", tags=["Medicines"])
medicine_service = MedicineService()


@router.get("/recommend", response_model=dict)
async def recommend_medicines(
    condition: str = Query(..., description="Medical condition"),
    current_user: dict = Depends(get_current_user)
):
    """Get medicine recommendations for a condition"""
    try:
        medicines = await medicine_service.get_recommendations(condition)
        return {
            "condition": condition,
            "medicines": medicines,
            "disclaimer": "This is for informational purposes only. Always consult a doctor before taking any medication."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/info/{medicine_name}", response_model=dict)
async def get_medicine_info(
    medicine_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed information about a medicine"""
    try:
        info = await medicine_service.get_medicine_info(medicine_name)
        if not info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medicine not found in database"
            )
        return {"medicine": info}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/interactions", response_model=dict)
async def check_interactions(
    medicine1: str = Query(...),
    medicine2: str = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Check drug interactions between two medicines"""
    try:
        interaction = await medicine_service.check_interaction(medicine1, medicine2)
        return {"interaction": interaction}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )