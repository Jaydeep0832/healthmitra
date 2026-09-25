from app.db.mongodb import get_database
from app.models.audit_log import AuditLogCreate
import logging

logger = logging.getLogger(__name__)

async def log_access(
    action: str, 
    resource_type: str, 
    user_id: str = None, 
    resource_id: str = None, 
    ip_address: str = None, 
    details: dict = None
):
    """
    HIPAA Compliant Audit Logging.
    Logs who accessed what and when.
    """
    try:
        db = get_database()
        if db is not None:
            audit_entry = AuditLogCreate(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=ip_address,
                details=details
            )
            await db["audit_logs"].insert_one(audit_entry.dict())
        else:
            logger.warning("Database not connected. Skipping audit log.")
    except Exception as e:
        logger.error(f"Failed to write audit log: {str(e)}")
