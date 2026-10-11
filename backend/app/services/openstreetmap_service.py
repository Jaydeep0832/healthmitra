import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set

import requests
from pymongo import UpdateOne

from app.db.mongodb import get_database


logger = logging.getLogger(__name__)


class OpenStreetMapService:
    """Import nearby clinics and pharmacies from OpenStreetMap."""

    overpass_urls = (
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.private.coffee/api/interpreter",
        "https://overpass-api.de/api/interpreter",
    )
    cache_ttl_seconds = 900

    def __init__(self):
        self._cache: Dict[str, float] = {}
        self._in_flight: Set[str] = set()

    def _cache_key(self, latitude: float, longitude: float, radius_km: int) -> str:
        radius_km = min(max(radius_km, 1), 50)
        return f"{round(latitude, 2)}:{round(longitude, 2)}:{radius_km}"

    def schedule_nearby(self, latitude: float, longitude: float, radius_km: int) -> bool:
        cache_key = self._cache_key(latitude, longitude, radius_km)
        now = time.monotonic()
        if (
            now - self._cache.get(cache_key, 0) < self.cache_ttl_seconds
            or cache_key in self._in_flight
        ):
            return False

        self._in_flight.add(cache_key)
        task = asyncio.create_task(
            self.sync_nearby(latitude, longitude, radius_km, cache_key=cache_key)
        )
        task.add_done_callback(lambda _: self._in_flight.discard(cache_key))
        return True

    async def sync_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: int,
        cache_key: Optional[str] = None,
    ) -> int:
        radius_km = min(max(radius_km, 1), 50)
        cache_key = cache_key or self._cache_key(latitude, longitude, radius_km)
        now = time.monotonic()
        if now - self._cache.get(cache_key, 0) < self.cache_ttl_seconds:
            return 0

        query = self._build_query(latitude, longitude, radius_km)
        try:
            elements = await asyncio.to_thread(self._fetch, query, 8)
            facilities = self._parse_facilities(elements)
            await self._upsert(facilities)
            self._cache[cache_key] = time.monotonic()
            return len(facilities)
        except Exception as exc:
            logger.warning("OpenStreetMap facility sync skipped: %s", exc)
            self._cache[cache_key] = time.monotonic()
            return 0
        finally:
            self._in_flight.discard(cache_key)

    async def sync_region(self, region_name: str = "Gujarat") -> int:
        """Import all mapped clinics and pharmacies within an administrative region."""
        query = self._build_region_query(region_name)
        elements = await asyncio.to_thread(self._fetch, query, 180)
        facilities = self._parse_facilities(elements)
        await self._upsert(facilities)
        return len(facilities)

    def _build_query(self, latitude: float, longitude: float, radius_km: int) -> str:
        radius_meters = radius_km * 1000
        return f"""[out:json][timeout:20];
(
  nwr(around:{radius_meters},{latitude},{longitude})["amenity"~"clinic|doctors|dentist|pharmacy"];
  nwr(around:{radius_meters},{latitude},{longitude})["healthcare"~"clinic|doctor|dentist|pharmacy"];
  nwr(around:{radius_meters},{latitude},{longitude})["shop"~"chemist|pharmacy|medical_supply"];
);
out center tags;"""

    def _build_region_query(self, region_name: str) -> str:
        if region_name != "Gujarat":
            raise ValueError("Only Gujarat statewide synchronization is supported")

        return """[out:json][timeout:180];
area["name"="Gujarat"]["boundary"="administrative"]["admin_level"="4"]->.searchArea;
(
  nwr(area.searchArea)["amenity"~"clinic|doctors|dentist|pharmacy"];
  nwr(area.searchArea)["healthcare"~"clinic|doctor|dentist|pharmacy"];
  nwr(area.searchArea)["shop"~"chemist|pharmacy|medical_supply"];
);
out center tags;"""

    def _fetch(self, query: str, timeout: int = 25) -> List[Dict[str, Any]]:
        last_error: Optional[Exception] = None
        for endpoint in self.overpass_urls:
            try:
                response = requests.get(
                    endpoint,
                    params={"data": query},
                    headers={"User-Agent": "HealthMitra/2.0 healthcare locator"},
                    timeout=timeout,
                )
                response.raise_for_status()
                return response.json().get("elements", [])
            except requests.RequestException as exc:
                last_error = exc

        if last_error:
            raise last_error
        return []

    def _parse_facilities(self, elements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        facilities = []
        for element in elements:
            try:
                facility = self._to_facility(element)
            except (TypeError, ValueError):
                facility = None
            if facility:
                facilities.append(facility)
        return facilities

    async def _upsert(self, facilities: List[Dict[str, Any]]) -> None:
        if not facilities:
            return

        collection = get_database()["hospitals"]
        operations = [
            UpdateOne(
                {"source": facility["source"], "source_id": facility["source_id"]},
                {"$set": facility},
                upsert=True,
            )
            for facility in facilities
        ]
        await collection.bulk_write(operations, ordered=False)

    def _to_facility(self, element: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        tags = element.get("tags") or {}
        name = tags.get("name") or tags.get("operator")
        if not name:
            return None

        coordinates = self._coordinates(element)
        if not coordinates:
            return None

        facility_type = self._facility_type(tags)
        if not facility_type:
            return None

        district = tags.get("addr:district") or tags.get("addr:city") or ""
        address = tags.get("addr:full") or self._address(tags)
        services = self._services(tags, facility_type)
        source_id = f"osm:{element.get('type')}:{element.get('id')}"

        return {
            "name": name,
            "facility_type": facility_type,
            "hospital_type": "openstreetmap",
            "address": address or "Address unavailable",
            "location": {"type": "Point", "coordinates": coordinates},
            "contact": tags.get("contact:phone") or tags.get("phone") or "",
            "services": services,
            "bed_count": 0,
            "ambulance": False,
            "operating_hours": tags.get("opening_hours") or "Hours unavailable",
            "state": tags.get("addr:state") or "Gujarat",
            "district": district,
            "rating": 0.0,
            "source": "openstreetmap",
            "source_id": source_id,
            "updated_at": datetime.now(timezone.utc),
        }

    @staticmethod
    def _coordinates(element: Dict[str, Any]) -> Optional[List[float]]:
        if "lat" in element and "lon" in element:
            return [float(element["lon"]), float(element["lat"])]
        center = element.get("center", {})
        if "lat" in center and "lon" in center:
            return [float(center["lon"]), float(center["lat"])]
        return None

    @staticmethod
    def _facility_type(tags: Dict[str, str]) -> Optional[str]:
        if (
            tags.get("amenity") == "pharmacy"
            or tags.get("healthcare") == "pharmacy"
            or tags.get("shop") in {"chemist", "pharmacy", "medical_supply"}
        ):
            return "pharmacy"
        if (
            tags.get("amenity") in {"clinic", "doctors", "dentist"}
            or tags.get("healthcare") in {"clinic", "doctor", "dentist"}
        ):
            return "clinic"
        return None

    @staticmethod
    def _address(tags: Dict[str, str]) -> str:
        parts = [
            tags.get("addr:housenumber"),
            tags.get("addr:street"),
            tags.get("addr:suburb"),
            tags.get("addr:city"),
            tags.get("addr:postcode"),
        ]
        return ", ".join(part for part in parts if part)

    @staticmethod
    def _services(tags: Dict[str, str], facility_type: str) -> List[str]:
        services = [facility_type]
        specialties = tags.get("healthcare:speciality", "")
        services.extend(
            specialty.strip().lower().replace(" ", "_")
            for specialty in specialties.replace(";", ",").split(",")
            if specialty.strip()
        )
        return list(dict.fromkeys(services))


openstreetmap_service = OpenStreetMapService()
