from typing import Any
from pydantic import BaseModel, Field, field_validator


class MedicalResponse(BaseModel):
    """Normalized response schema for HealthMitra clinical & assistant responses."""
    response: str = Field(min_length=1, max_length=10000)
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    should_escalate: bool = False
    ai_diagnosis: str = Field(default="", max_length=500)
    recommended_action: str = Field(default="", max_length=2000)

    @field_validator("confidence", mode="before")
    @classmethod
    def sanitize_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.85
        try:
            if isinstance(v, str):
                v = v.replace("%", "").strip()
            val = float(v)
            if val > 1.0:
                val = val / 100.0
            return max(0.0, min(1.0, val))
        except (ValueError, TypeError):
            return 0.85

    @field_validator("should_escalate", mode="before")
    @classmethod
    def sanitize_escalation(cls, v: Any) -> bool:
        if isinstance(v, str):
            return v.lower() in ("true", "yes", "1", "emergency", "urgent")
        return bool(v)
