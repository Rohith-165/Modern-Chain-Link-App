from sqlalchemy.orm import Session
from datetime import datetime, UTC
from app.models.payment import Payment
from app.models.order import Order
from app.models.user import User
from app.schemas.payment import PaymentCreate
from app.services.audit_service import record_audit

def add_payment(db: Session, order_id_str: str, payment_in: PaymentCreate, current_user: User = None) -> Payment:
    order = db.query(Order).filter(Order.order_id == order_id_str).first()
    if not order:
        return None

    payment = Payment(
        payment_id=f"PAY-{int(datetime.now(UTC).timestamp()*1000)}",
        order_id=order.id,
        amount=payment_in.amount,
        payment_mode=payment_in.payment_mode or "Cash / UPI",
        notes=payment_in.notes or ""
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Recalculate order amount_paid and balance_amount
    total_paid = sum(p.amount for p in order.payments)
    order.amount_paid = total_paid
    order.balance_amount = max(0.0, order.total_amount - total_paid)
    
    db.commit()
    db.refresh(order)

    record_audit(
        db=db,
        entity_type="Payment",
        entity_id=order.order_id,
        action="Added Payment",
        user=current_user,
        details=f"Received payment of ₹{payment_in.amount} via {payment_in.payment_mode or 'Cash/UPI'} (Notes: '{payment_in.notes or ''}'). New Balance: ₹{order.balance_amount}"
    )

    return payment

def delete_payment(db: Session, payment_db_id: int, current_user: User = None) -> bool:
    payment = db.query(Payment).filter(Payment.id == payment_db_id).first()
    if not payment:
        return False
    
    order = payment.order
    amt = payment.amount
    order_id_str = order.order_id if order else "Unknown"

    db.delete(payment)
    db.commit()

    if order:
        total_paid = sum(p.amount for p in order.payments)
        order.amount_paid = total_paid
        order.balance_amount = max(0.0, order.total_amount - total_paid)
        db.commit()

        record_audit(
            db=db,
            entity_type="Payment",
            entity_id=order_id_str,
            action="Deleted Payment",
            user=current_user,
            details=f"Deleted payment of ₹{amt}. New Balance: ₹{order.balance_amount}"
        )

    return True
