from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class CompanyBase(BaseModel):
    name: str = "Modern Chain Link Company"
    phone: Optional[str] = "9876543210"
    email: Optional[EmailStr] = "Kumar@modernchainlink.com"
    address: Optional[str] = "Tiruchengode, Tamil Nadu"
    gst_number: Optional[str] = "33AAAAA0000A1Z5"
    tagline: Optional[str] = "Strong Fencing. Trusted Quality."
    logo_url: Optional[str] = "assets/images/logo.png"
    version: Optional[str] = "2.0.0"

class CompanyUpdate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    updated_at: datetime
