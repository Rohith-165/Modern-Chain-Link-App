from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api import api_router
from app.database.session import engine, SessionLocal
from app.database.base import Base
from app.services.auth_service import init_default_admin

# Import models so Base.metadata knows about them
from app.models import user, customer, order, payment  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed admin
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        init_default_admin(db)
    finally:
        db.close()
    yield
    # Shutdown: nothing extra needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "api": settings.API_V1_STR
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Modern Chain Link Company Backend"}
