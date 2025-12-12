import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BrandFrame Studio Backend"
    API_V1_STR: str = "/api/v1"
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    # Firebase Admin SDK credentials (from environment variables)
    FIREBASE_TYPE: str = os.getenv("FIREBASE_TYPE", "service_account")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_PRIVATE_KEY_ID: str = os.getenv("FIREBASE_PRIVATE_KEY_ID", "")
    FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n")
    FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    FIREBASE_CLIENT_ID: str = os.getenv("FIREBASE_CLIENT_ID", "")
    FIREBASE_AUTH_URI: str = os.getenv("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth")
    FIREBASE_TOKEN_URI: str = os.getenv("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token")
    FIREBASE_AUTH_PROVIDER_CERT_URL: str = os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL", "https://www.googleapis.com/oauth2/v1/certs")
    FIREBASE_CLIENT_CERT_URL: str = os.getenv("FIREBASE_CLIENT_CERT_URL", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000", "https://brand-frame-studio.vercel.app"]

    class Config:
        env_file = ".env"

settings = Settings()
