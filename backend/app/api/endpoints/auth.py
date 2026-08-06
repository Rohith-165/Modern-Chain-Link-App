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

@router.post("/reset-users-now")
def reset_users_now(db: Session = Depends(get_db)):
    from app.core.auth import get_user_by_email
    from app.core.security import get_password_hash, verify_password
    from app.models.user import User

    users_data = [
        {"email": "Kumar@modernchainlink.com", "full_name": "Santhosh Kumar", "password": "modern@123", "is_superuser": True},
        {"email": "Kavitha@modernchainlink.com", "full_name": "Kavitha", "password": "Kavitha@123", "is_superuser": False},
        {"email": "Manimekalai@modernchainlink.com", "full_name": "Manimekalai", "password": "Mani@123", "is_superuser": False},
    ]
    results = []
    for u in users_data:
        usr = get_user_by_email(db, u["email"])
        new_hash = get_password_hash(u["password"])
        if not usr:
            usr = User(
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=new_hash,
                is_active=True,
                is_superuser=u["is_superuser"]
            )
            db.add(usr)
        else:
            usr.hashed_password = new_hash
            usr.full_name = u["full_name"]
            usr.is_active = True
            usr.is_superuser = u["is_superuser"]
            db.add(usr)
        db.commit()
        db.refresh(usr)
        
        auth_ok = verify_password(u["password"], usr.hashed_password)
        results.append({"email": usr.email, "id": usr.id, "auth_verified": auth_ok})
    return {"status": "ok", "users": results}
