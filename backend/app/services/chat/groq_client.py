import json
import logging
import re
from typing import Optional, Dict, Any
import httpx

from app.config import settings
from .models import MedicalResponse
from .prompts import build_system_prompt

logger = logging.getLogger(__name__)

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
# Primary multilingual model first, followed by resilient fallbacks
PREFERRED_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b"
]


def extract_json_from_llm(raw_text: str) -> Optional[Dict[str, Any]]:
    """Clean markdown code fences and extract valid JSON dictionary."""
    if not raw_text:
        return None
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    
    # Try direct parse
    try:
        return json.loads(cleaned)
    except Exception:
        pass
    
    # Try finding the first '{' and last '}'
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(cleaned[start:end + 1])
        except Exception:
            pass

    # Regex fallback if JSON was truncated or unclosed
    match = re.search(r'"response"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)', cleaned)
    if match:
        response_text = match.group(1).replace(r'\"', '"').replace(r'\n', '\n')
        return {
            "response": response_text,
            "confidence": 0.90,
            "should_escalate": False,
            "ai_diagnosis": "Healthcare Guidance",
            "recommended_action": "Follow self-care guidance"
        }

    return None


class GroqChatClient:
    """Async Groq client with multi-model cascade and token limit enforcement."""

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.endpoint = GROQ_ENDPOINT
        self.models = PREFERRED_MODELS

    async def generate_response(self, text: str, language: str) -> Optional[MedicalResponse]:
        """Queries Groq with automatic model cascade."""
        if not self.api_key:
            logger.info("GROQ_API_KEY is not configured; deferring to clinical engine.")
            return None

        system_prompt = build_system_prompt(language)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "HealthMitra/2.0 (Healthcare Assistant)"
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            for model_name in self.models:
                payload = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": text}
                    ],
                    # Cap tokens strictly under 500 to never exceed Groq's 1000 OTPM limit
                    "max_tokens": 450,
                    "temperature": 0.2
                }
                try:
                    resp = await client.post(self.endpoint, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        choices = data.get("choices", [])
                        if choices:
                            content = choices[0].get("message", {}).get("content", "")
                            parsed_dict = extract_json_from_llm(content)
                            if parsed_dict and isinstance(parsed_dict, dict):
                                return MedicalResponse.model_validate(parsed_dict)
                            # If content is plain text, sanitize if raw JSON was returned
                            elif content.strip():
                                clean_text = content.strip()
                                if clean_text.startswith("{") and '"response"' in clean_text:
                                    resp_match = re.search(r'"response"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)', clean_text)
                                    if resp_match:
                                        clean_text = resp_match.group(1).replace(r'\"', '"').replace(r'\n', '\n')
                                return MedicalResponse(
                                    response=clean_text,
                                    confidence=0.88,
                                    should_escalate=False,
                                    ai_diagnosis="Healthcare Advice",
                                    recommended_action="Follow guidance or consult physician"
                                )
                    else:
                        logger.warning(
                            f"[Groq] Model {model_name} returned HTTP {resp.status_code}: {resp.text[:150]}"
                        )
                except Exception as e:
                    logger.warning(f"[Groq] Request to {model_name} failed: {e}")
                    continue

        return None
