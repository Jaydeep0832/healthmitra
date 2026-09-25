from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from app.db.mongodb import get_database
from app.models.audit_log import AuditLogResponse
from app.security.roles import require_role

router = APIRouter()

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    HIPAA Compliance: Fetch audit logs. Only admins can access this.
    """
    cursor = db["audit_logs"].find().sort("timestamp", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    
    # Format for response
    for log in logs:
        log["id"] = str(log.pop("_id"))
        
    return logs
