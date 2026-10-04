"""
Patient Service — profile CRUD, medical history, symptom records.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from bson import ObjectId

from app.db.mongodb import get_database


class PatientService:
    def __init__(self):
        self.collection_name = "patients"
        self.chat_collection = "chat_sessions"

    async def _get_collection(self):
        db = get_database()
        return db[self.collection_name]

    async def _get_chat_collection(self):
        db = get_database()
        return db[self.chat_collection]

    # ── Profile CRUD ────────────────────────────────────────────────

    async def get_or_create_profile(self, user_id: str, name: str = "", email: str = "") -> Dict:
        """Get patient profile, create if doesn't exist."""
        collection = await self._get_collection()
        profile = await collection.find_one({"user_id": user_id})

        if not profile:
            profile = {
                "user_id": user_id,
                "name": name or email.split("@")[0] if email else user_id,
                "age": None,
                "gender": None,
                "language": "en",
                "phone": None,
                "location": None,
                "medical_history": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            result = await collection.insert_one(profile)
            profile["_id"] = result.inserted_id

        profile["id"] = str(profile.pop("_id"))
        return profile

    async def get_profile(self, user_id: str) -> Optional[Dict]:
        """Get patient profile by user_id."""
        collection = await self._get_collection()
        profile = await collection.find_one({"user_id": user_id})
        if profile:
            profile["id"] = str(profile.pop("_id"))
        return profile

    async def update_profile(self, user_id: str, data: Dict[str, Any]) -> Optional[Dict]:
        """Update patient profile fields."""
        collection = await self._get_collection()
        data["updated_at"] = datetime.utcnow()

        await collection.update_one(
            {"user_id": user_id},
            {"$set": data},
            upsert=True,
        )
        return await self.get_profile(user_id)

    # ── Medical History ─────────────────────────────────────────────

    async def add_medical_record(
        self,
        user_id: str,
        symptoms: List[str],
        ai_diagnosis: str,
        confidence: float,
        recommended_action: str = "",
        language: str = "en",
    ) -> Dict:
        """Add a medical record from chatbot diagnosis."""
        collection = await self._get_collection()
        record = {
            "date": datetime.utcnow(),
            "symptoms": symptoms,
            "ai_diagnosis": ai_diagnosis,
            "confidence": confidence,
            "recommended_action": recommended_action,
            "language": language,
        }

        await collection.update_one(
            {"user_id": user_id},
            {
                "$push": {"medical_history": record},
                "$set": {"updated_at": datetime.utcnow()},
            },
            upsert=True,
        )
        return record

    async def get_medical_history(
        self, user_id: str, limit: int = 50
    ) -> List[Dict]:
        """Get patient's medical history, most recent first."""
        collection = await self._get_collection()
        profile = await collection.find_one(
            {"user_id": user_id},
            {"medical_history": 1},
        )
        if not profile or "medical_history" not in profile:
            return []

        history = profile["medical_history"]
        history.sort(key=lambda r: r.get("date", datetime.min), reverse=True)
        return history[:limit]

    # ── Chat History ────────────────────────────────────────────────

    async def get_chat_history(self, user_id: str, limit: int = 20) -> List[Dict]:
        """Get patient's chat sessions."""
        chat_col = await self._get_chat_collection()
        cursor = (
            chat_col.find({"user_id": user_id})
            .sort("created_at", -1)
            .limit(limit)
        )
        sessions = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            sessions.append(doc)
        return sessions

    # ── Dashboard Stats ─────────────────────────────────────────────

    async def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard summary statistics."""
        profile = await self.get_profile(user_id)
        chat_col = await self._get_chat_collection()

        consultation_count = await chat_col.count_documents({"user_id": user_id})

        last_session = await chat_col.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)],
        )

        medical_history = []
        if profile and "medical_history" in profile:
            medical_history = profile["medical_history"]

        # Simple health score based on recent consultations
        health_score = 85  # default
        if medical_history:
            avg_confidence = sum(
                r.get("confidence", 0) for r in medical_history[-5:]
            ) / min(len(medical_history), 5)
            health_score = max(60, min(100, int(avg_confidence * 100)))

        return {
            "consultation_count": consultation_count,
            "last_visit": last_session["created_at"] if last_session else None,
            "medical_records_count": len(medical_history),
            "health_score": health_score,
            "profile": profile,
        }


patient_service = PatientService()
