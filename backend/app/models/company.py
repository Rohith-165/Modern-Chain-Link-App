from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, UTC
from app.database.base import Base

class Company(Base):
    __tablename__ = "company"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Modern Chain Link Company", nullable=False)
    phone = Column(String, default="9876543210")
    email = Column(String, default="Kumar@modernchainlink.com")
    address = Column(String, default="Tiruchengode, Tamil Nadu")
    gst_number = Column(String, default="33AAAAA0000A1Z5")
    tagline = Column(String, default="Strong Fencing. Trusted Quality.")
    logo_url = Column(String, default="assets/images/logo.png")
    version = Column(String, default="2.0.0")
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
