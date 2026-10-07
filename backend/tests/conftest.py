import time

import pytest
import requests


@pytest.fixture(scope="session", autouse=True)
def wait_for_backend():
    deadline = time.monotonic() + 30
    while time.monotonic() < deadline:
        try:
            response = requests.get("http://localhost:8000/api/health", timeout=2)
            if response.status_code == 200:
                return
        except requests.RequestException:
            pass
        time.sleep(0.5)
    pytest.fail("Backend did not become healthy within 30 seconds")
