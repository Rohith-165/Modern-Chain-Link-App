from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from app.database.base import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True, nullable=False)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False, index=True)
    address = Column(String, nullable=False)

    order_type = Column(String, default="Material")
    material_type = Column(String, default="Fence")
    diamond_size = Column(String, default="2 X 2 Inch")
    brand = Column(String, default="TATA")

    height = Column(Float, nullable=False)
    length = Column(Float, nullable=False)
    sqft_price = Column(Float, nullable=False)

    area = Column(Float, nullable=False)
    material_cost = Column(Float, nullable=False)

    barbed_wire = Column(Float, default=0.0)
    barbed_wire_kg = Column(Float, default=0.0)
    barbed_wire_rate = Column(Float, default=0.0)
    binding_wire = Column(Float, default=0.0)
    binding_wire_kg = Column(Float, default=0.0)
    binding_wire_rate = Column(Float, default=0.0)
    labour = Column(Float, default=0.0)
    travel = Column(Float, default=0.0)
    stone = Column(Float, default=0.0)

    total_amount = Column(Float, nullable=False)
    amount_paid = Column(Float, default=0.0)
    balance_amount = Column(Float, default=0.0)

    status = Column(String, default="Pending", index=True)
    ordered_date = Column(String, nullable=True)
    delivery_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
