from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.order import Order
from app.models.customer import Customer
from app.schemas.order import OrderResponse

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    total_orders = len(orders)
    pending_orders = len([o for o in orders if o.status == "Pending"])
    delivered_orders = len([o for o in orders if o.status == "Delivered"])
    processing_orders = len([o for o in orders if o.status == "Processing"])
    
    total_revenue = sum(o.total_amount for o in orders)
    total_balance = sum(o.balance_amount for o in orders)
    total_paid = sum(o.amount_paid for o in orders)
    total_customers = db.query(Customer).count()

    recent_orders = db.query(Order).order_by(Order.id.desc()).limit(5).all()

    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "processing_orders": processing_orders,
        "delivered_orders": delivered_orders,
        "total_revenue": total_revenue,
        "total_paid": total_paid,
        "total_balance": total_balance,
        "total_customers": total_customers,
        "recent_orders": [OrderResponse.from_orm(o) for o in recent_orders]
    }
