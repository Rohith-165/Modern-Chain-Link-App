from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerCreate

def get_or_create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
    customer = db.query(Customer).filter(Customer.phone_number == customer_data.phone_number).first()
    if not customer:
        customer = Customer(
            name=customer_data.name,
            phone_number=customer_data.phone_number,
            address=customer_data.address
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    else:
        # Update details if changed
        customer.name = customer_data.name
        customer.address = customer_data.address
        db.commit()
        db.refresh(customer)
    return customer

def get_all_customers(db: Session):
    return db.query(Customer).all()
