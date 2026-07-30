from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.dependencies import get_db
from app.schemas.customer import CustomerSummaryResponse
from app.services import customer_service

router = APIRouter()

@router.get("", response_model=List[CustomerSummaryResponse])
def read_customers(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    customers = customer_service.get_all_customers(db)
    result = []
    
    for customer in customers:
        if search:
            search_fmt = search.lower()
            if search_fmt not in customer.name.lower() and \
               search_fmt not in customer.phone_number.lower() and \
               search_fmt not in customer.address.lower():
                continue

        orders = customer.orders
        total_orders = len(orders)
        total_spent = sum(o.total_amount for o in orders)
        total_paid = sum(o.amount_paid for o in orders)
        balance_due = sum(o.balance_amount for o in orders)
        last_date = max((o.created_at for o in orders), default=customer.created_at)

        result.append(
            CustomerSummaryResponse(
                name=customer.name,
                phone_number=customer.phone_number,
                address=customer.address,
                total_orders=total_orders,
                total_spent=total_spent,
                total_paid=total_paid,
                balance_due=balance_due,
                last_order_date=last_date,
                orders=orders
            )
        )

    result.sort(key=lambda x: x.last_order_date, reverse=True)
    return result
