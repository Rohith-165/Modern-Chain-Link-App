from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    amount: float
    payment_mode: Optional[str] = "Cash / UPI"
    notes: Optional[str] = ""

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    payment_id: str
    order_id: int
    created_at: datetime
