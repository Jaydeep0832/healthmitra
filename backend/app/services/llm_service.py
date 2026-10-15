import logging
from typing import Dict, Any

try:
    from groq import AsyncGroq
except ImportError:
    AsyncGroq = None

from app.config import settings
from app.services.chat.models import MedicalResponse
from app.services.chat.engine import chat_engine

logger = logging.getLogger(__name__)


class HealthMitraLLM:
    """Healthcare LLM service wrapper providing backward compatibility

    while delegating to the modular HealthMitra chat engine.
    """

    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY) if (AsyncGroq and settings.GROQ_API_KEY) else None
        # Updated to active Groq model with top-tier multilingual Indic capabilities
        self.model = "qwen/qwen3.8-27b"

    async def get_medical_response(self, text: str, language: str) -> Dict[str, Any]:
        """Delegates query processing to the modular chat engine with multi-tier fallbacks."""
        return await chat_engine.get_medical_response(text, language)


llm_service = HealthMitraLLM()
