from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from app.database.base import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String, unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String, default="Cash / UPI")
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    # Relationships
    order = relationship("Order", back_populates="payments")
