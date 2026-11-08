from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user
from services.referral_service import get_referral_stats, process_first_order_reward
from pydantic import BaseModel

router = APIRouter(prefix="/referrals", tags=["Referrals"])


@router.get("/stats")
async def referral_stats(current_user: dict = Depends(get_current_user)):
    """
    Returns the authenticated user's referral code + stats:
    friends_count, rewards_paid, total_earned.
    """
    stats = await get_referral_stats(current_user["user_id"])
    return {"status": "success", **stats}


class FirstOrderRewardRequest(BaseModel):
    order_id: str


@router.post("/process-first-order-reward")
async def trigger_referral_reward(
    body: FirstOrderRewardRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Called by the frontend immediately after a user's first order is placed.
    Credits ₹50 to both the buyer and the referrer (if a referral code exists).
    Safe to call even if no referral applies — returns empty result in that case.
    """
    result = await process_first_order_reward(body.order_id, current_user["user_id"])
    if not result:
        return {"status": "success", "message": "No referral reward applicable"}
    return {
        "status":  "success",
        "message": f"Referral reward of ₹{result['amount_each']} credited to both users",
        **result,
    }
