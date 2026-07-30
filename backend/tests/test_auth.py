def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "Kumar@modernchainlink.com", "password": "modern@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "Kumar@modernchainlink.com"

def test_login_failure(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
