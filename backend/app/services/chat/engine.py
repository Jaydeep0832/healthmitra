import logging
from typing import Dict, Any

from .models import MedicalResponse
from .prompts import EMERGENCY_KEYWORDS
from .groq_client import GroqChatClient
from .clinical_fallback import get_emergency_response, get_clinical_fallback_response

logger = logging.getLogger(__name__)


class HealthMitraChatEngine:
    """Modular healthcare chat orchestrator combining immediate safety triage,

    live Groq LLM intelligence, and localized clinical fallback.
    """

    def __init__(self):
        self.groq_client = GroqChatClient()

    async def get_medical_response(self, text: str, language: str) -> Dict[str, Any]:
        """Processes patient query and returns structured medical guidance."""
        norm_text = text.casefold()

        # Step 1: Immediate Safety Triage for Red Flags
        if any(phrase in norm_text for phrase in EMERGENCY_KEYWORDS):
            logger.info("Emergency keyword detected in chat message; escalating immediately.")
            return get_emergency_response(language)

        # Step 2: Live Groq LLM Response (with multi-model cascade)
        try:
            llm_result: MedicalResponse = await self.groq_client.generate_response(text, language)
            if llm_result:
                return llm_result.model_dump()
        except Exception as e:
            logger.error(f"Unexpected error during LLM generation: {e}")

        # Step 3: Localized Deterministic Clinical Fallback
        # Guaranteed high-availability clinical advice in user's chosen language
        logger.info(f"Serving clinical fallback response for language '{language}'.")
        fallback_data = get_clinical_fallback_response(text, language)
        return MedicalResponse.model_validate(fallback_data).model_dump()


chat_engine = HealthMitraChatEngine()
