from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from jose import JWTError
from app.config import settings

from app.db.mongodb import get_database
from app.models.user import UserCreate, UserResponse, Token
from app.security.auth import get_password_hash, verify_password, create_access_token
from app.security.roles import get_current_user, oauth2_scheme
from app.security.token_revocation import revoke_token
from app.security.rate_limit import login_rate_limiter, registration_rate_limiter

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate, 
    db: AsyncIOMotorDatabase = Depends(get_database),
    _: None = Depends(registration_rate_limiter),
):
    # Check if user exists
    normalized_email = str(user_in.email).lower()
    existing_user = await db["users"].find_one({"email": normalized_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Verify ASHA registration passcode if registering as asha_worker
    if user_in.role == "asha_worker":
        expected_passcode = getattr(settings, "ASHA_REGISTRATION_PASSCODE", "ASHA2026").strip()
        provided = (user_in.asha_passcode or "").strip()
        if not provided or provided.upper() != expected_passcode.upper():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ASHA registration passcode. Please provide the authorized health sub-center passcode (e.g. ASHA2026)."
            )
    
    # Hash password
    hashed_pwd = get_password_hash(user_in.password)
    
    # Create user doc
    user_doc = {
        "email": normalized_email,
        "full_name": user_in.full_name,
        "role": user_in.role,
        "asha_worker_id": user_in.asha_worker_id if user_in.role == "asha_worker" else None,
        "hashed_password": hashed_pwd,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db["users"].insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    user_doc["id"] = user_doc.pop("_id")
    
    return user_doc

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_database),
    _: None = Depends(login_rate_limiter),
):
    user = await db["users"].find_one({"email": form_data.username.strip().lower()})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user["email"], expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user["id"] = str(current_user["_id"])
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    try:
        await revoke_token(db, token)
    except (JWTError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
