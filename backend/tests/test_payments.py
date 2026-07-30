def test_add_payment(client):
    # 1. Create order
    order_payload = {
        "customer_name": "Suresh Patel",
        "phone_number": "9123456789",
        "address": "Salem Main Road",
        "height": 5,
        "length": 50,
        "sqft_price": 40,
        "amount_paid": 2000,
        "status": "Pending"
    }
    create_res = client.post("/api/v1/orders", json=order_payload)
    assert create_res.status_code == 201
    order_data = create_res.json()
    order_id = order_data["order_id"]

    # Total: (5*50*40) = 10000. Paid: 2000. Balance: 8000.
    assert order_data["total_amount"] == 10000.0
    assert order_data["balance_amount"] == 8000.0

    # 2. Add partial payment of 3000
    payment_payload = {
        "amount": 3000,
        "payment_mode": "GPay UPI",
        "notes": "Second installment payment"
    }
    pay_res = client.post(f"/api/v1/payments/{order_id}", json=payment_payload)
    assert pay_res.status_code == 201
    pay_data = pay_res.json()
    assert pay_data["amount"] == 3000.0

    # 3. Verify order total paid & balance updated
    get_res = client.get(f"/api/v1/orders/{order_id}")
    assert get_res.status_code == 200
    updated_order = get_res.json()
    assert updated_order["amount_paid"] == 5000.0  # 2000 + 3000
    assert updated_order["balance_amount"] == 5000.0  # 10000 - 5000
