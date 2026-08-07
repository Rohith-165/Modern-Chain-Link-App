from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, UTC
from app.database.base import Base

class StockItem(Base):
    __tablename__ = "stock_items"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False, index=True)
    category = Column(String, default="Fence Roll", index=True) # "Fence Roll", "Barbed Wire", "Binding Wire", "Poles", "Raw Wire"
    unit = Column(String, default="Rolls")                      # "Rolls", "Kg", "Sq.Ft", "Pieces", "Bundles"
    
    shop_quantity = Column(Float, default=0.0)                 # Stock in Shop
    factory_quantity = Column(Float, default=0.0)              # Stock in Factory
    reorder_level = Column(Float, default=5.0)                # Low stock warning threshold
    
    price_per_unit = Column(Float, default=0.0)
    height = Column(String, nullable=True)
    diamond_size = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    location_place = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
