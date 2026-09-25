from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
from typing import List

from app.db.mongodb import get_database
from app.security.roles import get_current_user, require_role
from app.models.chat_history import ChatRequest, ChatMessage
from app.services.llm_service import llm_service
from app.services.translation_service import translation_service

router = APIRouter()

@router.post("/message")
async def send_message(
    request: ChatRequest,
    current_user: dict = Depends(require_role("patient")),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # 1. Detect language (if user selects 'auto' or we want to verify)
    detected_lang = translation_service.detect_language(request.text)
    
    # 2. We use the requested language for response, or fallback to detected
    target_lang = request.language if request.language != 'auto' else detected_lang
    
    # 3. Get LLM Medical Response
    llm_response = await llm_service.get_medical_response(request.text, target_lang)
    
    # 4. Save to history
    chat_message = ChatMessage(
        user_message=request.text,
        ai_response=llm_response["response"],
        language=target_lang,
        confidence=llm_response.get("confidence", 0.0),
        ai_diagnosis=llm_response.get("ai_diagnosis"),
        should_escalate=llm_response.get("should_escalate", False)
    )
    
    user_id = str(current_user["_id"])
    
    # Simple append to user's chat_history array in patient doc
    await db["patients"].update_one(
        {"userId": user_id},
        {"$push": {"chat_history": chat_message.dict()}},
        upsert=True
    )
    
    return llm_response

@router.get("/history", response_model=List[ChatMessage])
async def get_chat_history(
    current_user: dict = Depends(require_role("patient")),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = str(current_user["_id"])
    patient = await db["patients"].find_one({"userId": user_id})
    if not patient or "chat_history" not in patient:
        return []
        
    return patient["chat_history"]
