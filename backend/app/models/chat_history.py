from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

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
    text: str
    language: str
