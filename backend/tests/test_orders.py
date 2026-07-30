def test_create_and_get_order(client):
    order_payload = {
        "customer_name": "Ramesh Kumar",
        "phone_number": "9876543210",
        "address": "Tiruchengode Main Road",
        "order_type": "Material",
        "material_type": "Fence",
        "diamond_size": "2 X 2 Inch",
        "brand": "TATA",
        "height": 6,
        "length": 100,
        "sqft_price": 50,
        "barbed_wire": 500,
        "binding_wire": 200,
        "amount_paid": 5000,
        "status": "Pending"
    }

    # Create Order
    response = client.post("/api/v1/orders", json=order_payload)
    assert response.status_code == 201
    data = response.json()
    assert "order_id" in data
    assert data["area"] == 600.0  # 6 * 100
    assert data["material_cost"] == 30000.0  # 600 * 50
    assert data["total_amount"] == 30700.0  # 30000 + 500 + 200
    assert data["balance_amount"] == 25700.0  # 30700 - 5000

    order_id = data["order_id"]

    # Get Orders
    response = client.get("/api/v1/orders")
    assert response.status_code == 200
    orders = response.json()
    assert len(orders) >= 1

    # Get Single Order
    response = client.get(f"/api/v1/orders/{order_id}")
    assert response.status_code == 200
    assert response.json()["customer_name"] == "Ramesh Kumar"
