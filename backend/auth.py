import os
from datetime import datetime, timedelta
from typing import Optional
import httpx
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_ASCON_KEY_SHOULD_BE_IN_ENV")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_google_token(id_token: str) -> Optional[dict]:
    """
    Verifies a Google OAuth ID token against Google's tokeninfo API.
    Returns user payload dict (email, sub, name, picture, etc.) if valid, or None if invalid.
    """
    try:
        # Reload env variables dynamically in case .env was updated while server is running
        load_dotenv(override=True)
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token}
            )
            if response.status_code != 200:
                print(f"[Google Auth Error] Token verification failed from Google API: {response.status_code} - {response.text}")
                return None
            
            payload = response.json()
            
            configured_key = os.getenv("OAUTH_KEY", "").strip().strip('"').strip("'")
            if configured_key and configured_key != "your_google_oauth_client_id_here":
                token_aud = payload.get("aud", "")
                token_azp = payload.get("azp", "")
                
                # Check if configured key matches audience or authorized party
                if configured_key != token_aud and configured_key != token_azp:
                    print(f"[Google Auth Mismatch] Configured key ({configured_key}) does not match token aud ({token_aud}) or azp ({token_azp})")
                    return None
                    
            return payload
    except Exception as e:
        print(f"[Google Auth Exception] {e}")
        return None


