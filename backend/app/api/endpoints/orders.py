from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import HTMLResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io

from app.dependencies import get_db
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse
from app.schemas.audit import AuditLogResponse
from app.services import order_service
from app.services.invoice_service import generate_invoice_html
from app.services.audit_service import get_entity_history
from app.models.company import Company
from app.core.logger import log_order_event
from app.core.auth import get_current_user_optional
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[OrderResponse])
def read_orders(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return order_service.get_orders(db, status=status, search=search)

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    order = order_service.create_order(db, order_in, current_user=current_user)
    log_order_event("CREATE", order.order_id, f"Customer: {order.customer_name}, Total: ₹{order.total_amount}")
    return order

@router.get("/{order_id}/history", response_model=List[AuditLogResponse])
def get_order_history(
    order_id: str,
    db: Session = Depends(get_db)
):
    return get_entity_history(db, entity_id=order_id)

@router.get("/{order_id}", response_model=OrderResponse)
def read_order(
    order_id: str,
    db: Session = Depends(get_db)
):
    order = order_service.get_order_by_order_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: str,
    order_in: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    order = order_service.update_order(db, order_id, order_in, current_user=current_user)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    log_order_event("UPDATE", order.order_id, f"Status: {order.status}")
    return order

@router.post("/{order_id}/trash")
def trash_order_endpoint(order_id: str, db: Session = Depends(get_db)):
    success = order_service.trash_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    log_order_event("TRASH", order_id, "Moved order to 30-day Trash Vault")
    return {"status": "success", "message": f"Order {order_id} moved to Trash"}

@router.post("/{order_id}/restore")
def restore_order_endpoint(order_id: str, db: Session = Depends(get_db)):
    success = order_service.restore_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    log_order_event("RESTORE", order_id, "Restored order from Trash Vault")
    return {"status": "success", "message": f"Order {order_id} restored successfully"}

@router.delete("/{order_id}")
def delete_order(order_id: str, db: Session = Depends(get_db)):
    success = order_service.trash_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "message": f"Order {order_id} moved to Trash successfully"}

@router.delete("/{order_id}/permanent")
def delete_order_permanently(order_id: str, db: Session = Depends(get_db)):
    success = order_service.delete_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    log_order_event("PERMANENT_DELETE", order_id, "Permanently deleted order")
    return {"status": "success", "message": f"Order {order_id} permanently deleted"}


@router.get("/{order_id}/invoice", response_class=HTMLResponse)
def get_order_invoice_html(
    order_id: str,
    db: Session = Depends(get_db)
):
    order = order_service.get_order_by_order_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    company = db.query(Company).first()
    company_dict = {
        "name": company.name if company else "Modern Chain Link Company",
        "address": company.address if company else "Tiruchengode, Tamil Nadu",
        "gst_number": company.gst_number if company else "33AAAAA0000A1Z5"
    }

    order_dict = {
        "order_id": order.order_id,
        "created_at": order.created_at,
        "customer_name": order.customer_name,
        "phone_number": order.phone_number,
        "address": order.address,
        "material_type": order.material_type,
        "diamond_size": order.diamond_size,
        "brand": order.brand,
        "height": order.height,
        "length": order.length,
        "area": order.area,
        "sqft_price": order.sqft_price,
        "material_cost": order.material_cost,
        "total_amount": order.total_amount,
        "amount_paid": order.amount_paid,
        "balance_amount": order.balance_amount
    }

    html_content = generate_invoice_html(order_dict, company_dict)
    return HTMLResponse(content=html_content)
