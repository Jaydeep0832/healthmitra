from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal, Optional, List

class ChatMessage(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_message: str
    ai_response: str
    language: str
    confidence: float
    ai_diagnosis: Optional[str] = None
    should_escalate: bool = False

class ChatSessionCreate(BaseModel):
    user_id: str
    session_id: str
    messages: List[ChatMessage] = []
    duration_seconds: int = 0
    resolved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatSessionResponse(ChatSessionCreate):
    id: str

class ChatRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    language: Literal["auto", "en", "hi", "gu", "mr", "bn"]
    session_id: Optional[str] = None
