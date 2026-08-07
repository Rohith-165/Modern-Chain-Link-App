from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class StockCreate(BaseModel):
    item_name: str
    category: Optional[str] = "Fence Roll"
    unit: Optional[str] = "Rolls"
    shop_quantity: Optional[float] = 0.0
    factory_quantity: Optional[float] = 0.0
    reorder_level: Optional[float] = 5.0
    price_per_unit: Optional[float] = 0.0
    height: Optional[str] = None
    length_ft: Optional[str] = None
    diamond_size: Optional[str] = None
    brand: Optional[str] = None
    location_place: Optional[str] = None
    notes: Optional[str] = None

class StockUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    shop_quantity: Optional[float] = None
    factory_quantity: Optional[float] = None
    reorder_level: Optional[float] = None
    price_per_unit: Optional[float] = None
    height: Optional[str] = None
    length_ft: Optional[str] = None
    diamond_size: Optional[str] = None
    brand: Optional[str] = None
    location_place: Optional[str] = None
    notes: Optional[str] = None

class StockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_name: str
    category: str
    unit: str
    shop_quantity: float
    factory_quantity: float
    reorder_level: float
    price_per_unit: float
    height: Optional[str] = None
    length_ft: Optional[str] = None
    diamond_size: Optional[str] = None
    brand: Optional[str] = None
    location_place: Optional[str] = None
    notes: Optional[str] = None
    updated_at: Optional[datetime] = None
