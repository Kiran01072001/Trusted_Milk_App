from fastapi import APIRouter, Depends, Request
from schemas.auth_schema import SignupRequest, LoginRequest
from services.auth_service import signup, login
from middleware.auth_middleware import get_current_user
from config.app_config import database

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
async def signup_route(body: SignupRequest):
    result = await signup(body)
    if not result["success"]:
        return {"status": "error", "message": result["message"]}
    return {"status": "success", "customer_code": result["customer_code"]}

@router.post("/login")
async def login_route(body: LoginRequest, request: Request):
    forwarded_for = request.headers.get("x-forwarded-for")
    ip_address = forwarded_for.split(",")[0].strip() if forwarded_for else None
    if not ip_address and request.client:
        ip_address = request.client.host

    result = await login(body, ip_address=ip_address)
    if not result["success"]:
        return {"status": "error", "message": result["message"]}
    return {
        "status": "success",
        "token": result["token"],
        "customer_code": result["customer_code"],
        "full_name": result["full_name"],
    }


@router.post("/logout")
async def logout_route(
    current_user: dict = Depends(get_current_user),
    request: Request = None,
):
    """
    Deactivates the current session in login_sessions.
    Frontend must also clear AsyncStorage on its side.
    """
    # Extract the raw token from the Authorization header
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()

    await database.execute(
        """UPDATE login_sessions
           SET is_active = FALSE
           WHERE user_id = :uid AND token = :token""",
        {"uid": current_user["user_id"], "token": token},
    )
    return {"status": "success", "message": "Logged out successfully"}
