from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.dependencies import get_db
from app.schemas.stock import StockCreate, StockUpdate, StockResponse
from app.services import stock_service

router = APIRouter()

@router.get("", response_model=List[StockResponse])
def read_stock(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return stock_service.get_all_stock(db, category=category, search=search)

@router.post("", response_model=StockResponse, status_code=status.HTTP_201_CREATED)
def create_stock(
    stock_in: StockCreate,
    db: Session = Depends(get_db)
):
    return stock_service.create_stock_item(db, stock_in)

@router.put("/{stock_id}", response_model=StockResponse)
def update_stock(
    stock_id: int,
    stock_in: StockUpdate,
    db: Session = Depends(get_db)
):
    item = stock_service.update_stock_item(db, stock_id, stock_in)
    if not item:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return item

@router.delete("", status_code=status.HTTP_200_OK)
def delete_all_stock_items(db: Session = Depends(get_db)):
    deleted_count = stock_service.delete_all_stock(db)
    return {"status": "ok", "message": f"All {deleted_count} stock items have been deleted.", "deleted_count": deleted_count}

@router.delete("/{stock_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stock(
    stock_id: int,
    db: Session = Depends(get_db)
):
    success = stock_service.delete_stock_item(db, stock_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return None
