from pydantic import BaseModel, EmailStr
from typing import Optional

class SendOtpRequest(BaseModel):
    mobile_number: str

class VerifyOtpRequest(BaseModel):
    mobile_number: str
    otp: str
