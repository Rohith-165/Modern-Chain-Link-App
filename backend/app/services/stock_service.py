from sqlalchemy.orm import Session
from app.models.stock import StockItem
from app.schemas.stock import StockCreate, StockUpdate

def init_default_stock(db: Session, force: bool = False):
    if force or db.query(StockItem).count() == 0:
        defaults = [
            {"item_name": "TATA Chain Link Fence 2x2 Inch (6 Ft)", "category": "Fence Roll", "unit": "Rolls", "shop_quantity": 25.0, "factory_quantity": 120.0, "reorder_level": 10.0, "price_per_unit": 3500.0},
            {"item_name": "TATA Chain Link Fence 2x2 Inch (5 Ft)", "category": "Fence Roll", "unit": "Rolls", "shop_quantity": 15.0, "factory_quantity": 80.0, "reorder_level": 8.0, "price_per_unit": 2900.0},
            {"item_name": "Micon Barbed Wire (12 Gauge)", "category": "Barbed Wire", "unit": "Kg", "shop_quantity": 150.0, "factory_quantity": 650.0, "reorder_level": 50.0, "price_per_unit": 95.0},
            {"item_name": "Binding Wire (14 Gauge)", "category": "Binding Wire", "unit": "Kg", "shop_quantity": 45.0, "factory_quantity": 200.0, "reorder_level": 20.0, "price_per_unit": 85.0},
            {"item_name": "Stone Poles 7 Feet", "category": "Poles", "unit": "Pieces", "shop_quantity": 60.0, "factory_quantity": 300.0, "reorder_level": 15.0, "price_per_unit": 420.0},
            {"item_name": "Galvanized GI Wire Raw Coil", "category": "Raw Wire", "unit": "Kg", "shop_quantity": 500.0, "factory_quantity": 3500.0, "reorder_level": 200.0, "price_per_unit": 72.0},
        ]
        for d in defaults:
            item = StockItem(**d)
            db.add(item)
        db.commit()

def get_all_stock(db: Session, category: str = None, search: str = None):
    query = db.query(StockItem)
    if category and category != "All":
        query = query.filter(StockItem.category == category)
    if search:
        search_fmt = f"%{search.lower()}%"
        query = query.filter(
            (StockItem.item_name.ilike(search_fmt)) |
            (StockItem.category.ilike(search_fmt))
        )
    return query.order_by(StockItem.id.asc()).all()

def create_stock_item(db: Session, stock_in: StockCreate) -> StockItem:
    item = StockItem(**stock_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def update_stock_item(db: Session, stock_id: int, stock_in: StockUpdate) -> StockItem:
    item = db.query(StockItem).filter(StockItem.id == stock_id).first()
    if not item:
        return None
    
    update_data = stock_in.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(item, key, val)
        
    db.commit()
    db.refresh(item)
    return item

def delete_stock_item(db: Session, stock_id: int) -> bool:
    item = db.query(StockItem).filter(StockItem.id == stock_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True

def delete_all_stock(db: Session) -> int:
    num_deleted = db.query(StockItem).delete()
    db.commit()
    return num_deleted
