"""
Backend integration tests — auth, chatbot, hospitals, patients.
Run with: docker exec healthmitra-backend-1 python -m pytest tests/ -v
"""
import asyncio
import os
import sys

# Add parent dir so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_health_endpoint():
    """Test that /api/health returns 200."""
    import requests
    resp = requests.get("http://localhost:8000/api/health", timeout=5)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["version"] == "2.0.0"


def test_register_and_login():
    """Test user registration and login flow."""
    import requests
    import uuid

    email = f"test_{uuid.uuid4().hex[:8]}@healthmitra.com"
    password = "TestPass123!"

    # Register
    resp = requests.post(
        "http://localhost:8000/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Test User",
            "role": "patient",
        },
        timeout=10,
    )
    assert resp.status_code in [200, 201], f"Register failed: {resp.text}"

    # Login (OAuth2 form-data)
    resp = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        data={"username": email, "password": password},
        timeout=10,
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    data = resp.json()
    assert "access_token" in data

    # Get me
    token = data["access_token"]
    resp = requests.get(
        "http://localhost:8000/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    assert resp.status_code == 200


def test_hospital_seed_and_search():
    """Test hospital seeding and nearby search."""
    import requests

    # Seed (idempotent)
    resp = requests.post("http://localhost:8000/api/v1/hospitals/seed", timeout=15)
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] > 0

    # Nearby search (Ahmedabad coordinates)
    resp = requests.get(
        "http://localhost:8000/api/v1/hospitals/nearby",
        params={"lat": 23.0225, "lng": 72.5714, "radius": 25},
        timeout=10,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "hospitals" in data
    assert len(data["hospitals"]) > 0
    # Check distance is present
    assert "distance_km" in data["hospitals"][0]


def test_hospital_districts_and_services():
    """Test metadata endpoints."""
    import requests

    resp = requests.get("http://localhost:8000/api/v1/hospitals/districts", timeout=10)
    assert resp.status_code == 200
    assert len(resp.json()["districts"]) > 0

    resp = requests.get("http://localhost:8000/api/v1/hospitals/services", timeout=10)
    assert resp.status_code == 200
    assert len(resp.json()["services"]) > 0


def test_chatbot_message():
    """Test chatbot message endpoint."""
    import requests
    import uuid

    # Register + login first
    email = f"chat_{uuid.uuid4().hex[:8]}@healthmitra.com"
    reg_resp = requests.post(
        "http://localhost:8000/api/v1/auth/register",
        json={"email": email, "password": "TestPass123!", "full_name": "Chat Tester", "role": "patient"},
        timeout=10,
    )
    assert reg_resp.status_code in [200, 201], f"Register failed: {reg_resp.text}"
    login_resp = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        data={"username": email, "password": "TestPass123!"},
        timeout=10,
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]

    # Send chatbot message
    resp = requests.post(
        "http://localhost:8000/api/v1/chatbot/message",
        json={"text": "I have a headache", "language": "en"},
        headers={"Authorization": f"Bearer {token}"},
        timeout=30,
    )
    assert resp.status_code == 200, f"Chatbot failed: {resp.text}"
    data = resp.json()
    assert "response" in data


def test_patient_dashboard():
    """Test patient dashboard endpoint."""
    import requests
    import uuid

    email = f"dash_{uuid.uuid4().hex[:8]}@healthmitra.com"
    reg_resp = requests.post(
        "http://localhost:8000/api/v1/auth/register",
        json={"email": email, "password": "TestPass123!", "full_name": "Dash Tester", "role": "patient"},
        timeout=10,
    )
    assert reg_resp.status_code in [200, 201], f"Register failed: {reg_resp.text}"
    login_resp = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        data={"username": email, "password": "TestPass123!"},
        timeout=10,
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Dashboard stats
    resp = requests.get(
        "http://localhost:8000/api/v1/patients/me/dashboard",
        headers=headers,
        timeout=10,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "health_score" in data

    # Medical history
    resp = requests.get(
        "http://localhost:8000/api/v1/patients/me/medical-history",
        headers=headers,
        timeout=10,
    )
    assert resp.status_code == 200


if __name__ == "__main__":
    print("Running HealthMitra backend tests...\n")
    tests = [
        test_health_endpoint,
        test_register_and_login,
        test_hospital_seed_and_search,
        test_hospital_districts_and_services,
        test_chatbot_message,
        test_patient_dashboard,
    ]

    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            print(f"  ✅ {test.__name__}")
            passed += 1
        except Exception as e:
            print(f"  ❌ {test.__name__}: {e}")
            failed += 1

    print(f"\n{'='*40}")
    print(f"Results: {passed} passed, {failed} failed out of {len(tests)}")
    if failed == 0:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed!")
