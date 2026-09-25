from cryptography.fernet import Fernet
import base64
from app.config import settings

def _get_fernet_key() -> bytes:
    # Ensure the key is exactly 32 bytes, pad or truncate if necessary
    key = settings.ENCRYPTION_KEY.encode('utf-8')
    if len(key) < 32:
        key = key.ljust(32, b'0')
    elif len(key) > 32:
        key = key[:32]
    # Fernet requires a url-safe base64-encoded 32-byte key
    return base64.urlsafe_b64encode(key)

fernet = Fernet(_get_fernet_key())

def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive patient information."""
    if not data:
        return data
    return fernet.encrypt(data.encode('utf-8')).decode('utf-8')

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive patient information."""
    if not encrypted_data:
        return encrypted_data
    return fernet.decrypt(encrypted_data.encode('utf-8')).decode('utf-8')
