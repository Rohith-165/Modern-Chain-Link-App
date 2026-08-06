import pytest

def test_get_stock_items(client):
    response = client.get("/api/v1/stock")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 6

def test_create_and_update_stock(client):
    new_stock = {
        "item_name": "Test GI Wire 10 Gauge",
        "category": "Raw Wire",
        "unit": "Kg",
        "shop_quantity": 50.0,
        "factory_quantity": 500.0,
        "reorder_level": 20.0,
        "price_per_unit": 80.0,
        "notes": "High strength galvanized wire"
    }
    create_res = client.post("/api/v1/stock", json=new_stock)
    assert create_res.status_code == 201
    stock_id = create_res.json()["id"]

    # Update quantities
    update_res = client.put(f"/api/v1/stock/{stock_id}", json={"shop_quantity": 75.0, "factory_quantity": 450.0})
    assert update_res.status_code == 200
    assert update_res.json()["shop_quantity"] == 75.0
    assert update_res.json()["factory_quantity"] == 450.0

    # Delete
    del_res = client.delete(f"/api/v1/stock/{stock_id}")
    assert del_res.status_code == 204
