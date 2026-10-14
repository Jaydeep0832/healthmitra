"""
HealthMitra 2.0 — Gujarat Healthcare Facilities Seeder
Seeds hospitals, clinics, and medical stores across Gujarat into MongoDB with 2dsphere spatial indexing.
"""

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

# Sample comprehensive dataset of Gujarat Healthcare Facilities
GUJARAT_FACILITIES = [
    # ── HOSPITALS ─────────────────────────────────────────────────────────────
    {
        "name": "Civil Hospital Ahmedabad (Asia's Largest)",
        "facility_type": "hospital",
        "hospital_type": "government",
        "address": "Asarwa, Ahmedabad, Gujarat 380016",
        "location": {"type": "Point", "coordinates": [72.6040, 23.0469]},
        "contact": "+917922683721",
        "services": ["emergency", "icu", "obstetrics", "pediatrics", "general_medicine", "surgery", "orthopedics", "cardiology"],
        "bed_count": 2800,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "rating": 4.1,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:ahmedabad:civil"
    },
    {
        "name": "U.N. Mehta Institute of Cardiology & Research Centre",
        "facility_type": "hospital",
        "hospital_type": "government",
        "address": "Civil Hospital Campus, Asarwa, Ahmedabad 380016",
        "location": {"type": "Point", "coordinates": [72.6030, 23.0471]},
        "contact": "+917922684200",
        "services": ["cardiology", "cardiac_surgery", "emergency", "icu", "pediatrics"],
        "bed_count": 1251,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "rating": 4.7,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:ahmedabad:unmehta"
    },
    {
        "name": "Gujarat Cancer & Research Institute (GCRI)",
        "facility_type": "hospital",
        "hospital_type": "government",
        "address": "Civil Hospital Campus, Asarwa, Ahmedabad 380016",
        "location": {"type": "Point", "coordinates": [72.6045, 23.0465]},
        "contact": "+917922688000",
        "services": ["oncology", "radiation_therapy", "chemotherapy", "surgery", "icu"],
        "bed_count": 650,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "rating": 4.5,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:ahmedabad:gcri"
    },
    {
        "name": "New Civil Hospital Surat",
        "facility_type": "hospital",
        "hospital_type": "government",
        "address": "Majura Gate, Ring Road, Surat, Gujarat 395001",
        "location": {"type": "Point", "coordinates": [72.8258, 21.1738]},
        "contact": "+912612244456",
        "services": ["emergency", "icu", "obstetrics", "pediatrics", "general_medicine", "surgery", "orthopedics"],
        "bed_count": 1200,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Surat",
        "rating": 4.0,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:surat:newcivil"
    },
    {
        "name": "SSG Hospital Vadodara (Sir Sayajirao General Hospital)",
        "facility_type": "hospital",
        "hospital_type": "government",
        "address": "Jail Road, Anandpura, Vadodara, Gujarat 390001",
        "location": {"type": "Point", "coordinates": [73.1953, 22.3107]},
        "contact": "+912652424848",
        "services": ["emergency", "icu", "obstetrics", "pediatrics", "surgery", "cardiology", "orthopedics"],
        "bed_count": 1500,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Vadodara",
        "rating": 3.9,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:vadodara:ssg"
    },
    {
        "name": "PDU Government Medical College & Hospital Rajkot",
        "facility_type": "hospital",
        "hospital_type": "government",
        "address": "Jamnagar Road, Rajkot, Gujarat 360001",
        "location": {"type": "Point", "coordinates": [70.7980, 22.3080]},
        "contact": "+912812450431",
        "services": ["emergency", "icu", "obstetrics", "pediatrics", "general_medicine", "surgery", "orthopedics"],
        "bed_count": 1000,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Rajkot",
        "rating": 3.8,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:rajkot:pdu"
    },
    {
        "name": "Sir Takhtasinhji General Hospital Bhavnagar",
        "facility_type": "hospital",
        "hospital_type": "government",
        "address": "Kalanala, Bhavnagar, Gujarat 364001",
        "location": {"type": "Point", "coordinates": [72.1460, 21.7700]},
        "contact": "+912782424081",
        "services": ["emergency", "icu", "general_medicine", "surgery", "obstetrics", "pediatrics"],
        "bed_count": 800,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Bhavnagar",
        "rating": 3.7,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:bhavnagar:sirt"
    },
    {
        "name": "Apollo Hospital Ahmedabad",
        "facility_type": "hospital",
        "hospital_type": "multispeciality",
        "address": "Plot No 1A, Bhat GIDC Estate, Gandhinagar Highway, Ahmedabad 382428",
        "location": {"type": "Point", "coordinates": [72.6340, 23.0573]},
        "contact": "+917966701800",
        "services": ["emergency", "icu", "cardiology", "oncology", "neurology", "orthopedics", "organ_transplant"],
        "bed_count": 500,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "rating": 4.6,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:ahmedabad:apollo"
    },
    {
        "name": "Zydus Hospital Ahmedabad",
        "facility_type": "hospital",
        "hospital_type": "multispeciality",
        "address": "Zydus Hospitals Road, Nr Sola Bridge, SG Highway, Ahmedabad 380054",
        "location": {"type": "Point", "coordinates": [72.5290, 23.0469]},
        "contact": "+917966190201",
        "services": ["emergency", "icu", "cardiology", "neurology", "oncology", "orthopedics"],
        "bed_count": 400,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "rating": 4.5,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:ahmedabad:zydus"
    },
    {
        "name": "Sunshine Global Hospital Surat",
        "facility_type": "hospital",
        "hospital_type": "multispeciality",
        "address": "Dumas Road, Piplod, Surat 395007",
        "location": {"type": "Point", "coordinates": [72.7750, 21.1550]},
        "contact": "+912616777777",
        "services": ["emergency", "icu", "cardiology", "orthopedics", "gastroenterology"],
        "bed_count": 250,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Surat",
        "rating": 4.3,
        "source": "healthmitra_verified",
        "source_id": "hm:hospital:surat:sunshine"
    },

    # ── CLINICS & COMMUNITY HEALTH CENTERS (CHCs / PHCs) ───────────────────────
    {
        "name": "Urban Community Health Centre (CHC) Satellite",
        "facility_type": "clinic",
        "hospital_type": "government",
        "address": "Nr Star Bazaar, Jodhpur Gam Road, Satellite, Ahmedabad 380015",
        "location": {"type": "Point", "coordinates": [72.5180, 23.0250]},
        "contact": "+917926920044",
        "services": ["general_medicine", "obstetrics", "pediatrics", "immunization", "opd", "diagnostic_tests"],
        "bed_count": 30,
        "ambulance": True,
        "operating_hours": "08:00 - 20:00",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "rating": 4.2,
        "source": "healthmitra_verified",
        "source_id": "hm:clinic:ahmedabad:chc_satellite"
    },
    {
        "name": "Primary Health Centre (PHC) Adalaj",
        "facility_type": "clinic",
        "hospital_type": "government",
        "address": "Near Adalaj Stepwell, Gandhinagar Highway, Gandhinagar 382421",
        "location": {"type": "Point", "coordinates": [72.5800, 23.1667]},
        "contact": "+917923971200",
        "services": ["general_medicine", "maternal_care", "pediatrics", "immunization", "anti_rabies", "opd"],
        "bed_count": 12,
        "ambulance": True,
        "operating_hours": "09:00 - 17:00",
        "state": "Gujarat",
        "district": "Gandhinagar",
        "rating": 4.0,
        "source": "healthmitra_verified",
        "source_id": "hm:clinic:gandhinagar:phc_adalaj"
    },
    {
        "name": "Urban Health Centre (UHC) Katargam",
        "facility_type": "clinic",
        "hospital_type": "government",
        "address": "Gotalawadi, Katargam Road, Surat, Gujarat 395004",
        "location": {"type": "Point", "coordinates": [72.8310, 21.2250]},
        "contact": "+912612480112",
        "services": ["general_medicine", "tb_treatment", "vaccination", "pediatrics", "anc_clinic"],
        "bed_count": 10,
        "ambulance": False,
        "operating_hours": "08:30 - 17:30",
        "state": "Gujarat",
        "district": "Surat",
        "rating": 4.1,
        "source": "healthmitra_verified",
        "source_id": "hm:clinic:surat:uhc_katargam"
    },
    {
        "name": "Sanjeevani Polyclinic & Diagnostic Centre Vadodara",
        "facility_type": "clinic",
        "hospital_type": "private",
        "address": "OP Road, Alkapuri, Vadodara, Gujarat 390007",
        "location": {"type": "Point", "coordinates": [73.1720, 22.3120]},
        "contact": "+912652334411",
        "services": ["general_medicine", "diabetes_care", "gynecology", "cardiology_consult", "pathology"],
        "bed_count": 0,
        "ambulance": False,
        "operating_hours": "08:00 - 21:00",
        "state": "Gujarat",
        "district": "Vadodara",
        "rating": 4.4,
        "source": "healthmitra_verified",
        "source_id": "hm:clinic:vadodara:sanjeevani"
    },
    {
        "name": "Community Health Centre (CHC) Gondal",
        "facility_type": "clinic",
        "hospital_type": "government",
        "address": "National Highway 27, Gondal, Rajkot District 360311",
        "location": {"type": "Point", "coordinates": [70.8000, 21.9600]},
        "contact": "+912825220033",
        "services": ["emergency", "general_medicine", "obstetrics", "child_health", "surgery"],
        "bed_count": 50,
        "ambulance": True,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Rajkot",
        "rating": 3.9,
        "source": "healthmitra_verified",
        "source_id": "hm:clinic:rajkot:chc_gondal"
    },

    # ── MEDICAL STORES & JAN AUSHADHI KENDRAS ──────────────────────────────────
    {
        "name": "Pradhan Mantri Bharatiya Janaushadhi Kendra - Civil Hospital",
        "facility_type": "pharmacy",
        "hospital_type": "government",
        "address": "Gate No 3, Civil Hospital Campus, Asarwa, Ahmedabad 380016",
        "location": {"type": "Point", "coordinates": [72.6050, 23.0475]},
        "contact": "+9118001808080",
        "services": ["generic_medicines", "surgical_items", "ayush_medicines", "chronic_disease_medicines"],
        "bed_count": 0,
        "ambulance": False,
        "operating_hours": "08:00 - 22:00 (Everyday)",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "rating": 4.6,
        "source": "healthmitra_verified",
        "source_id": "hm:pharmacy:ahmedabad:janaushadhi_civil"
    },
    {
        "name": "Apollo Pharmacy 24x7 Navrangpura",
        "facility_type": "pharmacy",
        "hospital_type": "private",
        "address": "Shop 4, Ground Floor, Mithakhali Six Roads, Navrangpura, Ahmedabad 380009",
        "location": {"type": "Point", "coordinates": [72.5620, 23.0290]},
        "contact": "+917926441199",
        "services": ["emergency_medicines", "prescription_refill", "baby_care", "diabetic_supplies", "home_delivery"],
        "bed_count": 0,
        "ambulance": False,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "rating": 4.5,
        "source": "healthmitra_verified",
        "source_id": "hm:pharmacy:ahmedabad:apollo_247"
    },
    {
        "name": "PM Janaushadhi Kendra - Majura Gate Surat",
        "facility_type": "pharmacy",
        "hospital_type": "government",
        "address": "Opposite New Civil Hospital, Majura Gate, Surat 395002",
        "location": {"type": "Point", "coordinates": [72.8260, 21.1740]},
        "contact": "+912612248899",
        "services": ["generic_medicines", "low_cost_antibiotics", "cardiac_generic_drugs", "surgical_supplies"],
        "bed_count": 0,
        "ambulance": False,
        "operating_hours": "08:30 - 21:30",
        "state": "Gujarat",
        "district": "Surat",
        "rating": 4.5,
        "source": "healthmitra_verified",
        "source_id": "hm:pharmacy:surat:janaushadhi_majura"
    },
    {
        "name": "Wellness Forever Chemist 24/7 Vadodara",
        "facility_type": "pharmacy",
        "hospital_type": "private",
        "address": "Race Course Road, Near Bird Circle, Vadodara, Gujarat 390007",
        "location": {"type": "Point", "coordinates": [73.1810, 22.3160]},
        "contact": "+912652358822",
        "services": ["emergency_medicines", "critical_care_drugs", "vaccines_cold_chain", "wheelchair_rentals"],
        "bed_count": 0,
        "ambulance": False,
        "operating_hours": "24/7",
        "state": "Gujarat",
        "district": "Vadodara",
        "rating": 4.4,
        "source": "healthmitra_verified",
        "source_id": "hm:pharmacy:vadodara:wellness_forever"
    },
    {
        "name": "Janaushadhi Medical Store Rajkot Yagnik Road",
        "facility_type": "pharmacy",
        "hospital_type": "government",
        "address": "Dr Yagnik Road, Jagnath Plot, Rajkot, Gujarat 360001",
        "location": {"type": "Point", "coordinates": [70.7950, 22.2980]},
        "contact": "+912812461122",
        "services": ["generic_medicines", "hypertension_medicines", "dialysis_consumables"],
        "bed_count": 0,
        "ambulance": False,
        "operating_hours": "09:00 - 21:00",
        "state": "Gujarat",
        "district": "Rajkot",
        "rating": 4.3,
        "source": "healthmitra_verified",
        "source_id": "hm:pharmacy:rajkot:janaushadhi_yagnik"
    }
]


async def seed_facilities(mongodb_uri: str = None, db_name: str = "healthmitra"):
    """Seed comprehensive Gujarat hospitals, clinics, and medical stores."""
    if not mongodb_uri:
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

    print(f"Connecting to MongoDB at: {mongodb_uri[:35]}... (Database: {db_name})")

    client_kwargs = {
        "serverSelectionTimeoutMS": 10000,
        "connectTimeoutMS": 10000,
    }
    if "mongodb+srv://" in mongodb_uri:
        client_kwargs["tlsCAFile"] = certifi.where()

    client = AsyncIOMotorClient(mongodb_uri, **client_kwargs)
    db = client[db_name]
    collection = db["hospitals"]

    # 1. Ensure indexes
    print("Ensuring 2dsphere and search indexes...")
    await collection.create_index([("location", "2dsphere")])
    await collection.create_index("district")
    await collection.create_index("services")
    await collection.create_index("facility_type")
    await collection.create_index("hospital_type")
    await collection.create_index([("source_id", 1)], unique=True)

    # 2. Upsert facilities
    inserted = 0
    updated = 0
    for item in GUJARAT_FACILITIES:
        res = await collection.update_one(
            {"source_id": item["source_id"]},
            {"$set": item},
            upsert=True
        )
        if res.upserted_id:
            inserted += 1
        elif res.modified_count > 0:
            updated += 1

    total = await collection.count_documents({})
    print(f"Seeding Complete! Inserted: {inserted}, Updated: {updated}, Total Facilities in DB: {total}")
    client.close()
    return total


if __name__ == "__main__":
    uri = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(seed_facilities(uri))
