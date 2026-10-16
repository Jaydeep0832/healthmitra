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

    @staticmethod
    def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate great-circle distance in kilometers between two points."""
        r = EARTH_RADIUS_KM
        p1, p2 = math.radians(lat1), math.radians(lat2)
        dp = math.radians(lat2 - lat1)
        dl = math.radians(lon2 - lon1)
        a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c

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
        Load hospital, clinic, and pharmacy data from CSV into MongoDB.
        Performs an idempotent upsert so existing records are preserved and updated.
        """
        if csv_path is None:
            csv_path = os.path.join(
                os.path.dirname(__file__), "..", "db", "hospitals_data.csv"
            )

        collection = await self._get_collection()
        await self.ensure_indexes()

        facilities = []
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row["name"].strip()
                name_lower = name.lower()
                row_type = row.get("type", "").strip()
                type_lower = row_type.lower()
                
                # Determine facility category: hospital, clinic, or pharmacy
                facility_type = row.get("facility_type", "").strip().lower()
                if not facility_type:
                    if any(w in name_lower for w in ["clinic", "dental", "dr.", "eye care", "ent hospital", "pathology", "dispensary", "polyclinic", "uphc", "phc", "child care", "veterinary"]) or type_lower in ["clinic", "dental", "veterinary", "specialty", "ayurvedic", "homeopathy"]:
                        facility_type = "clinic"
                    elif any(w in name_lower for w in ["pharmacy", "chemist", "medical store", "aushadhi", "dawa", "druggist"]) or type_lower in ["pharmacy", "medical_store"]:
                        facility_type = "pharmacy"
                    else:
                        facility_type = "hospital"

                # Parse bed count safely
                bed_count = 0
                if row.get("bed_count") and row["bed_count"].strip().isdigit():
                    bed_count = int(row["bed_count"].strip())

                facility = {
                    "name": name,
                    "facility_type": facility_type,
                    "hospital_type": row_type or ("government" if "civil" in name_lower or "uphc" in name_lower else "private"),
                    "address": row["address"].strip(),
                    "location": {
                        "type": "Point",
                        "coordinates": [
                            float(row["longitude"]),
                            float(row["latitude"]),
                        ],
                    },
                    "contact": row.get("contact", "").strip(),
                    "services": [
                        s.strip() for s in row.get("services", "").split(",") if s.strip()
                    ],
                    "bed_count": bed_count,
                    "ambulance": row.get("ambulance", "false").strip().lower() == "true",
                    "operating_hours": row.get("operating_hours", "24/7").strip(),
                    "state": row.get("state", "Gujarat").strip(),
                    "district": row.get("district", "Gujarat").strip(),
                    "rating": float(row.get("rating", 4.0)),
                    "source": "healthmitra_seed",
                    "source_id": f"healthmitra:{name_lower.replace(' ', '_')}",
                }
                facilities.append(facility)

        if facilities:
            from pymongo import UpdateOne
            operations = [
                UpdateOne(
                    {"name": f["name"], "district": f["district"]},
                    {"$set": f},
                    upsert=True
                )
                for f in facilities
            ]
            await collection.bulk_write(operations, ordered=False)

        count = await collection.count_documents({})
        return count


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
            clean_ft = facility_type.strip().lower()
            if clean_ft in ("pharmacy", "medical_store"):
                match_filter["facility_type"] = {"$in": ["pharmacy", "medical_store"]}
            else:
                match_filter["facility_type"] = clean_ft

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

        # Fallback 1: If 0 results found via radius but user filtered by district/service/facility_type,
        # perform a direct database query so facilities in distant districts are never hidden.
        if total == 0 and match_filter:
            cursor = collection.find(match_filter)
            if sort_by == "rating":
                cursor = cursor.sort("rating", -1)
            elif sort_by == "bed_count":
                cursor = cursor.sort("bed_count", -1)
            total = await collection.count_documents(match_filter)
            raw_docs = await cursor.skip(skip).limit(limit).to_list(limit)
            hospitals = []
            for d in raw_docs:
                d["id"] = str(d.pop("_id"))
                if "location" in d and "coordinates" in d["location"]:
                    h_lng, h_lat = d["location"]["coordinates"]
                    d["distance_km"] = round(self._haversine(latitude, longitude, h_lat, h_lng), 2)
                hospitals.append(d)
        elif total == 0:
            # Fallback 2: If no facilities found in strict radius, query closest facilities in Gujarat
            # so the user is never presented with a blank map or empty results.
            nearest_pipeline = [
                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [longitude, latitude],
                        },
                        "distanceField": "distance_meters",
                        "spherical": True,
                        "query": {},
                    }
                },
                {
                    "$addFields": {
                        "distance_km": {"$round": [{"$divide": ["$distance_meters", 1000]}, 2]},
                        "id": {"$toString": "$_id"},
                    }
                },
                {"$project": {"_id": 0, "distance_meters": 0}},
                {"$limit": min(limit, 50)},
            ]
            fallback_docs = await collection.aggregate(nearest_pipeline).to_list(min(limit, 50))
            if fallback_docs:
                hospitals = fallback_docs
                total = len(fallback_docs)

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
