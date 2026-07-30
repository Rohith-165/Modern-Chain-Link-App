from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.order import OrderResponse

class CustomerBase(BaseModel):
    name: str
    phone_number: str
    address: str

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    orders: List[OrderResponse] = []

class CustomerSummaryResponse(CustomerBase):
    total_orders: int
    total_spent: float
    total_paid: float
    balance_due: float
    last_order_date: datetime
    orders: List[OrderResponse] = []
