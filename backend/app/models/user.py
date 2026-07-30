from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, UTC
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False, default="Administrator")
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
