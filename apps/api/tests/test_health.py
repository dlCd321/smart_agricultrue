from fastapi.testclient import TestClient

from agriculture_api.main import create_app


def test_health_check_returns_api_envelope() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 200
    assert payload["message"] == "success"
    assert payload["data"] == {
        "status": "ok",
        "service": "agriculture-api",
        "version": "0.1.0",
    }
    assert payload["timestamp"]
    assert payload["traceId"].startswith("req_")
