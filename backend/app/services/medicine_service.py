from typing import Optional


MEDICINE_DATABASE = {
    "paracetamol": {
        "name": "Paracetamol (Acetaminophen)",
        "brand_names": ["Crocin", "Dolo", "Calpol", "Tylenol"],
        "uses": ["Fever", "Headache", "Body pain", "Cold"],
        "dosage": "Adults: 500-650mg every 4-6 hours. Max 4g/day",
        "side_effects": ["Nausea", "Liver damage (overdose)", "Allergic reaction (rare)"],
        "precautions": ["Do not exceed recommended dose", "Avoid with alcohol", "Consult doctor if liver disease"],
        "type": "OTC",
        "price_range": "₹10-30"
    },
    "ibuprofen": {
        "name": "Ibuprofen",
        "brand_names": ["Brufen", "Combiflam", "Ibugesic"],
        "uses": ["Pain", "Inflammation", "Fever", "Arthritis"],
        "dosage": "Adults: 200-400mg every 6-8 hours with food",
        "side_effects": ["Stomach upset", "Nausea", "Dizziness", "Kidney issues (long-term)"],
        "precautions": ["Take with food", "Avoid if stomach ulcer", "Not for pregnant women"],
        "type": "OTC",
        "price_range": "₹15-50"
    },
    "cetirizine": {
        "name": "Cetirizine",
        "brand_names": ["Alerid", "Cetzine", "Zyrtec"],
        "uses": ["Allergy", "Runny nose", "Sneezing", "Itching", "Hives"],
        "dosage": "Adults: 10mg once daily",
        "side_effects": ["Drowsiness", "Dry mouth", "Fatigue"],
        "precautions": ["May cause drowsiness - avoid driving", "Avoid alcohol"],
        "type": "OTC",
        "price_range": "₹10-40"
    },
    "omeprazole": {
        "name": "Omeprazole",
        "brand_names": ["Omez", "Ocid", "Prilosec"],
        "uses": ["Acidity", "GERD", "Stomach ulcer", "Heartburn"],
        "dosage": "20mg once daily before breakfast",
        "side_effects": ["Headache", "Nausea", "Diarrhea", "Vitamin B12 deficiency (long-term)"],
        "precautions": ["Take before meals", "Not for long-term use without prescription"],
        "type": "OTC",
        "price_range": "₹30-80"
    },
    "azithromycin": {
        "name": "Azithromycin",
        "brand_names": ["Azithral", "Zithromax", "Azee"],
        "uses": ["Bacterial infections", "Respiratory infections", "Ear infection", "Throat infection"],
        "dosage": "500mg once daily for 3 days (as prescribed)",
        "side_effects": ["Nausea", "Diarrhea", "Stomach pain", "Headache"],
        "precautions": ["Complete full course", "Take on empty stomach", "Prescription only"],
        "type": "Prescription",
        "price_range": "₹50-150"
    },
    "ors": {
        "name": "ORS (Oral Rehydration Salt)",
        "brand_names": ["Electral", "ORS WHO"],
        "uses": ["Dehydration", "Diarrhea", "Vomiting", "Heatstroke"],
        "dosage": "Dissolve 1 packet in 1 liter of clean water. Sip frequently.",
        "side_effects": ["None when used correctly"],
        "precautions": ["Use clean water", "Discard after 24 hours", "Safe for all ages"],
        "type": "OTC",
        "price_range": "₹5-20"
    },
    "metformin": {
        "name": "Metformin",
        "brand_names": ["Glycomet", "Glucophage"],
        "uses": ["Type 2 Diabetes"],
        "dosage": "500mg-1000mg twice daily with meals (as prescribed)",
        "side_effects": ["Nausea", "Diarrhea", "Stomach upset", "Metallic taste"],
        "precautions": ["Take with food", "Monitor blood sugar", "Prescription only"],
        "type": "Prescription",
        "price_range": "₹20-80"
    }
}


DRUG_INTERACTIONS = {
    ("paracetamol", "ibuprofen"): {
        "severity": "low",
        "description": "Generally safe to use together but avoid prolonged combined use",
        "recommendation": "Can be alternated for better pain/fever control"
    },
    ("ibuprofen", "azithromycin"): {
        "severity": "low",
        "description": "No significant interaction, but both can cause stomach upset",
        "recommendation": "Take ibuprofen with food"
    },
    ("metformin", "ibuprofen"): {
        "severity": "medium",
        "description": "NSAIDs may affect kidney function and alter metformin levels",
        "recommendation": "Use with caution, consult doctor"
    },
    ("omeprazole", "metformin"): {
        "severity": "low",
        "description": "Omeprazole may slightly increase metformin absorption",
        "recommendation": "Generally safe, monitor blood sugar"
    }
}


class MedicineService:

    async def get_recommendations(self, condition: str) -> list:
        """Get medicine recommendations for a condition"""
        condition_lower = condition.lower()
        recommendations = []

        for med_key, med_info in MEDICINE_DATABASE.items():
            for use in med_info["uses"]:
                if condition_lower in use.lower() or use.lower() in condition_lower:
                    recommendations.append(med_info)
                    break

        if not recommendations:
            recommendations.append({
                "name": "Consult a Doctor",
                "brand_names": [],
                "uses": [condition],
                "dosage": "As prescribed by doctor",
                "side_effects": [],
                "precautions": ["Please visit a doctor for proper diagnosis and medication"],
                "type": "Prescription",
                "price_range": "Varies"
            })

        return recommendations

    async def get_medicine_info(self, medicine_name: str) -> dict:
        """Get detailed info about a medicine"""
        name_lower = medicine_name.lower().strip()

        # Direct match
        if name_lower in MEDICINE_DATABASE:
            return MEDICINE_DATABASE[name_lower]

        # Search by brand name
        for key, info in MEDICINE_DATABASE.items():
            for brand in info["brand_names"]:
                if name_lower in brand.lower():
                    return info

        # Partial match
        for key, info in MEDICINE_DATABASE.items():
            if name_lower in key or key in name_lower:
                return info

        return None

    async def check_interaction(self, medicine1: str, medicine2: str) -> dict:
        """Check drug interaction between two medicines"""
        med1 = medicine1.lower().strip()
        med2 = medicine2.lower().strip()

        # Check both orderings
        key1 = (med1, med2)
        key2 = (med2, med1)

        if key1 in DRUG_INTERACTIONS:
            return DRUG_INTERACTIONS[key1]
        elif key2 in DRUG_INTERACTIONS:
            return DRUG_INTERACTIONS[key2]
        else:
            return {
                "severity": "unknown",
                "description": f"No interaction data available for {medicine1} and {medicine2}",
                "recommendation": "Consult a doctor or pharmacist for interaction information"
            }