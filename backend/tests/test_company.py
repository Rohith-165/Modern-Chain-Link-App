def test_company_profile(client):
    # Get Company Profile
    response = client.get("/api/v1/profile/company")
    assert response.status_code == 200
    company = response.json()
    assert "name" in company
    assert "gst_number" in company

    # Update Company Profile
    update_payload = {
        "name": "Modern Chain Link Company Private Limited",
        "phone": "9876543210",
        "email": "info@modernchainlink.com",
        "address": "Tiruchengode, Tamil Nadu, India",
        "gst_number": "33AAAAA0000A1Z5",
        "tagline": "Premium Chain Link Fencing & Barbed Wire Solutions",
        "version": "2.0.0"
    }
    put_res = client.put("/api/v1/profile/company", json=update_payload)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["name"] == "Modern Chain Link Company Private Limited"
    assert updated["email"] == "info@modernchainlink.com"
