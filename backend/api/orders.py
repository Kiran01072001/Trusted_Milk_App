import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from middleware.auth_middleware import get_current_user
from services.referral_service import process_first_order_reward
from services.wallet_service import get_balance

router = APIRouter(prefix="/orders", tags=["Orders"])


class CompleteOrderRequest(BaseModel):
    order_id: str           # frontend-generated label, e.g. "TM1754123456789"
    payment_status: str = "PAID"


@router.post("/complete")
async def complete_order(
    body: CompleteOrderRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Finalize an order after payment succeeds.
    Triggers wallet/referral rewards if applicable.
    """
    if body.payment_status.upper() != "PAID":
        wallet = await get_balance(current_user["user_id"])
        return {
            "status":         "success",
            "message":        "Payment not confirmed — no rewards applied",
            "reward_applied": False,
            "wallet":         wallet,
        }

    # Use a real UUID as the DB reference so UUID columns don't choke.
    # The frontend label is kept for display purposes only.
    db_order_id = str(uuid.uuid4())

    reward = await process_first_order_reward(db_order_id, current_user["user_id"])
    wallet = await get_balance(current_user["user_id"])

    return {
        "status":         "success",
        "message":        "Order completed successfully",
        "reward_applied": reward.get("applied", False),
        "reward":         reward,
        "wallet":         wallet,
    }
