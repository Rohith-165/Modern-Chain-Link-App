from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.user import User
from app.models.company import Company
from app.schemas.user import UserResponse
from app.schemas.company import CompanyResponse, CompanyUpdate

router = APIRouter()

@router.get("/admin", response_model=UserResponse)
def get_admin_profile(db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.email == "Kumar@modernchainlink.com").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin profile not found")
    return admin

@router.get("/company", response_model=CompanyResponse)
def get_company_profile(db: Session = Depends(get_db)):
    company = db.query(Company).first()
    if not company:
        company = Company()
        db.add(company)
        db.commit()
        db.refresh(company)
    return company

@router.put("/company", response_model=CompanyResponse)
def update_company_profile(company_in: CompanyUpdate, db: Session = Depends(get_db)):
    company = db.query(Company).first()
    if not company:
        company = Company()
        db.add(company)

    for field, value in company_in.model_dump(exclude_unset=True).items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)
    return company
