from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime, UTC
from app.database.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False, index=True)  # "Order", "Payment", "Customer"
    entity_id = Column(String, nullable=False, index=True)    # e.g., "MCLC-1001" or customer ID
    action = Column(String, nullable=False)                  # "Created Order", "Updated Status", etc.
    user_email = Column(String, nullable=False)              # "Kavitha@modernchainlink.com"
    user_name = Column(String, nullable=False)               # "Kavitha"
    details = Column(Text, nullable=True)                    # Detailed change summary
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
