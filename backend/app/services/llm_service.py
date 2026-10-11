import json
import logging
from groq import AsyncGroq
from app.config import settings
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

EMERGENCY_PHRASES = (
    "chest pain",
    "cannot breathe",
    "can't breathe",
    "severe bleeding",
    "unconscious",
    "heart attack",
    "stroke",
    "convulsion",
    "seizure",
)


class MedicalResponse(BaseModel):
    response: str = Field(min_length=1, max_length=10000)
    confidence: float = Field(ge=0, le=1)
    should_escalate: bool = False
    ai_diagnosis: str = Field(default="", max_length=500)
    recommended_action: str = Field(default="", max_length=2000)

class HealthMitraLLM:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None
        self.model = "openai/gpt-oss-20b"
        
    def set_system_prompt_for_healthcare(self, target_language: str) -> str:
        return f"""You are HealthMitra, a highly empathetic and knowledgeable healthcare AI assistant designed for rural India.
Your primary users might have low health literacy.

Guidelines:
1. Always respond in the language: {target_language}.
2. Use simple, non-jargon terms.
3. You must detect emergency red flags (e.g., severe chest pain, extreme bleeding) and instruct them to visit a hospital immediately.
4. Disclaimer: Remind the user you are an AI and this is not professional medical advice.
5. Provide your response as a JSON object with the following schema:
{{
    "response": "Your empathetic medical response here in {target_language}",
    "confidence": 0.95,
    "should_escalate": false,
    "ai_diagnosis": "Brief summary of potential condition (e.g. Common Cold)",
    "recommended_action": "Rest and hydration"
}}
"""

    async def get_medical_response(self, text: str, language: str) -> dict:
        try:
            normalized_text = text.casefold()
            if any(phrase in normalized_text for phrase in EMERGENCY_PHRASES):
                return MedicalResponse(
                    response=(
                        "These symptoms may be an emergency. Call 108 or 112 now, "
                        "do not drive yourself, and seek immediate hospital care. "
                        "This is AI-generated health guidance, not medical advice."
                    ),
                    confidence=1.0,
                    should_escalate=True,
                    ai_diagnosis="Possible medical emergency",
                    recommended_action="Call 108 or 112 immediately",
                ).model_dump()

            if not settings.GROQ_API_KEY:
                # Mock response for development without API key
                return MedicalResponse(
                    response=f"This is a mock response in {language}. I am an AI. Please consult a doctor.",
                    confidence=0.8,
                    should_escalate=False,
                    ai_diagnosis="Mock Diagnosis",
                    recommended_action="Mock action",
                ).model_dump()

            system_prompt = self.set_system_prompt_for_healthcare(language)
            
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ],
                model=self.model,
                response_format={"type": "json_object"}
            )
            
            result_str = chat_completion.choices[0].message.content
            result_json = MedicalResponse.model_validate(json.loads(result_str))
            return result_json.model_dump()
            
        except Exception as e:
            logger.error(f"LLM Error: {str(e)}")
            return {
                "response": "Sorry, I am facing some technical issues right now. Please seek a local doctor if you are unwell.",
                "confidence": 0.0,
                "should_escalate": True,
                "ai_diagnosis": "Unknown",
                "recommended_action": "Visit nearest healthcare center"
            }

llm_service = HealthMitraLLM()
