from fastapi.testclient import TestClient

from app.main import app


def test_openapi_works():
    with TestClient(app) as client:
        resp = client.get("/openapi.json")
        assert resp.status_code == 200
        assert resp.json()["info"]["title"]
