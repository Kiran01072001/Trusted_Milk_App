import uuid as uuid_module
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from security.jwt_handler import decode_access_token
from config.app_config import database

bearer_scheme = HTTPBearer()


def _to_uuid(value: str | None):
    if value is None:
        return None
    try:
        return uuid_module.UUID(str(value))
    except (ValueError, AttributeError):
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    FastAPI dependency.
    1. Decodes and validates the JWT signature + expiry.
    2. Confirms the session row in login_sessions is still active and
       not yet expired (comparison done in PostgreSQL to avoid Python
       timezone-aware vs naive datetime issues).
    """
    token = credentials.credentials

    # ── Step 1: JWT validation ────────────────────────────────────────────────
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # ── Step 2: Session still active? (PostgreSQL does the timestamp math) ───
    session = await database.fetch_one(
        """SELECT id
           FROM login_sessions
           WHERE user_id  = :uid
             AND token     = :token
             AND is_active = TRUE
             AND expires_at > NOW()""",
        {"uid": _to_uuid(user_id), "token": token},
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or logged out. Please log in again.",
        )

    return {"user_id": user_id, "mobile": payload.get("mobile")}
