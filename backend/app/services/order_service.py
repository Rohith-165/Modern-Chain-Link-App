from sqlalchemy.orm import Session
from datetime import datetime, UTC
from app.models.order import Order
from app.models.payment import Payment
from app.schemas.order import OrderCreate, OrderUpdate
from app.services.customer_service import get_or_create_customer
from app.schemas.customer import CustomerCreate

def generate_order_id(db: Session) -> str:
    year = datetime.now().year
    count = db.query(Order).count() + 1
    serial = str(count).zfill(4)
    return f"MCLC-{year}-{serial}"

def create_order(db: Session, order_in: OrderCreate) -> Order:
    # Get or create customer
    customer = get_or_create_customer(
        db,
        CustomerCreate(
            name=order_in.customer_name,
            phone_number=order_in.phone_number,
            address=order_in.address
        )
    )

    area = order_in.height * order_in.length
    material_cost = area * order_in.sqft_price
    extra_charges = (order_in.barbed_wire or 0) + (order_in.binding_wire or 0) + \
                    (order_in.labour or 0) + (order_in.travel or 0) + (order_in.stone or 0)
    
    total_amount = material_cost + extra_charges
    balance_amount = max(0.0, total_amount - (order_in.amount_paid or 0.0))

    db_order = Order(
        order_id=generate_order_id(db),
        customer_id=customer.id,
        customer_name=order_in.customer_name,
        phone_number=order_in.phone_number,
        address=order_in.address,
        order_type=order_in.order_type,
        material_type=order_in.material_type,
        diamond_size=order_in.diamond_size,
        brand=order_in.brand,
        height=order_in.height,
        length=order_in.length,
        sqft_price=order_in.sqft_price,
        area=area,
        material_cost=material_cost,
        barbed_wire=order_in.barbed_wire,
        binding_wire=order_in.binding_wire,
        labour=order_in.labour,
        travel=order_in.travel,
        stone=order_in.stone,
        total_amount=total_amount,
        amount_paid=order_in.amount_paid or 0.0,
        balance_amount=balance_amount,
        status=order_in.status or "Pending"
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Initial payment record if advance paid
    if order_in.amount_paid and order_in.amount_paid > 0:
        payment = Payment(
            payment_id=f"PAY-{int(datetime.now(UTC).timestamp()*1000)}",
            order_id=db_order.id,
            amount=order_in.amount_paid,
            payment_mode="Advance Cash/UPI",
            notes="Initial advance payment on order creation"
        )
        db.add(payment)
        db.commit()
        db.refresh(db_order)

    return db_order

def get_orders(db: Session, status: str = None, search: str = None):
    query = db.query(Order)
    if status and status != "All":
        query = query.filter(Order.status == status)
    if search:
        search_fmt = f"%{search.lower()}%"
        query = query.filter(
            (Order.order_id.ilike(search_fmt)) |
            (Order.customer_name.ilike(search_fmt)) |
            (Order.phone_number.ilike(search_fmt))
        )
    return query.order_by(Order.id.desc()).all()

def get_order_by_order_id(db: Session, order_id: str) -> Order:
    return db.query(Order).filter(Order.order_id == order_id).first()

def update_order(db: Session, order_id: str, order_in: OrderUpdate) -> Order:
    db_order = get_order_by_order_id(db, order_id)
    if not db_order:
        return None

    area = order_in.height * order_in.length
    material_cost = area * order_in.sqft_price
    extra_charges = (order_in.barbed_wire or 0) + (order_in.binding_wire or 0) + \
                    (order_in.labour or 0) + (order_in.travel or 0) + (order_in.stone or 0)
    
    total_amount = material_cost + extra_charges
    balance_amount = max(0.0, total_amount - db_order.amount_paid)

    db_order.customer_name = order_in.customer_name
    db_order.phone_number = order_in.phone_number
    db_order.address = order_in.address
    db_order.order_type = order_in.order_type
    db_order.material_type = order_in.material_type
    db_order.diamond_size = order_in.diamond_size
    db_order.brand = order_in.brand
    db_order.height = order_in.height
    db_order.length = order_in.length
    db_order.sqft_price = order_in.sqft_price
    db_order.area = area
    db_order.material_cost = material_cost
    db_order.barbed_wire = order_in.barbed_wire
    db_order.binding_wire = order_in.binding_wire
    db_order.labour = order_in.labour
    db_order.travel = order_in.travel
    db_order.stone = order_in.stone
    db_order.total_amount = total_amount
    db_order.balance_amount = balance_amount
    db_order.status = order_in.status

    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: str) -> bool:
    db_order = get_order_by_order_id(db, order_id)
    if not db_order:
        return False
    db.delete(db_order)
    db.commit()
    return True
