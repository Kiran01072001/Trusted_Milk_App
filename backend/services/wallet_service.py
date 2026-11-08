from repositories.wallet_repository import (
    get_or_create_wallet,
    credit_wallet,
    debit_wallet,
    get_transactions,
)


async def get_balance(user_id: str) -> dict:
    wallet = await get_or_create_wallet(user_id)
    return {
        "wallet_balance": float(wallet["wallet_balance"]),
        "total_credited": float(wallet["total_credited"]),
        "total_debited":  float(wallet["total_debited"]),
    }


async def get_transaction_history(user_id: str, limit: int = 50) -> list:
    rows = await get_transactions(user_id, limit)
    return [
        {
            "id":               str(r["id"]),
            "type":             r["transaction_type"],
            "amount":           float(r["amount"]),
            "description":      r["description"],
            "reference_id":     str(r["reference_id"]) if r["reference_id"] else None,
            "created_at":       str(r["created_at"]),
        }
        for r in rows
    ]


async def add_referral_reward(user_id: str, amount: float,
                              description: str, reference_id: str | None = None) -> dict:
    """Credit a referral reward into the user's wallet."""
    wallet = await credit_wallet(user_id, amount, description, reference_id)
    return {
        "wallet_balance": float(wallet["wallet_balance"]),
        "credited":       amount,
    }
