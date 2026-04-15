from app.services.database import get_database
from bson import ObjectId


class AdminService:

    async def get_system_stats(self) -> dict:
        """Get system statistics"""
        db = get_database()

        total_users = await db.users.count_documents({})
        total_patients = await db.users.count_documents({"role": "patient"})
        total_admins = await db.users.count_documents({"role": "admin"})
        total_triage = await db.triage_records.count_documents({})
        total_reports = await db.reports.count_documents({})
        total_hospitals = await db.hospitals.count_documents({})

        emergency_count = await db.triage_records.count_documents({"urgency_level": "emergency"})
        clinic_count = await db.triage_records.count_documents({"urgency_level": "visit-clinic"})
        selfcare_count = await db.triage_records.count_documents({"urgency_level": "self-care"})

        return {
            "total_users": total_users,
            "total_patients": total_patients,
            "total_admins": total_admins,
            "total_triage_sessions": total_triage,
            "total_reports": total_reports,
            "total_hospitals": total_hospitals,
            "triage_distribution": {
                "emergency": emergency_count,
                "visit_clinic": clinic_count,
                "self_care": selfcare_count
            }
        }

    async def get_triage_trends(self) -> dict:
        """Get triage trends"""
        db = get_database()

        pipeline = [
            {
                "$group": {
                    "_id": "$urgency_level",
                    "count": {"$sum": 1}
                }
            }
        ]

        trends = {}
        async for result in db.triage_records.aggregate(pipeline):
            trends[result["_id"]] = result["count"]

        return trends

    async def get_all_patients(self, skip: int = 0, limit: int = 50) -> dict:
        """Get all patients list for ASHA workers"""
        db = get_database()

        patients = []
        async for user in db.users.find(
            {"role": "patient"}
        ).sort("created_at", -1).skip(skip).limit(limit):
            # Get triage count for this patient
            triage_count = await db.triage_records.count_documents(
                {"user_id": str(user["_id"])}
            )
            # Get latest triage
            latest_triage = None
            async for record in db.triage_records.find(
                {"user_id": str(user["_id"])}
            ).sort("created_at", -1).limit(1):
                latest_triage = {
                    "urgency_level": record.get("urgency_level"),
                    "symptoms": record.get("symptoms", ""),
                    "created_at": str(record.get("created_at", ""))
                }

            patients.append({
                "id": str(user["_id"]),
                "full_name": user.get("full_name", ""),
                "email": user.get("email", ""),
                "phone": user.get("phone", ""),
                "age": user.get("age", 0),
                "gender": user.get("gender", ""),
                "village": user.get("village", ""),
                "district": user.get("district", ""),
                "state": user.get("state", ""),
                "known_diseases": user.get("known_diseases", []),
                "triage_count": triage_count,
                "latest_triage": latest_triage,
                "created_at": str(user.get("created_at", ""))
            })

        total = await db.users.count_documents({"role": "patient"})
        return {"patients": patients, "total": total}

    async def get_patient_detail(self, patient_id: str) -> dict:
        """Get detailed patient info with triage history"""
        db = get_database()

        user = await db.users.find_one({"_id": ObjectId(patient_id)})
        if not user:
            return None

        # Get triage history
        triage_history = []
        async for record in db.triage_records.find(
            {"user_id": patient_id}
        ).sort("created_at", -1).limit(20):
            record["id"] = str(record.pop("_id"))
            record["created_at"] = str(record.get("created_at", ""))
            triage_history.append(record)

        # Get reports
        reports = []
        async for report in db.reports.find(
            {"user_id": patient_id}
        ).sort("created_at", -1).limit(10):
            report["id"] = str(report.pop("_id"))
            report["created_at"] = str(report.get("created_at", ""))
            reports.append(report)

        return {
            "patient": {
                "id": str(user["_id"]),
                "full_name": user.get("full_name", ""),
                "email": user.get("email", ""),
                "phone": user.get("phone", ""),
                "age": user.get("age", 0),
                "gender": user.get("gender", ""),
                "village": user.get("village", ""),
                "district": user.get("district", ""),
                "state": user.get("state", ""),
                "known_diseases": user.get("known_diseases", []),
                "allergies": user.get("allergies", []),
                "current_medicines": user.get("current_medicines", []),
                "emergency_contact": user.get("emergency_contact", ""),
                "created_at": str(user.get("created_at", ""))
            },
            "triage_history": triage_history,
            "reports": reports
        }

    async def get_village_stats(self) -> dict:
        """Get village-wise health statistics"""
        db = get_database()

        pipeline = [
            {"$match": {"role": "patient"}},
            {
                "$group": {
                    "_id": {"village": "$village", "district": "$district"},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 20}
        ]

        villages = []
        async for result in db.users.aggregate(pipeline):
            loc = result["_id"]
            villages.append({
                "village": loc.get("village", "Unknown"),
                "district": loc.get("district", "Unknown"),
                "patient_count": result["count"]
            })

        return {"villages": villages}