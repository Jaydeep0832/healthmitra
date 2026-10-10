"""
Patient Service — profile CRUD, medical history, symptom records.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from bson import ObjectId

from app.db.mongodb import get_database
from app.security.phi import (
    protect_medical_record,
    protect_profile,
    reveal_medical_record,
    reveal_chat_messages,
    reveal_medical_history,
    reveal_profile,
)


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
            legacy_profile = await collection.find_one({"userId": user_id})
            if legacy_profile:
                await collection.update_one(
                    {"_id": legacy_profile["_id"]},
                    {"$set": {"user_id": user_id}, "$unset": {"userId": ""}},
                )
                profile = legacy_profile
                profile["user_id"] = user_id
                profile.pop("userId", None)

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
            stored_profile = protect_profile(profile)
            result = await collection.insert_one(stored_profile)
            profile["_id"] = result.inserted_id

        profile = reveal_profile(profile)
        profile["id"] = str(profile.pop("_id"))
        return profile

    async def get_profile(self, user_id: str) -> Optional[Dict]:
        """Get patient profile by user_id."""
        collection = await self._get_collection()
        profile = await collection.find_one({"user_id": user_id})
        if not profile:
            profile = await collection.find_one({"userId": user_id})
            if profile:
                await collection.update_one(
                    {"_id": profile["_id"]},
                    {"$set": {"user_id": user_id}, "$unset": {"userId": ""}},
                )
                profile.pop("userId", None)
                profile["user_id"] = user_id
        if profile:
            profile = reveal_profile(profile)
            profile["id"] = str(profile.pop("_id"))
        return profile

    async def update_profile(self, user_id: str, data: Dict[str, Any]) -> Optional[Dict]:
        """Update patient profile fields."""
        collection = await self._get_collection()
        data = protect_profile(data)
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
        record = protect_medical_record(record)

        await collection.update_one(
            {"user_id": user_id},
            {
                "$push": {"medical_history": record},
                "$set": {"updated_at": datetime.utcnow()},
            },
            upsert=True,
        )
        return reveal_medical_record(record)

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

        history = reveal_medical_history(profile["medical_history"])
        history.sort(key=lambda r: r.get("date", datetime.min), reverse=True)
        return history[:limit]

    # ── Chat History ────────────────────────────────────────────────

    async def get_chat_history(self, user_id: str, limit: int = 20) -> List[Dict]:
        """Get patient's chat sessions."""
        collection = await self._get_collection()
        profile = await collection.find_one(
            {"$or": [{"user_id": user_id}, {"userId": user_id}]},
            {"chat_history": 1, "created_at": 1},
        )
        if not profile or not profile.get("chat_history"):
            return []

        messages = reveal_chat_messages(profile["chat_history"])
        return [{
            "id": str(profile["_id"]),
            "user_id": user_id,
            "messages": messages[-limit:],
            "created_at": messages[-1].get("timestamp", profile.get("created_at")),
        }]

    # ── Dashboard Stats ─────────────────────────────────────────────

    async def get_dashboard_stats(
        self, user_id: str, name: str = "", email: str = ""
    ) -> Dict[str, Any]:
        """Get dashboard summary statistics."""
        profile = await self.get_or_create_profile(user_id, name=name, email=email)
        messages = profile.get("chat_history", []) if profile else []
        consultation_count = len(messages)
        last_session = messages[-1] if messages else None

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
            "last_visit": last_session.get("timestamp") if last_session else None,
            "medical_records_count": len(medical_history),
            "health_score": health_score,
            "profile": profile,
        }

    # ── ASHA Community Health ───────────────────────────────────────

    async def get_community_patients(self, asha_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """List village patients for ASHA Worker community management."""
        collection = await self._get_collection()
        cursor = collection.find({}).sort("updated_at", -1).limit(limit)
        patients = []
        async for doc in cursor:
            doc_id = str(doc.pop("_id", ""))
            revealed = reveal_profile(doc)
            revealed["id"] = doc_id
            revealed["medical_records_count"] = len(doc.get("medical_history", []))
            revealed["consultation_count"] = len(doc.get("chat_history", []))
            # Determine risk level based on recent records
            history = doc.get("medical_history", [])
            risk = "NORMAL"
            if history:
                latest = history[-1]
                conf = latest.get("confidence", 0)
                if conf > 0.85:
                    risk = "URGENT"
            revealed["risk_level"] = doc.get("risk_level", risk)
            revealed["village"] = doc.get("village", doc.get("location") or "Primary Ward")
            patients.append(revealed)
        return patients

    async def register_community_patient(self, asha_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new rural patient under an ASHA worker's supervision."""
        import uuid
        collection = await self._get_collection()
        user_id = f"villager_{uuid.uuid4().hex[:8]}"
        patient_doc = {
            "user_id": user_id,
            "asha_id": asha_id,
            "name": data.get("name", "Village Patient"),
            "age": data.get("age"),
            "gender": data.get("gender"),
            "phone": data.get("phone"),
            "location": data.get("village", "Local Village"),
            "village": data.get("village", "Local Village"),
            "primary_condition": data.get("primary_condition", "Routine Health Check"),
            "risk_level": data.get("risk_level", "NORMAL"),
            "language": data.get("language", "gu"),
            "medical_history": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        stored = protect_profile(patient_doc)
        result = await collection.insert_one(stored)
        patient_doc["id"] = str(result.inserted_id)
        return patient_doc

    async def update_community_patient(self, patient_id_or_user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update villager health record (risk level, vitals, condition, notes)."""
        from bson import ObjectId
        collection = await self._get_collection()
        candidates = [{"user_id": patient_id_or_user_id}]
        if ObjectId.is_valid(patient_id_or_user_id):
            candidates.append({"_id": ObjectId(patient_id_or_user_id)})
        query = {"$or": candidates}

        allowed_fields = ["risk_level", "primary_condition", "village", "notes", "age", "phone", "vitals"]
        set_data = {k: v for k, v in updates.items() if k in allowed_fields}
        set_data["updated_at"] = datetime.utcnow()

        await collection.update_one(query, {"$set": set_data})
        doc = await collection.find_one(query)
        if doc:
            doc_id = str(doc.pop("_id", ""))
            revealed = reveal_profile(doc)
            revealed["id"] = doc_id
            return revealed
        return None

    async def delete_community_patient(self, patient_id_or_user_id: str) -> bool:
        """Discharge or remove villager from active roster."""
        from bson import ObjectId
        collection = await self._get_collection()
        candidates = [{"user_id": patient_id_or_user_id}]
        if ObjectId.is_valid(patient_id_or_user_id):
            candidates.append({"_id": ObjectId(patient_id_or_user_id)})
        res = await collection.delete_one({"$or": candidates})
        return res.deleted_count > 0

    async def record_community_visit(self, patient_id_or_user_id: str, visit_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Log home visit / field observation with vitals."""
        from bson import ObjectId
        collection = await self._get_collection()
        candidates = [{"user_id": patient_id_or_user_id}]
        if ObjectId.is_valid(patient_id_or_user_id):
            candidates.append({"_id": ObjectId(patient_id_or_user_id)})
        query = {"$or": candidates}

        visit_entry = {
            "date": datetime.utcnow().isoformat(),
            "bp": visit_data.get("bp"),
            "blood_sugar": visit_data.get("blood_sugar"),
            "temperature": visit_data.get("temperature"),
            "weight": visit_data.get("weight"),
            "hemoglobin": visit_data.get("hemoglobin"),
            "notes": visit_data.get("notes", ""),
            "action_taken": visit_data.get("action_taken", "Monitored vitals"),
            "follow_up_date": visit_data.get("follow_up_date"),
        }

        update_set = {"updated_at": datetime.utcnow()}
        if "risk_level" in visit_data and visit_data["risk_level"]:
            update_set["risk_level"] = visit_data["risk_level"]

        await collection.update_one(
            query,
            {
                "$push": {"home_visits": visit_entry},
                "$set": update_set,
            }
        )
        return visit_entry


patient_service = PatientService()
