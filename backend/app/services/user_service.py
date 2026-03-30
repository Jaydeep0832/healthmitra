from app.services.database import get_database
from bson import ObjectId
from datetime import datetime


class UserService:

    async def get_user_profile(self, user_id: str) -> dict:
        db = get_database()
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["id"] = str(user.pop("_id"))
            user.pop("password_hash", None)
            if "created_at" in user:
                user["created_at"] = str(user["created_at"])
            if "updated_at" in user:
                user["updated_at"] = str(user["updated_at"])
            return user
        return None

    async def update_user_profile(self, user_id: str, update_data: dict) -> dict:
        db = get_database()
        update_data["updated_at"] = datetime.utcnow()

        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

        return await self.get_user_profile(user_id)

    async def get_all_users(self) -> list:
        db = get_database()
        users = []
        async for user in db.users.find():
            user["id"] = str(user.pop("_id"))
            user.pop("password_hash", None)
            users.append(user)
        return users