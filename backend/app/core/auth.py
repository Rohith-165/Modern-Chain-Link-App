from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from app.core.config import settings
from app.core.security import verify_password, get_password_hash
from app.database.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def init_default_admin(db: Session):
    admin = get_user_by_email(db, "Kumar@modernchainlink.com")
    if not admin:
        new_admin = User(
            email="Kumar@modernchainlink.com",
            full_name="Santhosh Kumar",
            hashed_password=get_password_hash("modern@123"),
            is_active=True,
            is_superuser=True
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
    return admin

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active or not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
