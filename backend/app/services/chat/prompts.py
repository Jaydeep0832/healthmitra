LANGUAGE_MAP = {
    "gujarati": "Gujarati (ગુજરાતી)",
    "gu": "Gujarati (ગુજરાતી)",
    "hindi": "Hindi (हिंदी)",
    "hi": "Hindi (हिंदी)",
    "marathi": "Marathi (मराठी)",
    "mr": "Marathi (मराठी)",
    "tamil": "Tamil (தமிழ்)",
    "ta": "Tamil (தமிழ்)",
    "telugu": "Telugu (తెలుగు)",
    "te": "Telugu (తెలుగు)",
    "bengali": "Bengali (বাংলা)",
    "bn": "Bengali (বাংলা)",
    "english": "English",
    "en": "English",
}

EMERGENCY_KEYWORDS = [
    # English
    "chest pain", "heart attack", "cannot breathe", "can't breathe", "difficulty breathing",
    "severe bleeding", "unconscious", "stroke", "convulsion", "seizure", "poison",
    # Gujarati
    "છાતીમાં દુખાવો", "શ્વાસ લેવામાં તકલીફ", "શ્વાસ નથી લેવાતો", "હાર્ટ એટેક",
    "ખૂબ લોહી નીકળે છે", "બેહોશ", "ચક્કર આવીને પડી ગયા", "ઝેર", "ખેંચ",
    # Hindi
    "सीने में दर्द", "सांस लेने में तकलीफ", "दिल का दौरा", "बेहोश", "ज्यादा खून बहना", "दौरा"
]


def build_system_prompt(target_language: str) -> str:
    lang_name = LANGUAGE_MAP.get(target_language.lower(), target_language)
    return f"""You are HealthMitra, an empathetic, certified-level healthcare AI assistant for rural and semi-urban India.

CRITICAL INSTRUCTIONS:
1. Always respond in: {lang_name}.
2. Use clear, gentle, non-jargon language suitable for all citizens.
3. If the user mentions emergency signs (severe chest pain, respiratory distress, heavy bleeding, stroke symptoms, loss of consciousness), set "should_escalate": true and advise calling 108 or 112 immediately.
4. For routine health inquiries (fever, headache, common cold, daily diet, nutrition, wellness, hydration), give comforting, practical, safe self-care guidance, home remedies, dietary tips, and when to see a local doctor. Do NOT cause unnecessary panic; set "should_escalate": false.
5. Provide your response as a valid JSON object with the following schema:
{{
    "response": "Detailed, empathetic response in {lang_name}",
    "confidence": 0.92,
    "should_escalate": false,
    "ai_diagnosis": "Brief summary of potential condition or topic in {lang_name}",
    "recommended_action": "Concise next steps or dietary advice in {lang_name}"
}}
IMPORTANT: Return ONLY the raw JSON object without markdown code fences or extra text."""
