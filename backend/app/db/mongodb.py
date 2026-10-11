from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    db_instance.client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=2000,
        socketTimeoutMS=5000,
    )
    db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
    await db_instance.client.admin.command("ping")
    await db_instance.db["users"].create_index("email", unique=True)
    await db_instance.db["patients"].create_index("user_id", unique=True)
    await db_instance.db["audit_logs"].create_index("timestamp")
    await db_instance.db["revoked_tokens"].create_index(
        "token_hash", unique=True
    )
    await db_instance.db["revoked_tokens"].create_index(
        "expires_at", expireAfterSeconds=0
    )
    logger.info("Connected to MongoDB.")

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_instance.client:
        db_instance.client.close()
    logger.info("MongoDB connection closed.")

def get_database():
    return db_instance.db
