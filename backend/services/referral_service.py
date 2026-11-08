import uuid as uuid_module
from datetime import datetime, timezone

from config.app_config import database
from repositories.user_repository import get_user_by_id, get_user_by_customer_code
from services.wallet_service import add_referral_reward


def _utcnow():
    """Timezone-naive UTC datetime — what PostgreSQL TIMESTAMP columns expect."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _to_uuid(value: str):
    """Convert a UUID string to a uuid.UUID object so the databases/asyncpg
    driver sends it as a proper UUID type without needing a ::uuid SQL cast."""
    try:
        return uuid_module.UUID(value)
    except (ValueError, AttributeError):
        return None


REFERRAL_REWARD = 50.0   # ₹50 credited to both users


async def get_referral_stats(user_id: str) -> dict:
    user = await get_user_by_id(user_id)
    if not user:
        return {}

    referral_code = user["customer_code"]

    friends_row = await database.fetch_one(
        "SELECT COUNT(*) AS cnt FROM users WHERE referred_by = :code",
        {"code": referral_code},
    )
    friends_count = int(friends_row["cnt"]) if friends_row else 0

    rewards_row = await database.fetch_one(
        """SELECT COUNT(*) AS cnt, COALESCE(SUM(reward_amount), 0) AS total
           FROM referrals
           WHERE referrer_user_id = :uid AND reward_given = TRUE""",
        {"uid": _to_uuid(user_id)},
    )
    rewards_paid = int(rewards_row["cnt"])    if rewards_row else 0
    total_earned = float(rewards_row["total"]) if rewards_row else 0.0

    return {
        "referral_code": referral_code,
        "friends_count": friends_count,
        "rewards_paid":  rewards_paid,
        "total_earned":  total_earned,
    }


async def process_first_order_reward(order_uuid: str, buyer_user_id: str) -> dict:
    """
    Called after a successful first order.
    Credits ₹50 to both the buyer and the referrer (if a referral code exists).
    Fully idempotent — safe to call multiple times for the same buyer.
    """
    if not buyer_user_id:
        return {"applied": False, "reason": "missing buyer user_id"}

    buyer = await get_user_by_id(buyer_user_id)
    if not buyer:
        return {"applied": False, "reason": "buyer not found"}

    referred_by = buyer.get("referred_by")
    if not referred_by:
        return {"applied": False, "reason": "buyer has no referral code"}

    # Idempotency guard
    already_rewarded = await database.fetch_one(
        "SELECT id FROM referrals WHERE referred_user_id = :uid AND reward_given = TRUE",
        {"uid": _to_uuid(buyer_user_id)},
    )
    if already_rewarded:
        return {"applied": False, "reason": "reward already processed"}

    referrer = await get_user_by_customer_code(referred_by)
    if not referrer:
        return {"applied": False, "reason": f"referrer '{referred_by}' not found"}

    referrer_id = str(referrer["id"])
    now = _utcnow()

    # Insert the referral lock row only if one doesn't already exist
    pending = await database.fetch_one(
        "SELECT id FROM referrals WHERE referred_user_id = :uid",
        {"uid": _to_uuid(buyer_user_id)},
    )
    if not pending:
        # Pass Python uuid.UUID objects — no ::uuid cast needed in SQL
        query = """
            INSERT INTO referrals
            (referrer_user_id, referred_user_id, referral_code,
             reward_given, reward_amount, first_order_id, created_at)
            VALUES (:referrer_id, :referred_id, :code,
                    FALSE, :amount, :first_order_id, :now)
        """
        values = {
            "referrer_id": _to_uuid(referrer_id),
            "referred_id": _to_uuid(buyer_user_id),
            "code":        referred_by,
            "amount":      REFERRAL_REWARD,
            "first_order_id": _to_uuid(order_uuid),
            "now":         now,
        }
        await database.execute(query, values)

    # Credit ₹50 to both wallets
    await add_referral_reward(
        referrer_id,
        REFERRAL_REWARD,
        "Referral reward – your friend placed their first order!",
        order_uuid,
    )
    await add_referral_reward(
        buyer_user_id,
        REFERRAL_REWARD,
        f"Welcome reward – you used referral code {referred_by}",
        order_uuid,
    )

    # Flip reward_given = TRUE
    await database.execute(
        """UPDATE referrals
           SET reward_given = TRUE, rewarded_at = :now
           WHERE referred_user_id = :uid""",
        {"uid": _to_uuid(buyer_user_id), "now": now},
    )

    return {
        "applied":       True,
        "referrer_id":   referrer_id,
        "buyer_id":      buyer_user_id,
        "amount_each":   REFERRAL_REWARD,
        "referral_code": referred_by,
    }
