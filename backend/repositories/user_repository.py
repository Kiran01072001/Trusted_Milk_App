import uuid as uuid_module
from config.app_config import database


def _to_uuid(value: str | None):
    """Convert a UUID string to uuid.UUID for proper driver-level typing."""
    if value is None:
        return None
    try:
        return uuid_module.UUID(str(value))
    except (ValueError, AttributeError):
        return None


async def get_user_by_id(user_id: str) -> dict | None:
    row = await database.fetch_one(
        """SELECT id, customer_code, full_name, mobile_number,
                  email, gender, account_status, referred_by,
                  last_login, created_at
           FROM users WHERE id = :uid""",
        {"uid": _to_uuid(user_id)},
    )
    return dict(row) if row else None


async def get_user_by_customer_code(customer_code: str) -> dict | None:
    row = await database.fetch_one(
        "SELECT id, customer_code, full_name FROM users WHERE customer_code = :cc",
        {"cc": customer_code},
    )
    return dict(row) if row else None


async def get_referral_count(user_id: str) -> int:
    """Number of users who signed up using this user's referral code."""
    user = await get_user_by_id(user_id)
    if not user:
        return 0
    row = await database.fetch_one(
        "SELECT COUNT(*) as cnt FROM users WHERE referred_by = :code",
        {"code": user["customer_code"]},
    )
    return row["cnt"] if row else 0
