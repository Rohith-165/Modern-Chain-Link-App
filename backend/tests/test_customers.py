def test_get_customers(client):
    response = client.get("/api/v1/customers")
    assert response.status_code == 200
    customers = response.json()
    assert isinstance(customers, list)
    if len(customers) > 0:
        c = customers[0]
        assert "phone_number" in c
        assert "total_orders" in c
        assert "total_spent" in c
