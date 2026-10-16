from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import uuid

from app.db.mongodb import get_database
from app.security.roles import get_current_user
from app.models.chat_history import ChatRequest, ChatMessage
from app.services.llm_service import llm_service
from app.services.translation_service import translation_service
from app.security.phi import protect_chat_message, reveal_chat_messages
from app.security.rate_limit import chat_rate_limiter

router = APIRouter()


@router.post("/message")
async def send_message(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    _: None = Depends(chat_rate_limiter),
):
    """
    Send a message to the AI clinical assistant.
    Maintains strictly isolated user sessions.
    """
    user_id = str(current_user["_id"])
    session_id = (request.session_id or "").strip() or uuid.uuid4().hex

    # 1. Detect language (if user selects 'auto' or verify)
    detected_lang = translation_service.detect_language(request.text)

    # 2. Use requested language for response, or fallback to detected
    target_lang = request.language if request.language != 'auto' else detected_lang

    # 3. Get LLM Medical Response
    llm_response = await llm_service.get_medical_response(request.text, target_lang)

    # 4. Construct message model
    chat_message = ChatMessage(
        user_message=request.text,
        ai_response=llm_response["response"],
        language=target_lang,
        confidence=llm_response.get("confidence", 0.0),
        ai_diagnosis=llm_response.get("ai_diagnosis"),
        should_escalate=llm_response.get("should_escalate", False)
    )

    encrypted_message = protect_chat_message(chat_message.model_dump())

    # 5. Persist to user's isolated session in chat_sessions collection
    session_title = request.text[:45] + ("..." if len(request.text) > 45 else "")
    now = datetime.utcnow()

    await db["chat_sessions"].update_one(
        {"user_id": user_id, "session_id": session_id},
        {
            "$push": {
                "messages": {
                    "$each": [encrypted_message],
                    "$slice": -200,
                }
            },
            "$setOnInsert": {
                "user_id": user_id,
                "session_id": session_id,
                "title": session_title,
                "created_at": now,
            },
            "$set": {
                "updated_at": now,
                "language": target_lang,
            }
        },
        upsert=True
    )

    # 6. Also append to patient doc for backward-compatible longitudinal history
    await db["patients"].update_one(
        {"user_id": user_id},
        {
            "$push": {
                "chat_history": {
                    "$each": [encrypted_message],
                    "$slice": -200,
                }
            }
        },
        upsert=True
    )

    llm_response["session_id"] = session_id
    return llm_response


@router.post("/session/new")
async def create_new_session(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Allocate a brand new, isolated session for the authenticated user.
    """
    user_id = str(current_user["_id"])
    session_id = uuid.uuid4().hex
    now = datetime.utcnow()

    new_session = {
        "user_id": user_id,
        "session_id": session_id,
        "title": "New Consultation",
        "messages": [],
        "created_at": now,
        "updated_at": now,
    }
    await db["chat_sessions"].insert_one(new_session)

    return {
        "session_id": session_id,
        "title": "New Consultation",
        "created_at": now.isoformat(),
    }


@router.get("/sessions")
async def list_user_sessions(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    List all consultation sessions strictly belonging to the current user.
    """
    user_id = str(current_user["_id"])
    cursor = db["chat_sessions"].find({"user_id": user_id}).sort("updated_at", -1).limit(20)
    sessions = await cursor.to_list(length=20)

    result = []
    for s in sessions:
        created_val = s.get("created_at", datetime.utcnow())
        created_str = created_val.isoformat() if isinstance(created_val, datetime) else str(created_val)
        result.append({
            "session_id": s["session_id"],
            "title": s.get("title", "Consultation"),
            "created_at": created_str,
            "message_count": len(s.get("messages", [])),
        })
    return result


@router.get("/history", response_model=List[ChatMessage])
async def get_chat_history(
    session_id: Optional[str] = Query(None, description="Optional specific session ID"),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Fetch chat history for the authenticated user.
    Returns empty list if user is newly registered or has no messages.
    """
    user_id = str(current_user["_id"])

    # 1. If explicit session_id requested, query that specific session for this user
    if session_id:
        session = await db["chat_sessions"].find_one({"user_id": user_id, "session_id": session_id})
        if session and session.get("messages"):
            return reveal_chat_messages(session["messages"])
        return []

    # 2. Otherwise find the latest updated session for this user
    latest_session = await db["chat_sessions"].find_one(
        {"user_id": user_id},
        sort=[("updated_at", -1)]
    )
    if latest_session and latest_session.get("messages"):
        return reveal_chat_messages(latest_session["messages"])

    # 3. Fallback to patient profile chat_history for backward compatibility
    patient = await db["patients"].find_one({"$or": [{"user_id": user_id}, {"userId": user_id}]})
    if patient and patient.get("chat_history"):
        return reveal_chat_messages(patient["chat_history"])

    return []


@router.delete("/history")
async def clear_chat_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Clear all chat sessions and history for the current user.
    """
    user_id = str(current_user["_id"])
    await db["chat_sessions"].delete_many({"user_id": user_id})
    await db["patients"].update_one(
        {"$or": [{"user_id": user_id}, {"userId": user_id}]},
        {"$set": {"chat_history": []}}
    )
    return {"message": "Chat history cleared successfully"}
