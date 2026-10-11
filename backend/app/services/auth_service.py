from app.services.database import get_database
from app.models.user import UserCreate
from app.security.auth import get_password_hash as bcrypt_hash_password, verify_password as bcrypt_verify_password
from datetime import datetime
from bson import ObjectId
import hashlib
import hmac


class AuthService:

    def hash_password(self, password: str) -> str:
        """Hash passwords with the configured bcrypt implementation."""
        return bcrypt_hash_password(password)

    def verify_password(self, plain_password: str, stored_hash: str) -> bool:
        """Verify current bcrypt hashes and legacy salted SHA-256 hashes."""
        if "$" in stored_hash and not stored_hash.startswith("$2"):
            try:
                salt, expected_hash = stored_hash.split("$", 1)
                actual_hash = hashlib.sha256((salt + plain_password).encode()).hexdigest()
                return hmac.compare_digest(actual_hash, expected_hash)
            except (ValueError, TypeError):
                return False
        try:
            return bcrypt_verify_password(plain_password, stored_hash)
        except (ValueError, TypeError):
            return False

    async def create_user(self, user_data: UserCreate) -> str:
        db = get_database()

        user_dict = {
            "full_name": user_data.full_name,
            "email": user_data.email,
            "password_hash": self.hash_password(user_data.password),
            "phone": getattr(user_data, "phone", "") or "",
            "age": getattr(user_data, "age", 0) or 0,
            "gender": getattr(user_data, "gender", "other") or "other",
            "village": getattr(user_data, "village", "") or "",
            "district": getattr(user_data, "district", "") or "",
            "state": getattr(user_data, "state", "") or "",
            "preferred_language": getattr(user_data, "preferred_language", "english"),
            "known_diseases": getattr(user_data, "known_diseases", []) or [],
            "allergies": getattr(user_data, "allergies", []) or [],
            "current_medicines": getattr(user_data, "current_medicines", []) or [],
            "emergency_contact": getattr(user_data, "emergency_contact", "") or "",
            "pregnancy_status": getattr(user_data, "pregnancy_status", False) or False,
            "role": "patient",
            "is_active": True,
            "latitude": None,
            "longitude": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = await db.users.insert_one(user_dict)
        return str(result.inserted_id)

    async def get_user_by_email(self, email: str):
        db = get_database()
        return await db.users.find_one({"email": email})

    async def authenticate_user(self, email: str, password: str):
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user["password_hash"]):
            return None
        if "$" in user["password_hash"] and not user["password_hash"].startswith("$2"):
            db = get_database()
            upgraded_hash = self.hash_password(password)
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"password_hash": upgraded_hash}}
            )
            user["password_hash"] = upgraded_hash
        return user
