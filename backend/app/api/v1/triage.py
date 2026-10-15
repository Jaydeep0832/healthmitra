from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Literal, Optional, List
import logging
import json
import asyncio
from app.config import settings
from app.security.roles import get_current_user
from app.services.llm_service import llm_service
from app.security.rate_limit import llm_rate_limiter

logger = logging.getLogger(__name__)

router = APIRouter()

class TriageInput(BaseModel):
    symptoms: str = Field(..., min_length=2, max_length=5000, description="Description of patient symptoms")
    language: Literal["en", "hi", "gu", "mr", "bn"] = Field(default="en", description="Target language")
    age: Optional[int] = Field(default=None, ge=0, le=120, description="Patient age in years")
    gender: Optional[str] = Field(default=None, max_length=32, description="Patient gender")
    duration: Optional[str] = Field(default=None, max_length=128, description="Duration of symptoms")
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)

class TriageOutput(BaseModel):
    urgency_level: Literal["EMERGENCY", "URGENT", "ROUTINE", "SELF_CARE"]
    urgency_color: Literal["red", "amber", "blue", "green"]
    is_emergency: bool
    title: str
    explanation: str
    immediate_actions: List[str]
    home_care: List[str]
    warning_signs: List[str]
    recommended_specialist: str
    emergency_contact: str
    disclaimer: str


def generate_clinical_triage(
    symptoms: str,
    language: str = "en",
    age: Optional[int] = None,
    gender: Optional[str] = None,
    duration: Optional[str] = None,
) -> TriageOutput:
    """
    Deterministic clinical triage decision engine.
    Ensures safe, validated medical triage guidance even when external LLM APIs are offline.
    Supports Gujarati, Hindi, English, Marathi, and Bengali.
    """
    text = symptoms.lower().strip()

    # 1. Critical Red-Flag Emergencies
    emergency_keywords = [
        "chest pain", "heart attack", "unconscious", "cannot breathe", "can't breathe",
        "severe bleeding", "stroke", "paralysis", "convulsion", "seizure", "cyanosis",
        "ছাতિત વિષ", "છાતીમાં દુખાવો", "સીને મેં દર્દ", "બેહોશ", "સાંસ નહીં આ રહી",
        "ચક્કર આવીને પડી જવું", "શ્વાસ ન ચડવો", "रक्तस्त्राव", "दौरा"
    ]
    if any(kw in text for kw in emergency_keywords):
        titles = {
            "gu": "તાત્કાલિક ઇમરજન્સી તબીબી સહાય જરૂરી (Immediate Emergency Care)",
            "hi": "तत्काल आपातकालीन चिकित्सा सहायता आवश्यक (Emergency Medical Attention)",
            "mr": "तातडीची वैद्यकीय मदत आवश्यक",
            "bn": "অবিলম্বে জরুরি চিকিৎসার প্রয়োজন",
            "en": "Immediate Emergency Medical Attention Required"
        }
        explanations = {
            "gu": "આ લક્ષણો ગંભીર તબીબી કટોકટી દર્શાવી શકે છે. કૃપા કરીને વિલંબ કર્યા વગર ૧૦૮ એમ્બ્યુલન્સ બોલાવો અથવા નજીકની ઇમરજન્સી હોસ્પિટલમાં જાઓ.",
            "hi": "ये लक्षण किसी गंभीर चिकित्सीय आपात स्थिति का संकेत हो सकते हैं। कृपया तुरंत 108 एम्बुलेंस को कॉल करें या निकटतम आपातकालीन अस्पताल जाएं।",
            "en": "The described symptoms indicate a potentially life-threatening emergency. Call 108/112 immediately and seek urgent emergency trauma or ICU care."
        }
        actions = {
            "gu": [
                "તરત જ ૧૦૮ (એમ્બ્યુલન્સ) અથવા ૧૧૨ પર કૉલ કરો",
                "વાહન જાતે ન ચલાવો; કુટુંબ અથવા પડોશીની મદદ લો",
                "દર્દીને આરામદાયક સ્થિતિમાં રાખો અને પંખા/હવા ઉજાસવાળી જગ્યાએ સુવડાવો"
            ],
            "hi": [
                "तुरंत 108 (एम्बुलेंस) या 112 पर कॉल करें",
                "स्वयं वाहन न चलाएं; तुरंत किसी की सहायता लें",
                "रोगी को आरामदायक स्थिति में लिटाएं"
            ],
            "en": [
                "Call emergency ambulance immediately at 108 or 112",
                "Do not drive yourself; seek assistance from family or bystanders",
                "Keep patient seated or resting comfortably with open airway"
            ]
        }
        return TriageOutput(
            urgency_level="EMERGENCY",
            urgency_color="red",
            is_emergency=True,
            title=titles.get(language, titles["en"]),
            explanation=explanations.get(language, explanations["en"]),
            immediate_actions=actions.get(language, actions["en"]),
            home_care=["Do not delay emergency medical care for home remedies" if language == "en" else "ઘરેલું ઉપચારમાં સમય બગાડ્યા વિના તાત્કાલિક હોસ્પિટલ પહોંચો"],
            warning_signs=["Cyanosis (bluish lips/nails)", "Loss of consciousness", "Severe shortness of breath"],
            recommended_specialist="Emergency Medicine / ICU Specialist (ઇમરજન્સી મેડિસિન)",
            emergency_contact="108 (Ambulance) / 112 (National Emergency)",
            disclaimer="Automated emergency triage safety alert. Call 108 immediately in life-threatening conditions."
        )

    # 2. Vitamin B12, Micronutrient Deficiencies, and Nutritional Anemia
    b12_keywords = [
        "b12", "vitamin", "khami", "ઉણપ", "નબળાઈ", "ખામી", "tingling", "numbness",
        "deficiency", "weakness", "વિટામિન", "બી૧૨", "બી 12", "થાક", "anemia", "enemia",
        "iron", "calcium", "કેલ્શિયમ", "પગમાં ખાલી", "ખાલી ચડવી"
    ]
    if any(kw in text for kw in b12_keywords):
        titles = {
            "gu": "વિટામિન B12 અને પોષક સ્વાસ્થ્ય મૂલ્યાંકન (Vitamin B12 Deficiency Evaluation)",
            "hi": "विटामिन बी12 की कमी और पोषण मूल्यांकन (Vitamin B12 Deficiency)",
            "mr": "व्हिटॅमिन बी 12 कमतरता आणि पोषण मूल्यमापन",
            "bn": "ভিটামিন বি১২ ঘাটতি ও পুষ্টি মূল্যায়ন",
            "en": "Vitamin B12 & Micronutrient Deficiency Assessment"
        }
        dur_str = f" (રિપોર્ટ કરેલ સમયગાળો: {duration})" if duration else ""
        explanations = {
            "gu": f"વિટામિન B12 ની ખામીને કારણે શરીરમાં અસામાન્ય નબળાઈ, સતત થાક, હાથ-પગમાં ખાલી ચડવી (ઝણઝણાટી), ચક્કર આવવા અથવા એનિમિયા જેવી અસરો થઈ શકે છે{dur_str}. આ સામાન્ય રીતે શાકાહારી આહારમાં વિટામિન B12 ની ઉણપ અથવા પાચનતંત્રમાં શોષણની અછતને લીધે થાય છે. નજીકના પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC/CHC) અથવા કન્સલ્ટિંગ તબીબ પાસે લોહીની તપાસ કરાવી યોગ્ય સપ્લિમેન્ટ્સ લેવા હિતાવહ છે.",
            "hi": f"विटामिन बी12 की कमी से अत्यधिक शारीरिक थकान, मांसपेशियों में कमजोरी, हाथ-पैरों में झनझनाहट/सुन्नपन और खून की कमी (एनीमिया) हो सकती है। डॉक्टर से सीरम बी12 और सीबीसी टेस्ट करवाकर उचित सप्लीमेंट्स लेना आवश्यक है।",
            "en": f"Vitamin B12 deficiency commonly manifests as chronic fatigue, generalized weakness, peripheral numbness/tingling (pins and needles), and megaloblastic anemia. It is prevalent with vegetarian diets or gastrointestinal malabsorption. Clinical confirmation via Serum B12 and CBC laboratory tests is recommended."
        }
        actions = {
            "gu": [
                "નજીકના પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC/CHC) અથવા જનરલ ફિઝિશિયન પાસે તપાસ કરાવો",
                "લેબોરેટરીમાં Serum Vitamin B12 અને Complete Blood Count (CBC) ટેસ્ટ કરાવો",
                "તબીબી સલાહ અનુસાર યોગ્ય વિટામિન B12 (Methylcobalamin) ની ગોળીઓ અથવા ઈન્જેક્શન શરૂ કરો",
                "બિનજરૂરી પેઇનકિલર્સ અથવા અન્ય અજાણી દવાઓ જાતે ન લેવી"
            ],
            "hi": [
                "निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) या जनरल फिजिशियन से परामर्श लें",
                "सीरम विटामिन बी12 और कम्प्लीट ब्लड काउंट (CBC) रक्त परीक्षण करवाएं",
                "चिकित्सक के निर्देशानुसार विटामिन बी12 (मिथाइलकोबालामिन) सप्लीमेंट्स शुरू करें",
                "बिना चिकित्सकीय परामर्श के पेनकिलर या एंटीबायोटिक्स न लें"
            ],
            "en": [
                "Schedule a routine OPD consultation with a General Physician at your nearest PHC/CHC",
                "Undergo Laboratory Testing: Serum Vitamin B12 and Complete Blood Count (CBC)",
                "Initiate doctor-prescribed Vitamin B12 supplementation (Methylcobalamin or Cyanocobalamin)",
                "Avoid self-medicating with unprescribed analgesics or non-steroidal anti-inflammatory drugs"
            ]
        }
        home_cares = {
            "gu": [
                "આહારમાં ડેરી ઉત્પાદનો (દૂધ, દહીં, છાશ, પનીર) નું પ્રમાણ વધારવું",
                "ફોર્ટિફાઇડ આહાર, સોયા ઉત્પાદનો અને પોષક સુપાચ્ય ખોરાક લેવો",
                "દરરોજ ૮ થી ૧૦ ગ્લાસ સ્વચ્છ પાણી પીવું અને ૭-૮ કલાકની શાંત ઊંઘ લેવી"
            ],
            "hi": [
                "आहार में दूध, दही, छाछ, पनीर और अन्य डेयरी उत्पादों की मात्रा बढ़ाएं",
                "फोर्टिफाइड अनाज, अंकुरित दालें और पौष्टिक संतुलित भोजन लें",
                "प्रतिदिन भरपूर पानी पिएं और 7-8 घंटे की पर्याप्त नींद लें"
            ],
            "en": [
                "Increase daily consumption of dairy foods (milk, yogurt, paneer, buttermilk)",
                "Incorporate fortified breakfast cereals, nutritional yeast, and balanced green vegetables",
                "Maintain adequate hydration (2-3 liters/day) and prioritize 7-8 hours of restful sleep"
            ]
        }
        warnings = {
            "gu": [
                "હાથ-પગમાં અતિશય ખાલી ચડવી અથવા ચાલવામાં સંતુલન ગુમાવવું",
                "વારંવાર ચક્કર આવીને પડી જવું અથવા યાદશક્તિમાં નોંધપાત્ર ઘટાડો",
                "અતિશય શ્વાસ ચડવો અને અસામાન્ય નબળાઈ"
            ],
            "hi": [
                "हाथ-पैरों में गंभीर सुन्नपन या चलने में संतुलन खोना",
                "अत्यधिक चक्कर आना, बेहोशी या स्मृति में कमी",
                "सांस फूलना और अत्यधिक पीलापन"
            ],
            "en": [
                "Severe peripheral neuropathy, unsteadiness, or difficulty walking",
                "Frequent fainting, sudden confusion, or severe dizziness",
                "Rapid palpitations, severe pallor, or shortness of breath at rest"
            ]
        }
        return TriageOutput(
            urgency_level="ROUTINE",
            urgency_color="blue",
            is_emergency=False,
            title=titles.get(language, titles["en"]),
            explanation=explanations.get(language, explanations["en"]),
            immediate_actions=actions.get(language, actions["en"]),
            home_care=home_cares.get(language, home_cares["en"]),
            warning_signs=warnings.get(language, warnings["en"]),
            recommended_specialist="General Physician / Internal Medicine (જનરલ ફિઝિશિયન)",
            emergency_contact="104 (Gujarat Health Helpline) / 108",
            disclaimer="આ AI-જનરેટેડ સામાન્ય સ્વાસ્થ્ય માર્ગદર્શન છે, તબીબી નિદાન કે પ્રિસ્ક્રિપ્શન નથી. કોઈપણ સારવાર શરૂ કરતા પહેલા લાયકાત ધરાવતા ડૉક્ટરની સલાહ લો." if language == "gu" else "This is AI-generated clinical triage guidance. Consult a qualified medical practitioner."
        )

    # 3. Urgent Acute Conditions (High Fever, Acute Colic, Dehydration)
    urgent_keywords = [
        "high fever", "103", "104", "vomiting blood", "severe abdominal", "acute pain",
        "deep cut", "fracture", "sudden vision loss", "તીવ્ર તાવ", "સખત પેટનો દુખાવો", "લોહીની ઉલટી", "તીવ્ર દર્દ"
    ]
    if any(kw in text for kw in urgent_keywords):
        return TriageOutput(
            urgency_level="URGENT",
            urgency_color="amber",
            is_emergency=False,
            title="Same-Day Medical Evaluation Recommended / તે જ દિવસે ડૉક્ટરને બતાવવું જરૂરી",
            explanation="Your symptoms suggest an acute condition that warrants same-day evaluation by a qualified medical professional to avoid complications.",
            immediate_actions=[
                "Visit your nearest Community Health Centre (CHC) or District Hospital OPD today",
                "Stay well-hydrated with clean boiled water or Oral Rehydration Salts (ORS)",
                "Monitor temperature and vital signs"
            ],
            home_care=["Avoid heavy or spicy foods", "Rest completely and avoid strenuous activity"],
            warning_signs=["Fever above 103°F not responding to medicine", "Inability to keep liquids down", "Persistent severe pain"],
            recommended_specialist="General Physician / Emergency OPD (જનરલ ફિઝિશિયન)",
            emergency_contact="108 / 104",
            disclaimer="This is automated triage guidance. Seek clinical care within 12-24 hours."
        )

    # 4. Standard Non-Urgent / Self-Care Conditions (Cough, Cold, Minor Headache, Indigestion)
    titles_default = {
        "gu": "આરોગ્ય મૂલ્યાંકન અને સંભાળ માર્ગદર્શન (Routine Health Consultation)",
        "hi": "स्वास्थ्य मूल्यांकन और परामर्श (Health Guidance)",
        "en": "Routine Health Assessment & Care Guidance"
    }
    explanations_default = {
        "gu": f"તમારા લક્ષણો ('{symptoms}') સામાન્ય પ્રાથમિક આરોગ્ય સ્તરે નિયંત્રિત કરી શકાય તેવા જણાય છે. જો ૨-૩ દિવસમાં રાહત ન જણાય તો પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC) ખાતે જનરલ ફિઝિશિયનનો સંપર્ક કરવો હિતાવહ છે.",
        "hi": f"आपके लक्षण सामान्य प्राथमिक स्वास्थ्य परामर्श के अंतर्गत आते हैं। यदि 2-3 दिनों में सुधार न हो, तो निकटतम स्वास्थ्य केंद्र पर चिकित्सक से परामर्श लें।",
        "en": f"The described symptoms ('{symptoms}') appear suitable for scheduled primary healthcare evaluation. If symptoms persist beyond 2-3 days, visit a local medical practitioner."
    }
    return TriageOutput(
        urgency_level="ROUTINE",
        urgency_color="blue",
        is_emergency=False,
        title=titles_default.get(language, titles_default["en"]),
        explanation=explanations_default.get(language, explanations_default["en"]),
        immediate_actions=[
            "Schedule an appointment at your local Primary Health Centre (PHC) or clinic" if language == "en" else "નજીકના પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC) ની OPD માં તપાસ કરાવો",
            "Keep a record of your symptom changes and duration" if language == "en" else "લક્ષણો અને તેના સમયગાળાની નોંધ રાખો",
            "Avoid taking over-the-counter antibiotics without prescription" if language == "en" else "ડૉક્ટરની સલાહ વિના જાતે એન્ટિબાયોટિક્સ ન લેવી"
        ],
        home_care=[
            "Drink plenty of fluids (warm water, soups, or ORS)" if language == "en" else "પુષ્કળ સ્વચ્છ પ્રવાહી (ગરમ પાણી, સૂપ અથવા છાશ) પીવો",
            "Get adequate physical rest" if language == "en" else "શરીરને પૂરતો આરામ આપો"
        ],
        warning_signs=[
            "Sudden spike in high fever",
            "Difficulty breathing or chest pressure",
            "Persistent vomiting or extreme weakness"
        ],
        recommended_specialist="General Physician / Medical Officer (મેડિકલ ઓફિસર)",
        emergency_contact="104 (Gujarat Health Helpline) / 108",
        disclaimer="આ AI-જનરેટેડ સામાન્ય આરોગ્ય માર્ગદર્શન છે. વ્યાવસાયિક તબીબી સારવાર માટે ડૉક્ટરનો સંપર્ક કરો." if language == "gu" else "This is AI-assisted health guidance, not a medical diagnosis. Consult a licensed physician for treatment."
    )


@router.post("/check", response_model=TriageOutput)
async def check_symptoms(
    triage_in: TriageInput,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(llm_rate_limiter),
):
    """
    Perform clinical triage on patient symptoms with safety guardrails and multi-language support.
    Combines Groq LLM intelligence with an offline-resilient clinical fallback engine.
    """
    # Emergency keyword heuristics for instant safety protection
    emergency_keywords = [
        "chest pain", "heart attack", "unconscious", "cannot breathe", 
        "severe bleeding", "stroke", "paralysis", "convulsion", "seizure",
        "ছাতિત વિષ", "છાતીમાં દુખાવો", "સીને મેં દર્દ", "બેહોશ", "સાંસ નહીં આ રહી"
    ]
    
    text_lower = triage_in.symptoms.lower()
    is_critical = any(kw in text_lower for kw in emergency_keywords)

    if is_critical:
        return generate_clinical_triage(
            symptoms=triage_in.symptoms,
            language=triage_in.language,
            age=triage_in.age,
            gender=triage_in.gender,
            duration=triage_in.duration,
        )

    # If Groq is configured, attempt LLM completion with strict 8-second timeout
    if settings.GROQ_API_KEY and llm_service.client is not None:
        prompt = f"""You are HealthMitra's Clinical Triage System designed for Indian healthcare settings.
Evaluate these symptoms:
Symptoms: "{triage_in.symptoms}"
Language requested: {triage_in.language}
Patient Info: Age: {triage_in.age or 'Not specified'}, Gender: {triage_in.gender or 'Not specified'}, Duration: {triage_in.duration or 'Not specified'}

Classify into one of 4 triage levels:
1. EMERGENCY: Life-threatening condition needing immediate ER/108 ambulance.
2. URGENT: Requires same-day doctor evaluation within 12-24 hours.
3. ROUTINE: Non-urgent condition suitable for scheduled OPD consultation (e.g. Vitamin B12 deficiency, cold, joint pain).
4. SELF_CARE: Mild self-limiting symptoms manageable with rest and home care.

Respond ONLY as a valid JSON object matching this schema:
{{
    "urgency_level": "EMERGENCY" or "URGENT" or "ROUTINE" or "SELF_CARE",
    "urgency_color": "red" (for EMERGENCY), "amber" (for URGENT), "blue" (for ROUTINE), or "green" (for SELF_CARE),
    "is_emergency": true/false,
    "title": "Short title in {triage_in.language}",
    "explanation": "Clear, empathetic explanation in {triage_in.language} without medical jargon",
    "immediate_actions": ["Action 1 in {triage_in.language}", "Action 2 in {triage_in.language}"],
    "home_care": ["Home care tip 1 in {triage_in.language}", "Tip 2 in {triage_in.language}"],
    "warning_signs": ["Red flag symptom to watch for 1", "Red flag 2"],
    "recommended_specialist": "e.g. General Physician / Pediatrician / Cardiologist",
    "emergency_contact": "108 / 104",
    "disclaimer": "This is AI-generated health guidance, not medical advice. Consult a qualified healthcare professional."
}}
"""
        try:
            completion = await asyncio.wait_for(
                llm_service.client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model=llm_service.model,
                    max_tokens=500,
                    response_format={"type": "json_object"}
                ),
                timeout=8.0
            )
            raw_text = completion.choices[0].message.content
            parsed = json.loads(raw_text)
            data = TriageOutput.model_validate(parsed)
            return data
        except Exception as e:
            logger.warning(f"Groq LLM triage skipped or timed out ({e}); falling back to deterministic clinical engine.")

    # Seamless deterministic clinical engine fallback (guaranteed 100% uptime)
    return generate_clinical_triage(
        symptoms=triage_in.symptoms,
        language=triage_in.language,
        age=triage_in.age,
        gender=triage_in.gender,
        duration=triage_in.duration,
    )
