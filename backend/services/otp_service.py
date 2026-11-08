import httpx
import uuid
from datetime import datetime, timedelta, timezone
from config.settings import TWO_FACTOR_API_KEY
from config.app_config import database


def _normalize_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc).astimezone(timezone.utc).replace(tzinfo=None)
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value

_SEND_URL = "https://2factor.in/API/V1/{key}/SMS/{mobile}/AUTOGEN"
_VERIFY_URL = "https://2factor.in/API/V1/{key}/SMS/VERIFY/{session}/{otp}"

async def send_otp(mobile_number: str) -> dict:
    url = _SEND_URL.format(key=TWO_FACTOR_API_KEY, mobile=mobile_number)
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        data = resp.json()

    if data.get("Status") != "Success":
        return {"success": False, "message": data.get("Details", "Failed to send OTP")}

    session_id = data["Details"]
    now = _normalize_datetime(datetime.now(timezone.utc))

    existing = await database.fetch_one(
        "SELECT id FROM users WHERE mobile_number = :mobile",
        {"mobile": mobile_number}
    )

    if existing:
        await database.execute(
            "UPDATE users SET otp_session_id = :s, otp_sent_at = :t, otp_verified = FALSE WHERE mobile_number = :m",
            {"s": session_id, "t": now, "m": mobile_number}
        )
    else:
        # Placeholder row — completed during signup
        import random, string
        cc = "TM" + "".join(random.choices(string.digits, k=8))
        await database.execute(
            """INSERT INTO users
               (id, customer_code, full_name, mobile_number,
                otp_session_id, otp_sent_at, terms_accepted, created_at, updated_at)
               VALUES (:id, :cc, :name, :mobile,
                       :s, :t, FALSE, :now, :now)""",
            {
                "id": str(uuid.uuid4()), "cc": cc,
                "name": "Pending", "mobile": mobile_number,
                "s": session_id, "t": now, "now": now,
            }
        )

    return {"success": True}

async def verify_otp(mobile_number: str, otp: str) -> dict:
    row = await database.fetch_one(
        "SELECT otp_session_id, otp_sent_at FROM users WHERE mobile_number = :mobile",
        {"mobile": mobile_number}
    )
    if not row or not row["otp_session_id"]:
        return {"success": False, "message": "OTP not sent for this number"}

    otp_sent_at = _normalize_datetime(row["otp_sent_at"])
    if otp_sent_at is None:
        return {"success": False, "message": "OTP expired"}

    current_time = _normalize_datetime(datetime.now(timezone.utc))
    if current_time is None:
        return {"success": False, "message": "OTP expired"}

    if current_time - otp_sent_at > timedelta(minutes=10):
        return {"success": False, "message": "OTP expired"}

    url = _VERIFY_URL.format(
        key=TWO_FACTOR_API_KEY,
        session=row["otp_session_id"],
        otp=otp
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        data = resp.json()

    if data.get("Status") == "Success" and data.get("Details") == "OTP Matched":
        await database.execute(
            "UPDATE users SET otp_verified = TRUE, mobile_verified = TRUE WHERE mobile_number = :mobile",
            {"mobile": mobile_number}
        )
        return {"success": True}

    return {"success": False, "message": "Invalid OTP"}
