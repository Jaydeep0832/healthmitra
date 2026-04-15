from app.services.database import get_database
from bson import ObjectId
from datetime import datetime
from typing import Optional
import math


SAMPLE_HOSPITALS = [
    # Gujarat Hospitals
    {
        "name": "Civil Hospital Ahmedabad",
        "hospital_type": "Government",
        "address": "Asarwa, Ahmedabad, Gujarat",
        "district": "Ahmedabad",
        "state": "Gujarat",
        "latitude": 23.0469,
        "longitude": 72.6050,
        "phone": "079-22681234",
        "facilities": ["Emergency", "ICU", "Surgery", "Cardiology", "Lab", "X-Ray", "Blood Bank"],
        "emergency_available": True,
        "beds_available": 1800,
        "rating": 3.8,
        "open_hours": "24/7"
    },
    {
        "name": "PHC Morbi",
        "hospital_type": "PHC",
        "address": "Morbi Town, Morbi, Gujarat",
        "district": "Morbi",
        "state": "Gujarat",
        "latitude": 22.8173,
        "longitude": 70.8378,
        "phone": "02822-220123",
        "facilities": ["General OPD", "Vaccination", "Maternity", "First Aid"],
        "emergency_available": False,
        "beds_available": 10,
        "rating": 3.2,
        "open_hours": "8:00 AM - 4:00 PM"
    },
    {
        "name": "General Hospital Morbi",
        "hospital_type": "District",
        "address": "Station Road, Morbi, Gujarat",
        "district": "Morbi",
        "state": "Gujarat",
        "latitude": 22.8200,
        "longitude": 70.8350,
        "phone": "02822-221456",
        "facilities": ["Emergency", "Surgery", "Lab", "X-Ray", "ICU"],
        "emergency_available": True,
        "beds_available": 150,
        "rating": 3.5,
        "open_hours": "24/7"
    },
    {
        "name": "PHC Makansar",
        "hospital_type": "PHC",
        "address": "Makansar Village, Morbi, Gujarat",
        "district": "Morbi",
        "state": "Gujarat",
        "latitude": 22.8300,
        "longitude": 70.8500,
        "phone": "02822-222789",
        "facilities": ["General OPD", "Vaccination", "First Aid"],
        "emergency_available": False,
        "beds_available": 6,
        "rating": 3.0,
        "open_hours": "9:00 AM - 5:00 PM"
    },
    {
        "name": "Rajkot Civil Hospital",
        "hospital_type": "Government",
        "address": "Rajkot, Gujarat",
        "district": "Rajkot",
        "state": "Gujarat",
        "latitude": 22.3039,
        "longitude": 70.8022,
        "phone": "0281-2440236",
        "facilities": ["Emergency", "ICU", "All Specialties", "Lab", "Blood Bank", "Radiology"],
        "emergency_available": True,
        "beds_available": 500,
        "rating": 3.7,
        "open_hours": "24/7"
    },
    {
        "name": "GMERS Medical College Gandhinagar",
        "hospital_type": "Teaching Hospital",
        "address": "Gandhinagar, Gujarat",
        "district": "Gandhinagar",
        "state": "Gujarat",
        "latitude": 23.2156,
        "longitude": 72.6369,
        "phone": "079-23256789",
        "facilities": ["Emergency", "ICU", "All Specialties", "Trauma Centre", "Lab"],
        "emergency_available": True,
        "beds_available": 600,
        "rating": 4.0,
        "open_hours": "24/7"
    },
    {
        "name": "Sterling Hospital Ahmedabad",
        "hospital_type": "Private",
        "address": "Gurukul Road, Ahmedabad, Gujarat",
        "district": "Ahmedabad",
        "state": "Gujarat",
        "latitude": 23.0516,
        "longitude": 72.5395,
        "phone": "079-40014001",
        "facilities": ["Emergency", "ICU", "Cardiac", "Neuro", "Ortho", "Lab"],
        "emergency_available": True,
        "beds_available": 300,
        "rating": 4.3,
        "open_hours": "24/7"
    },
    {
        "name": "CHC Wankaner",
        "hospital_type": "CHC",
        "address": "Wankaner, Morbi, Gujarat",
        "district": "Morbi",
        "state": "Gujarat",
        "latitude": 22.6100,
        "longitude": 70.9500,
        "phone": "02828-220456",
        "facilities": ["General OPD", "Surgery", "Maternity", "Lab", "Emergency"],
        "emergency_available": True,
        "beds_available": 30,
        "rating": 3.4,
        "open_hours": "24/7"
    },
    {
        "name": "Saurashtra Hospital Rajkot",
        "hospital_type": "Private",
        "address": "Rajkot, Gujarat",
        "district": "Rajkot",
        "state": "Gujarat",
        "latitude": 22.2900,
        "longitude": 70.7800,
        "phone": "0281-2345678",
        "facilities": ["Emergency", "ICU", "Surgery", "Cardiology"],
        "emergency_available": True,
        "beds_available": 200,
        "rating": 4.1,
        "open_hours": "24/7"
    },
    {
        "name": "PHC Tankara",
        "hospital_type": "PHC",
        "address": "Tankara, Morbi, Gujarat",
        "district": "Morbi",
        "state": "Gujarat",
        "latitude": 22.7300,
        "longitude": 70.7400,
        "phone": "02822-234567",
        "facilities": ["General OPD", "Vaccination", "Maternity"],
        "emergency_available": False,
        "beds_available": 8,
        "rating": 3.1,
        "open_hours": "9:00 AM - 5:00 PM"
    },
    {
        "name": "Apollo Hospital Ahmedabad",
        "hospital_type": "Private",
        "address": "Bhat, Ahmedabad, Gujarat",
        "district": "Ahmedabad",
        "state": "Gujarat",
        "latitude": 23.1200,
        "longitude": 72.5800,
        "phone": "079-66701800",
        "facilities": ["Emergency", "ICU", "Cancer", "Heart", "Neuro", "Transplant"],
        "emergency_available": True,
        "beds_available": 400,
        "rating": 4.5,
        "open_hours": "24/7"
    },
    {
        "name": "Sumandeep Vidyapeeth Hospital Vadodara",
        "hospital_type": "Teaching Hospital",
        "address": "Piparia, Vadodara, Gujarat",
        "district": "Vadodara",
        "state": "Gujarat",
        "latitude": 22.3000,
        "longitude": 73.2000,
        "phone": "02668-245000",
        "facilities": ["Emergency", "ICU", "All Specialties", "Lab", "Radiology"],
        "emergency_available": True,
        "beds_available": 800,
        "rating": 4.0,
        "open_hours": "24/7"
    },
    # Delhi NCR
    {
        "name": "AIIMS New Delhi",
        "hospital_type": "Teaching Hospital",
        "address": "Ansari Nagar, New Delhi",
        "district": "New Delhi",
        "state": "Delhi",
        "latitude": 28.5672,
        "longitude": 77.2100,
        "phone": "011-26588500",
        "facilities": ["Emergency", "ICU", "All Specialties", "Trauma", "Cancer", "Research"],
        "emergency_available": True,
        "beds_available": 2500,
        "rating": 4.7,
        "open_hours": "24/7"
    },
    {
        "name": "Safdarjung Hospital Delhi",
        "hospital_type": "Government",
        "address": "Safdarjung, New Delhi",
        "district": "New Delhi",
        "state": "Delhi",
        "latitude": 28.5685,
        "longitude": 77.2040,
        "phone": "011-26165060",
        "facilities": ["Emergency", "ICU", "Surgery", "Medicine", "Lab", "Blood Bank"],
        "emergency_available": True,
        "beds_available": 1500,
        "rating": 3.8,
        "open_hours": "24/7"
    },
    # Mumbai
    {
        "name": "KEM Hospital Mumbai",
        "hospital_type": "Government",
        "address": "Parel, Mumbai, Maharashtra",
        "district": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.0019,
        "longitude": 72.8397,
        "phone": "022-24107000",
        "facilities": ["Emergency", "ICU", "All Specialties", "Trauma", "Lab"],
        "emergency_available": True,
        "beds_available": 1800,
        "rating": 4.0,
        "open_hours": "24/7"
    },
    # Bangalore
    {
        "name": "Manipal Hospital Bangalore",
        "hospital_type": "Private",
        "address": "HAL Airport Road, Bangalore",
        "district": "Bangalore",
        "state": "Karnataka",
        "latitude": 12.9591,
        "longitude": 77.6474,
        "phone": "080-25024444",
        "facilities": ["Emergency", "ICU", "Cancer", "Heart", "Neuro", "Ortho"],
        "emergency_available": True,
        "beds_available": 600,
        "rating": 4.4,
        "open_hours": "24/7"
    },
    # Chennai
    {
        "name": "Government General Hospital Chennai",
        "hospital_type": "Government",
        "address": "Park Town, Chennai, Tamil Nadu",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "phone": "044-25305000",
        "facilities": ["Emergency", "ICU", "All Specialties", "Trauma", "Lab"],
        "emergency_available": True,
        "beds_available": 2500,
        "rating": 3.9,
        "open_hours": "24/7"
    },
    # Varanasi (original hospitals)
    {
        "name": "BHU Hospital Varanasi",
        "hospital_type": "Teaching Hospital",
        "address": "BHU Campus, Varanasi, UP",
        "district": "Varanasi",
        "state": "Uttar Pradesh",
        "latitude": 25.2677,
        "longitude": 82.9913,
        "phone": "0542-2307000",
        "facilities": ["Emergency", "ICU", "All Specialties", "Lab", "Radiology"],
        "emergency_available": True,
        "beds_available": 1000,
        "rating": 4.2,
        "open_hours": "24/7"
    },
    {
        "name": "District Hospital Varanasi",
        "hospital_type": "District",
        "address": "Kabirchaura, Varanasi, UP",
        "district": "Varanasi",
        "state": "Uttar Pradesh",
        "latitude": 25.3252,
        "longitude": 83.0076,
        "phone": "0542-2501234",
        "facilities": ["Emergency", "ICU", "Surgery", "Lab", "X-Ray"],
        "emergency_available": True,
        "beds_available": 200,
        "rating": 3.6,
        "open_hours": "24/7"
    },
    {
        "name": "Hyderabad Government Hospital",
        "hospital_type": "Government",
        "address": "Afzalgunj, Hyderabad, Telangana",
        "district": "Hyderabad",
        "state": "Telangana",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "phone": "040-24600124",
        "facilities": ["Emergency", "ICU", "All Specialties", "Lab", "Blood Bank"],
        "emergency_available": True,
        "beds_available": 1200,
        "rating": 3.8,
        "open_hours": "24/7"
    },
]


class HospitalService:

    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        R = 6371
        lat1_r = math.radians(lat1)
        lat2_r = math.radians(lat2)
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = math.sin(d_lat/2)**2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(d_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return round(R * c, 2)

    @staticmethod
    def estimate_travel_time(distance_km):
        if distance_km < 5:
            return f"{int(distance_km * 5)} min by auto"
        elif distance_km < 30:
            return f"{int(distance_km * 3)} min by vehicle"
        elif distance_km < 100:
            return f"{round(distance_km / 40, 1)} hrs by vehicle"
        else:
            return f"{round(distance_km / 60, 1)} hrs by highway"

    async def seed_hospitals(self):
        db = get_database()
        existing = await db.hospitals.count_documents({})
        if existing > 0:
            return existing  # Already seeded, skip

        hospitals_to_insert = []
        for h in SAMPLE_HOSPITALS:
            hospital = dict(h)  # Create a copy to avoid mutating the original
            hospital["is_active"] = True
            hospital["created_at"] = datetime.utcnow()
            hospitals_to_insert.append(hospital)

        result = await db.hospitals.insert_many(hospitals_to_insert)
        return len(result.inserted_ids)

    async def find_nearby(self, latitude, longitude, radius_km=200.0,
                          hospital_type=None, emergency_only=False):
        db = get_database()
        query = {"is_active": True}
        if hospital_type:
            query["hospital_type"] = hospital_type
        if emergency_only:
            query["emergency_available"] = True

        hospitals = []
        async for h in db.hospitals.find(query):
            distance = self.haversine_distance(
                latitude, longitude,
                h["latitude"], h["longitude"]
            )
            if distance <= radius_km:
                hospitals.append({
                    "id": str(h["_id"]),
                    "name": h["name"],
                    "hospital_type": h["hospital_type"],
                    "address": h["address"],
                    "district": h["district"],
                    "state": h["state"],
                    "latitude": h["latitude"],
                    "longitude": h["longitude"],
                    "phone": h.get("phone", ""),
                    "facilities": h.get("facilities", []),
                    "emergency_available": h.get("emergency_available", False),
                    "beds_available": h.get("beds_available"),
                    "rating": h.get("rating", 0),
                    "open_hours": h.get("open_hours", "24/7"),
                    "distance_km": distance,
                    "estimated_travel_time": self.estimate_travel_time(distance)
                })

        hospitals.sort(key=lambda x: x["distance_km"])
        return hospitals

    async def get_hospital_by_id(self, hospital_id):
        db = get_database()
        h = await db.hospitals.find_one({"_id": ObjectId(hospital_id)})
        if h:
            h["id"] = str(h.pop("_id"))
            return h
        return None