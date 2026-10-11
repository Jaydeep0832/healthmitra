from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Literal, Optional, List
import logging
from app.security.roles import get_current_user
from app.services.llm_service import llm_service
from app.security.rate_limit import llm_rate_limiter

logger = logging.getLogger(__name__)

router = APIRouter()

class TriageInput(BaseModel):
    symptoms: str = Field(..., min_length=3, max_length=5000, description="Description of patient symptoms")
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

@router.post("/check", response_model=TriageOutput)
async def check_symptoms(
    triage_in: TriageInput,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(llm_rate_limiter),
):
    """
    Perform clinical triage on patient symptoms with safety guardrails and multi-language support.
    """
    # Emergency keyword heuristics for instant safety protection
    emergency_keywords = [
        "chest pain", "heart attack", "unconscious", "cannot breathe", 
        "severe bleeding", "stroke", "paralysis", "convulsion", "seizure",
        "ছাতিত বিষ", "છાતીમાં દુખાવો", "सीने में दर्द", "बेहोश", "सांस नहीं आ रही"
    ]
    
    text_lower = triage_in.symptoms.lower()
    is_critical = any(kw in text_lower for kw in emergency_keywords)

    if is_critical:
        return TriageOutput(
            urgency_level="EMERGENCY",
            urgency_color="red",
            is_emergency=True,
            title="Immediate medical attention required",
            explanation=(
                "These symptoms may indicate a life-threatening emergency. "
                "Call 108 or 112 and seek immediate hospital care."
            ),
            immediate_actions=[
                "Call 108 or 112 now",
                "Do not drive yourself; ask someone to assist",
                "Stay with the patient and keep them as comfortable as possible",
            ],
            home_care=["Do not delay emergency care for home treatment"],
            warning_signs=[
                "Worsening breathing difficulty",
                "Loss of consciousness",
                "Bluish lips or skin",
            ],
            recommended_specialist="Emergency Medicine / ICU",
            emergency_contact="108 (Ambulance) / 112 (National Emergency)",
            disclaimer=(
                "This is AI-generated health guidance, not medical advice. "
                "Consult a qualified healthcare professional."
            ),
        )

    prompt = f"""You are HealthMitra's Clinical Triage System designed for Indian healthcare settings.
Evaluate these symptoms:
Symptoms: "{triage_in.symptoms}"
Language requested: {triage_in.language}
Patient Info: Age: {triage_in.age or 'Not specified'}, Gender: {triage_in.gender or 'Not specified'}, Duration: {triage_in.duration or 'Not specified'}

Classify into one of 4 triage levels:
1. EMERGENCY: Life-threatening condition needing immediate ER/108 ambulance (e.g., suspected myocardial infarction, severe respiratory distress, acute stroke).
2. URGENT: Requires same-day doctor evaluation within 12-24 hours (e.g., high persistent fever, deep cut, severe abdominal pain).
3. ROUTINE: Non-urgent condition suitable for scheduled OPD consultation (e.g., mild cold, chronic joint pain, skin rash).
4. SELF_CARE: Mild self-limiting symptoms manageable with rest and home care (e.g., fatigue, mild headache, minor scrape).

Respond ONLY as a valid JSON object matching this schema:
{{
    "urgency_level": "EMERGENCY" or "URGENT" or "ROUTINE" or "SELF_CARE",
    "urgency_color": "red" (for EMERGENCY), "amber" (for URGENT), "blue" (for ROUTINE), or "green" (for SELF_CARE),
    "is_emergency": true/false,
    "title": "Short title in {triage_in.language} (e.g. Immediate Emergency Care Required)",
    "explanation": "Clear, empathetic explanation in {triage_in.language} without medical jargon",
    "immediate_actions": ["Action 1 in {triage_in.language}", "Action 2 in {triage_in.language}"],
    "home_care": ["Home care tip 1 in {triage_in.language}", "Tip 2 in {triage_in.language}"],
    "warning_signs": ["Red flag symptom to watch for 1", "Red flag 2"],
    "recommended_specialist": "e.g. Emergency Physician / General Physician / Cardiologist",
    "emergency_contact": "108 / 112",
    "disclaimer": "This is AI-generated health guidance, not medical advice. Consult a qualified healthcare professional."
}}
"""

    try:
        if not settings.GROQ_API_KEY or llm_service.client is None:
            raise ValueError("No Groq key configured")

        completion = await llm_service.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=llm_service.model,
            response_format={"type": "json_object"}
        )
        data = TriageOutput.model_validate(
            json.loads(completion.choices[0].message.content)
        )
        
        # Override emergency if heuristic fired
        if is_critical:
            data = data.model_copy(update={
                "urgency_level": "EMERGENCY",
                "urgency_color": "red",
                "is_emergency": True,
            })

        return data

    except Exception as e:
        logger.warning(f"Fallback triage triggered: {e}")
        # Robust deterministic fallback
        if is_critical:
            return TriageOutput(
                urgency_level="EMERGENCY",
                urgency_color="red",
                is_emergency=True,
                title="Immediate Medical Attention Required / તાત્કાલિક તબીબી સારવાર જરૂરી",
                explanation="The symptoms described may indicate a critical emergency. Please seek immediate hospital care or call 108 for an ambulance.",
                immediate_actions=[
                    "Call emergency ambulance immediately at 108 or 112",
                    "Do not drive yourself; seek assistance from family or neighbors",
                    "Keep patient in a comfortable resting position"
                ],
                home_care=["Do not take unprescribed heavy medications"],
                warning_signs=["Loss of consciousness", "Worsening shortness of breath", "Cyanosis (bluish lips)"],
                recommended_specialist="Emergency Medicine / ICU",
                emergency_contact="108 (Ambulance) / 112 (National Emergency)",
                disclaimer="This is AI-generated health guidance, not medical advice. Consult a qualified healthcare professional."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Automated triage is unavailable. If symptoms may be urgent, seek medical care or call 108/112.",
            )
