from app.services.database import get_database


class AdminService:

    async def get_system_stats(self) -> dict:
        """Get system statistics"""
        db = get_database()

        total_users = await db.users.count_documents({})
        total_triage = await db.triage_records.count_documents({})
        total_reports = await db.reports.count_documents({})
        total_hospitals = await db.hospitals.count_documents({})

        emergency_count = await db.triage_records.count_documents({"urgency_level": "emergency"})
        clinic_count = await db.triage_records.count_documents({"urgency_level": "visit-clinic"})
        selfcare_count = await db.triage_records.count_documents({"urgency_level": "self-care"})

        return {
            "total_users": total_users,
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