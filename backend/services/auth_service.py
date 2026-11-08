import random
import string
import uuid as uuid_module
from datetime import datetime, timedelta, timezone
from config.app_config import database
from config.settings import JWT_EXPIRE_MINUTES
from schemas.auth_schema import SignupRequest, LoginRequest
from security.jwt_handler import create_access_token
from services.otp_service import verify_otp


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _to_uuid(value):
    if value is None:
        return None
    try:
        return uuid_module.UUID(str(value))
    except (ValueError, AttributeError):
        return None


def _gen_customer_code():
    return "TM" + "".join(random.choices(string.digits, k=8))


async def signup(data: SignupRequest) -> dict:
    row = await database.fetch_one(
        "SELECT id, otp_verified FROM users WHERE mobile_number = :mobile",
        {"mobile": data.mobile_number},
    )
    if not row:
        return {"success": False, "message": "Please send and verify OTP first"}
    if not row["otp_verified"]:
        return {"success": False, "message": "Mobile number not verified"}

    referred_by = data.referred_by or None
    now = _utcnow()
    cc = _gen_customer_code()
    user_id = str(row["id"])

    async with database.transaction():
        # Complete the user record
        await database.execute(
            """UPDATE users SET
                customer_code     = :cc,
                full_name         = :name,
                email             = :email,
                gender            = :gender,
                referred_by       = :referred_by,
                terms_accepted    = :terms,
                terms_accepted_at = :terms_at,
                updated_at        = :now
               WHERE mobile_number = :mobile""",
            {
                "cc":          cc,
                "name":        data.full_name,
                "email":       data.email,
                "gender":      data.gender,
                "referred_by": referred_by,
                "terms":       data.terms_accepted,
                "terms_at":    now if data.terms_accepted else None,
                "now":         now,
                "mobile":      data.mobile_number,
            },
        )

        # Initialise wallet row so balance is always queryable from day one
        existing_wallet = await database.fetch_one(
            "SELECT id FROM user_wallets WHERE user_id = :uid",
            {"uid": _to_uuid(user_id)},
        )
        if not existing_wallet:
            await database.execute(
                """INSERT INTO user_wallets
                       (user_id, wallet_balance, total_credited, total_debited,
                        created_at, updated_at)
                   VALUES (:uid, 0, 0, 0, :now, :now)""",
                {"uid": _to_uuid(user_id), "now": now},
            )

    return {"success": True, "customer_code": cc}


async def login(data: LoginRequest, ip_address: str | None = None) -> dict:
    result = await verify_otp(data.mobile_number, data.otp)
    if not result["success"]:
        return {"success": False, "message": result["message"]}

    row = await database.fetch_one(
        """SELECT id, customer_code, full_name, account_status
           FROM users WHERE mobile_number = :mobile AND full_name != 'Pending'""",
        {"mobile": data.mobile_number},
    )
    if not row:
        return {"success": False, "message": "No account found. Please sign up first."}
    if row["account_status"] != "ACTIVE":
        return {"success": False, "message": "Your account is inactive. Contact support."}

    now = _utcnow()
    expires_at = now + timedelta(minutes=JWT_EXPIRE_MINUTES)
    token = create_access_token(str(row["id"]), data.mobile_number)
    device_info = data.device_info[:255] if data.device_info else None
    ip_address  = ip_address[:45] if ip_address else None

    async with database.transaction():
        await database.execute(
            "UPDATE users SET last_login = :now, updated_at = :now WHERE mobile_number = :mobile",
            {"now": now, "mobile": data.mobile_number},
        )
        await database.execute(
            """INSERT INTO login_sessions
                   (user_id, token, device_info, ip_address,
                    logged_in_at, expires_at, is_active, created_at)
               VALUES (:user_id, :token, :device_info, :ip_address,
                       :logged_in_at, :expires_at, TRUE, :created_at)""",
            {
                "user_id":      _to_uuid(str(row["id"])),
                "token":        token,
                "device_info":  device_info,
                "ip_address":   ip_address,
                "logged_in_at": now,
                "expires_at":   expires_at,
                "created_at":   now,
            },
        )

    return {
        "success":       True,
        "token":         token,
        "customer_code": row["customer_code"],
        "full_name":     row["full_name"],
    }
