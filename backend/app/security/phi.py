from copy import deepcopy
from typing import Any, Dict, List

from app.security.encryption import decrypt_sensitive_data, encrypt_sensitive_data


def _protect(value: Any) -> Any:
    if isinstance(value, str):
        return encrypt_sensitive_data(value)
    return value


def _reveal(value: Any) -> Any:
    if isinstance(value, str):
        return decrypt_sensitive_data(value)
    return value


def protect_profile(data: Dict[str, Any]) -> Dict[str, Any]:
    protected = deepcopy(data)
    for field in ("name", "phone"):
        if field in protected and protected[field] is not None:
            protected[field] = _protect(protected[field])
    return protected


def reveal_profile(data: Dict[str, Any]) -> Dict[str, Any]:
    revealed = deepcopy(data)
    for field in ("name", "phone"):
        if field in revealed and revealed[field] is not None:
            revealed[field] = _reveal(revealed[field])
    revealed["medical_history"] = reveal_medical_history(
        revealed.get("medical_history", [])
    )
    revealed["chat_history"] = reveal_chat_messages(
        revealed.get("chat_history", [])
    )
    return revealed


def protect_medical_record(record: Dict[str, Any]) -> Dict[str, Any]:
    protected = deepcopy(record)
    protected["symptoms"] = [_protect(item) for item in protected.get("symptoms", [])]
    for field in ("ai_diagnosis", "recommended_action"):
        if protected.get(field) is not None:
            protected[field] = _protect(protected[field])
    return protected


def reveal_medical_record(record: Dict[str, Any]) -> Dict[str, Any]:
    revealed = deepcopy(record)
    revealed["symptoms"] = [_reveal(item) for item in revealed.get("symptoms", [])]
    for field in ("ai_diagnosis", "recommended_action"):
        if revealed.get(field) is not None:
            revealed[field] = _reveal(revealed[field])
    return revealed


def reveal_medical_history(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [reveal_medical_record(record) for record in (records or [])]


def protect_chat_message(message: Dict[str, Any]) -> Dict[str, Any]:
    protected = deepcopy(message)
    for field in ("user_message", "ai_response", "ai_diagnosis"):
        if protected.get(field) is not None:
            protected[field] = _protect(protected[field])
    return protected


def reveal_chat_message(message: Dict[str, Any]) -> Dict[str, Any]:
    revealed = deepcopy(message)
    for field in ("user_message", "ai_response", "ai_diagnosis"):
        if revealed.get(field) is not None:
            revealed[field] = _reveal(revealed[field])
    return revealed


def reveal_chat_messages(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [reveal_chat_message(message) for message in (messages or [])]
