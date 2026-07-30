from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from app.database.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    address = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    # Relationships
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
