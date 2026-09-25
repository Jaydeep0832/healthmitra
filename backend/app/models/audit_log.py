from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class AuditLogCreate(BaseModel):
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AuditLogResponse(AuditLogCreate):
    id: str
