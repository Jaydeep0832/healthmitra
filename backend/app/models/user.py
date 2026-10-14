from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    role: str = Field(default="patient") # 'patient', 'doctor', 'admin', 'asha_worker'
    full_name: Optional[str] = None

class UserCreate(UserBase):
    # Public registration allows patient or passcode-protected asha_worker
    role: Literal['patient', 'asha_worker'] = 'patient'
    password: str = Field(..., min_length=7, max_length=128)
    asha_passcode: Optional[str] = Field(default=None, max_length=64)
    asha_worker_id: Optional[str] = Field(default=None, max_length=64)

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    id: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
