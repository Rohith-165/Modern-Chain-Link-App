from fastapi import APIRouter
from app.api.endpoints import auth, orders, customers, payments, dashboard, profile

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
