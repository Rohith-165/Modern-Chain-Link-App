from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.payment import PaymentResponse

class OrderBase(BaseModel):
    customer_name: str
    phone_number: str
    address: str
    order_type: Optional[str] = "Material"
    material_type: Optional[str] = "Fence"
    diamond_size: Optional[str] = "2 X 2 Inch"
    brand: Optional[str] = "TATA"
    height: float
    length: float
    sqft_price: float
    barbed_wire: Optional[float] = 0.0
    binding_wire: Optional[float] = 0.0
    labour: Optional[float] = 0.0
    travel: Optional[float] = 0.0
    stone: Optional[float] = 0.0
    amount_paid: Optional[float] = 0.0
    status: Optional[str] = "Pending"

class OrderCreate(OrderBase):
    pass

class OrderUpdate(OrderBase):
    pass

class OrderResponse(OrderBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: str
    area: float
    material_cost: float
    total_amount: float
    balance_amount: float
    created_at: datetime
    payments: List[PaymentResponse] = []
