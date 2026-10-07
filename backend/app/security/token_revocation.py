from datetime import datetime
import hashlib
from typing import Any, Dict

from jose import jwt

from app.config import settings


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )


async def is_token_revoked(db, token: str, payload: Dict[str, Any]) -> bool:
    queries = [{"token_hash": token_hash(token)}]
    if payload.get("jti"):
        queries.append({"jti": payload["jti"]})
    return await db["revoked_tokens"].find_one({"$or": queries}) is not None


async def revoke_token(db, token: str) -> None:
    payload = decode_token(token)
    expires_at = datetime.utcfromtimestamp(payload["exp"])
    await db["revoked_tokens"].update_one(
        {"token_hash": token_hash(token)},
        {
            "$setOnInsert": {
                "jti": payload.get("jti"),
                "token_hash": token_hash(token),
                "expires_at": expires_at,
                "revoked_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )
