import os
import base64
import json
from pydantic_settings import BaseSettings

def get_firebase_credentials() -> dict:
    """Get Firebase credentials from environment variable.
    
    Supports two methods:
    1. FIREBASE_CREDENTIALS_BASE64: Base64-encoded JSON (recommended for cloud deployment)
    2. Individual FIREBASE_* environment variables (fallback)
    """
    # Method 1: Try base64-encoded full credentials (recommended)
    base64_creds = os.getenv("FIREBASE_CREDENTIALS_BASE64", "")
    if base64_creds:
        try:
            decoded = base64.b64decode(base64_creds).decode('utf-8')
            return json.loads(decoded)
        except Exception as e:
            print(f"Warning: Failed to decode FIREBASE_CREDENTIALS_BASE64: {e}")
    
    # Method 2: Build from individual environment variables
    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "")
    # Handle various newline escape scenarios
    private_key = private_key.replace("\\\\n", "\n").replace("\\n", "\n")
    
    return {
        "type": os.getenv("FIREBASE_TYPE", "service_account"),
        "project_id": os.getenv("FIREBASE_PROJECT_ID", ""),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", ""),
        "private_key": private_key,
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL", ""),
        "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
        "auth_uri": os.getenv("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth"),
        "token_uri": os.getenv("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token"),
        "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL", "https://www.googleapis.com/oauth2/v1/certs"),
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL", ""),
    }

class Settings(BaseSettings):
    PROJECT_NAME: str = "BrandFrame Studio Backend"
    API_V1_STR: str = "/api/v1"
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000", "https://brand-frame-studio.vercel.app"]

    class Config:
        env_file = ".env"

settings = Settings()
firebase_credentials = get_firebase_credentials()
