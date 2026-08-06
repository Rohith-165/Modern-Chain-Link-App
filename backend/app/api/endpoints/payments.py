from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.dependencies import get_db
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services import payment_service
from app.core.logger import log_payment_event
from app.core.auth import get_current_user_optional
from app.models.user import User

router = APIRouter()

@router.post("/{order_id}", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def add_payment_to_order(
    order_id: str,
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    payment = payment_service.add_payment(db, order_id, payment_in, current_user=current_user)
    if not payment:
        raise HTTPException(status_code=404, detail="Order not found")
    log_payment_event("RECORD", order_id, payment.amount)
    return payment
