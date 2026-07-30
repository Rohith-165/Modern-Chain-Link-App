from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services import payment_service
from app.core.logger import log_payment_event

router = APIRouter()

@router.post("/{order_id}", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def add_payment_to_order(
    order_id: str,
    payment_in: PaymentCreate,
    db: Session = Depends(get_db)
):
    payment = payment_service.add_payment(db, order_id, payment_in)
    if not payment:
        raise HTTPException(status_code=404, detail="Order not found")
    log_payment_event("RECORD", order_id, payment.amount)
    return payment
