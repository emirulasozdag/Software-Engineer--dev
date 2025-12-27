from fastapi.testclient import TestClient

from app.main import app


def test_register_verify_login_flow():
    with TestClient(app) as client:
        register = client.post(
            "/auth/register",
            json={
                "email": "student1@example.com",
                "full_name": "Student One",
                "password": "Password123!",
                "role": "student",
            },
        )
        assert register.status_code == 200
        token = register.json()["dev_only_email_verification_token"]
        assert token

        verify = client.post("/auth/verify-email", json={"token": token})
        assert verify.status_code == 200

        login = client.post(
            "/auth/login",
            json={"email": "student1@example.com", "password": "Password123!"},
        )
        assert login.status_code == 200
        assert login.json()["access_token"]
