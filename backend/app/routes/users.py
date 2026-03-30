from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserProfile, UserResponse
from app.services.user_service import UserService
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])
user_service = UserService()


@router.get("/profile", response_model=dict)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    try:
        user = await user_service.get_user_profile(current_user["user_id"])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return {"profile": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/profile", response_model=dict)
async def update_profile(
    profile_data: UserProfile,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    try:
        updated = await user_service.update_user_profile(
            current_user["user_id"],
            profile_data.model_dump(exclude_none=True)
        )
        return {"message": "Profile updated successfully", "profile": updated}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/location", response_model=dict)
async def update_location(
    latitude: float,
    longitude: float,
    current_user: dict = Depends(get_current_user)
):
    """Update user's current GPS location"""
    try:
        await user_service.update_user_profile(
            current_user["user_id"],
            {"latitude": latitude, "longitude": longitude}
        )
        return {"message": "Location updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )