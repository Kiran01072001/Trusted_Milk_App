from fastapi import APIRouter, Request
from schemas.auth_schema import SignupRequest, LoginRequest
from services.auth_service import signup, login

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
