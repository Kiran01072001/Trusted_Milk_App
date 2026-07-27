from fastapi import APIRouter
from schemas.otp_schema import SendOtpRequest, VerifyOtpRequest
from services.otp_service import send_otp, verify_otp

router = APIRouter(prefix="/otp", tags=["OTP"])

@router.post("/send")
async def send_otp_route(body: SendOtpRequest):
    result = await send_otp(body.mobile_number)
    if not result["success"]:
        return {"status": "error", "message": result["message"]}
    return {"status": "success", "message": "OTP sent"}

@router.post("/verify")
async def verify_otp_route(body: VerifyOtpRequest):
    result = await verify_otp(body.mobile_number, body.otp)
    if not result["success"]:
        return {"status": "error", "message": result["message"]}
    return {"status": "success", "message": "OTP verified"}
