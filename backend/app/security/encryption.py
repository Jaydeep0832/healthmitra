from cryptography.fernet import Fernet
from cryptography.fernet import InvalidToken
from app.config import settings

ENCRYPTED_PREFIX = "enc:"

fernet = Fernet(settings.ENCRYPTION_KEY.encode("ascii"))


def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive patient information."""
    if not data:
        return data
    return ENCRYPTED_PREFIX + fernet.encrypt(data.encode("utf-8")).decode("utf-8")


def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive patient information."""
    if not encrypted_data:
        return encrypted_data
    token = encrypted_data
    if token.startswith(ENCRYPTED_PREFIX):
        token = token[len(ENCRYPTED_PREFIX):]
    try:
        return fernet.decrypt(token.encode("utf-8")).decode("utf-8")
    except (InvalidToken, ValueError):
        return encrypted_data
