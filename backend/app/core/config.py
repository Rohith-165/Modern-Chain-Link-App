from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", case_sensitive=True)

    PROJECT_NAME: str = "Modern Chain Link Company API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "mclc-secret-key-super-secure-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "sqlite:///./mclc.db"
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
