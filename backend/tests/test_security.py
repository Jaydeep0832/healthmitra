import asyncio
import time
import uuid

import requests
import pytest
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


BASE_URL = "http://localhost:8000"


def _create_user():
    email = f"security_{uuid.uuid4().hex[:10]}@healthmitra.com"
    password = "SecurityTest!123"
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Security Regression",
            "role": "patient",
        },
        timeout=10,
    )
    assert response.status_code == 201, response.text
    login = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        data={"username": email, "password": password},
        timeout=10,
    )
    assert login.status_code == 200, login.text
    return email, login.json()["access_token"]


def _remove_user(email: str) -> None:
    async def remove():
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        database = client[settings.MONGODB_DB_NAME]
        user = await database.users.find_one({"email": email}, {"_id": 1})
        if user:
            user_id = str(user["_id"])
            await database.users.delete_one({"_id": user["_id"]})
            await database.patients.delete_one({"user_id": user_id})
        client.close()

    asyncio.run(remove())


def test_revoked_token_cannot_access_protected_api():
    email, token = _create_user()
    headers = {"Authorization": f"Bearer {token}"}
    try:
        logout = requests.post(
            f"{BASE_URL}/api/v1/auth/logout", headers=headers, timeout=10
        )
        assert logout.status_code == 204
        protected = requests.get(
            f"{BASE_URL}/api/v1/patients/me/dashboard",
            headers=headers,
            timeout=10,
        )
        assert protected.status_code == 401
    finally:
        _remove_user(email)


def test_critical_triage_bypasses_external_provider():
    email, token = _create_user()
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/triage/check",
            headers={"Authorization": f"Bearer {token}"},
            json={"symptoms": "chest pain and cannot breathe", "language": "en"},
            timeout=5,
        )
        body = response.json()
        assert response.status_code == 200
        assert body["urgency_level"] == "EMERGENCY"
        assert body["is_emergency"] is True
        assert "108" in body["emergency_contact"]
    finally:
        _remove_user(email)


@pytest.mark.parametrize(
    "path,payload",
    [
        (
            "/api/v1/triage/check",
            {"symptoms": "mild headache", "language": "en"},
        ),
        (
            "/api/v1/reports/analyze-text",
            {"report_text": "Hemoglobin 13.5 g/dL", "language": "en"},
        ),
    ],
)
def test_private_ai_endpoints_require_authentication(path, payload):
    response = requests.post(f"{BASE_URL}{path}", json=payload, timeout=10)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_nearby_search_schedules_external_sync_without_waiting(monkeypatch):
    from app.services.openstreetmap_service import OpenStreetMapService

    service = OpenStreetMapService()

    sync_called: list = []

    async def fake_sync(*args, **kwargs):
        sync_called.append(True)
        await asyncio.sleep(0.05)

    monkeypatch.setattr(service, "sync_nearby", fake_sync)
    started = time.monotonic()
    result = service.schedule_nearby(23.0225, 72.5714, 25)
    elapsed = time.monotonic() - started

    # Must return a bool and must not block
    assert isinstance(result, bool)
    assert elapsed < 0.5

    # If task was scheduled, wait for it and verify in-flight tracking cleans up
    if result:
        await asyncio.sleep(0.2)
        assert not service._in_flight
