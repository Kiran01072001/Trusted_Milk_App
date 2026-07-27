from datetime import datetime, timedelta
from jose import jwt
from config.settings import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES

def create_access_token(user_id: str, mobile: str) -> str:
    payload = {
        "sub": user_id,
        "mobile": mobile,
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
