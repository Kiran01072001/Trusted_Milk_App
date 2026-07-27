from pydantic import BaseModel
from typing import Optional

class SignupRequest(BaseModel):
    full_name: str
    mobile_number: str
    email: Optional[str] = None
    gender: Optional[str] = None
    referred_by: Optional[str] = None
    terms_accepted: bool

class LoginRequest(BaseModel):
    mobile_number: str
    otp: str
    device_info: Optional[str] = None
