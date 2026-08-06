from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.services.auth_service import authenticate_user
from app.core.security import create_access_token
from app.core.logger import log_auth_event
from app.schemas.user import Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    clean_username = (form_data.username or "").strip()
    clean_password = (form_data.password or "").strip()

    # Always seed/refresh default accounts before checking credentials
    from app.core.auth import init_default_admin
    init_default_admin(db)

    user = authenticate_user(db, clean_username, clean_password)
    if not user:
        log_auth_event(clean_username, False, "Invalid credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    log_auth_event(user.email, True, "Login successful")
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/seed-users")
def seed_default_users(db: Session = Depends(get_db)):
    from app.core.auth import init_default_admin
    init_default_admin(db)
    return {"status": "ok", "message": "Default admin and employee accounts seeded successfully."}
