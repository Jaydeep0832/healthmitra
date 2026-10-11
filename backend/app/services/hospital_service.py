"""
Hospital Service — geospatial search, filtering, and CSV seed loader.

Uses MongoDB 2dsphere index for sub-100ms nearby queries.
"""

import csv
import os
import math
from typing import List, Optional, Dict, Any

from app.db.mongodb import get_database


EARTH_RADIUS_KM = 6371.0


class HospitalService:
    """Service layer for hospital CRUD and geospatial queries."""

    def __init__(self):
        self.collection_name = "hospitals"

    async def _get_collection(self):
        db = get_database()
        return db[self.collection_name]

    # ── Index Management ────────────────────────────────────────────

    async def ensure_indexes(self):
        """Create 2dsphere index on location field for geospatial queries."""
        collection = await self._get_collection()
        await collection.update_many(
            {"facility_type": {"$exists": False}},
            {"$set": {"facility_type": "hospital", "source": "healthmitra_seed"}},
        )
        await collection.create_index([("location", "2dsphere")])
        await collection.create_index("district")
        await collection.create_index("services")
        await collection.create_index("hospital_type")
        await collection.create_index("facility_type")
        await collection.create_index([("source", 1), ("source_id", 1)])

    # ── Seed Data ───────────────────────────────────────────────────

    async def seed_from_csv(self, csv_path: Optional[str] = None) -> int:
        """
        Load hospital data from CSV into MongoDB.
        Returns the number of hospitals inserted.
        """
        if csv_path is None:
            csv_path = os.path.join(
                os.path.dirname(__file__), "..", "db", "hospitals_data.csv"
            )

        collection = await self._get_collection()
        await self.ensure_indexes()

        # Check if already seeded
        count = await collection.count_documents({})
        if count > 0:
            return count

        hospitals = []
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                hospital = {
                    "name": row["name"].strip(),
                    "facility_type": "hospital",
                    "hospital_type": row["type"].strip(),
                    "address": row["address"].strip(),
                    "location": {
                        "type": "Point",
                        "coordinates": [
                            float(row["longitude"]),
                            float(row["latitude"]),
                        ],
                    },
                    "contact": row["contact"].strip(),
                    "services": [
                        s.strip() for s in row["services"].split(",")
                    ],
                    "bed_count": int(row["bed_count"]),
                    "ambulance": row["ambulance"].strip().lower() == "true",
                    "operating_hours": row["operating_hours"].strip(),
                    "state": row["state"].strip(),
                    "district": row["district"].strip(),
                    "rating": float(row["rating"]),
                    "source": "healthmitra_seed",
                    "source_id": f"healthmitra:{row['name'].strip().lower()}",
                }
                hospitals.append(hospital)

        if hospitals:
            await collection.insert_many(hospitals)

        return len(hospitals)

    # ── Geospatial Queries ──────────────────────────────────────────

    async def find_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: int = 10,
        service: Optional[str] = None,
        district: Optional[str] = None,
        hospital_type: Optional[str] = None,
        facility_type: Optional[str] = None,
        include_external: bool = True,
        sort_by: str = "distance",
        limit: int = 20,
        page: int = 1,
    ) -> Dict[str, Any]:
        """
        Find hospitals within radius_km of the given coordinates.
        Uses MongoDB $geoNear aggregation pipeline with 2dsphere index.
        """
        if include_external:
            from app.services.openstreetmap_service import openstreetmap_service

            openstreetmap_service.schedule_nearby(
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km,
            )

        collection = await self._get_collection()
        await self.ensure_indexes()

        radius_meters = radius_km * 1000

        # Build match filter for additional criteria
        match_filter: Dict[str, Any] = {}
        if service:
            match_filter["services"] = service
        if district:
            match_filter["district"] = {"$regex": district, "$options": "i"}
        if hospital_type:
            match_filter["hospital_type"] = {"$regex": hospital_type, "$options": "i"}
        if facility_type:
            match_filter["facility_type"] = facility_type

        # $geoNear must be the first stage in the pipeline
        pipeline: List[Dict[str, Any]] = [
            {
                "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates": [longitude, latitude],
                    },
                    "distanceField": "distance_meters",
                    "maxDistance": radius_meters,
                    "spherical": True,
                    "query": match_filter if match_filter else {},
                }
            },
            {
                "$addFields": {
                    "distance_km": {"$round": [{"$divide": ["$distance_meters", 1000]}, 2]},
                    "id": {"$toString": "$_id"},
                }
            },
            {"$project": {"_id": 0, "distance_meters": 0}},
        ]

        # Sort
        if sort_by == "rating":
            pipeline.append({"$sort": {"rating": -1}})
        elif sort_by == "bed_count":
            pipeline.append({"$sort": {"bed_count": -1}})
        else:
            # Default: distance (already sorted by $geoNear)
            pass

        # Count total before pagination
        count_pipeline = pipeline.copy()
        count_pipeline.append({"$count": "total"})
        count_result = await collection.aggregate(count_pipeline).to_list(1)
        total = count_result[0]["total"] if count_result else 0

        # Paginate
        skip = (page - 1) * limit
        pipeline.append({"$skip": skip})
        pipeline.append({"$limit": limit})

        hospitals = await collection.aggregate(pipeline).to_list(limit)

        return {
            "hospitals": hospitals,
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def get_hospital_by_id(self, hospital_id: str) -> Optional[Dict]:
        """Get a single hospital by its MongoDB _id."""
        from bson import ObjectId

        collection = await self._get_collection()
        try:
            object_id = ObjectId(hospital_id)
        except Exception:
            return None
        doc = await collection.find_one({"_id": object_id})
        if doc:
            doc["id"] = str(doc.pop("_id"))
            doc.setdefault("facility_type", "hospital")
        return doc

    async def search_by_service(
        self, service: str, state: str = "Gujarat", limit: int = 50
    ) -> List[Dict]:
        """Find hospitals offering a specific service within a state."""
        collection = await self._get_collection()
        cursor = (
            collection.find(
                {
                    "services": service,
                    "state": {"$regex": state, "$options": "i"},
                }
            )
            .sort("rating", -1)
            .limit(limit)
        )
        hospitals = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            hospitals.append(doc)
        return hospitals

    async def get_districts(self) -> List[str]:
        """Return all distinct districts."""
        collection = await self._get_collection()
        return await collection.distinct("district")

    async def get_all_services(self) -> List[str]:
        """Return all distinct services offered across hospitals."""
        collection = await self._get_collection()
        return await collection.distinct("services")

    async def get_facility_types(self) -> List[str]:
        """Return all available healthcare facility categories."""
        collection = await self._get_collection()
        return await collection.distinct("facility_type")

    async def get_stats(self) -> Dict[str, Any]:
        """Return summary statistics."""
        collection = await self._get_collection()
        total = await collection.count_documents({})
        districts = await collection.distinct("district")
        services = await collection.distinct("services")
        pipeline = [
            {"$group": {"_id": "$hospital_type", "count": {"$sum": 1}}}
        ]
        type_counts = {}
        async for doc in collection.aggregate(pipeline):
            type_counts[doc["_id"]] = doc["count"]

        return {
            "total_hospitals": total,
            "total_facilities": total,
            "districts": len(districts),
            "services": len(services),
            "by_type": type_counts,
            "by_facility_type": {
                item["_id"]: item["count"]
                async for item in collection.aggregate([
                    {"$group": {"_id": "$facility_type", "count": {"$sum": 1}}}
                ])
            },
        }

    # ── Helpers ─────────────────────────────────────────────────────

    @staticmethod
    def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate the great-circle distance between two points (km)."""
        lat1, lon1, lat2, lon2 = map(
            math.radians, [lat1, lon1, lat2, lon2]
        )
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))
        return EARTH_RADIUS_KM * c


# Singleton instance
hospital_service = HospitalService()
