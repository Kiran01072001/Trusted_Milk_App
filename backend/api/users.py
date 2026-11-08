from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user
from config.app_config import database

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns the authenticated user's profile.
    Also used by the frontend to validate a stored token on app boot.
    """
    row = await database.fetch_one(
        """SELECT id, customer_code, full_name, mobile_number,
                  email, gender, account_status, last_login, created_at
           FROM users
           WHERE id = :uid AND account_status = 'ACTIVE'""",
        {"uid": current_user["user_id"]},
    )
    if not row:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "status": "success",
        "user": {
            "id":             str(row["id"]),
            "customer_code":  row["customer_code"],
            "full_name":      row["full_name"],
            "mobile_number":  row["mobile_number"],
            "email":          row["email"],
            "gender":         row["gender"],
            "referral_code":  row["customer_code"],   # customer_code doubles as referral code
            "account_status": row["account_status"],
            "last_login":     str(row["last_login"]) if row["last_login"] else None,
            "member_since":   str(row["created_at"]),
        },
    }
