import uuid as uuid_module
from config.app_config import database
from datetime import datetime, timezone


def _utcnow():
    """Timezone-naive UTC datetime — what PostgreSQL TIMESTAMP columns expect."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _to_uuid(value: str | None):
    """Convert a UUID string to uuid.UUID so asyncpg sends it as the correct
    type without needing a ::uuid SQL cast (which breaks the databases library)."""
    if value is None:
        return None
    try:
        return uuid_module.UUID(str(value))
    except (ValueError, AttributeError):
        return None


async def get_or_create_wallet(user_id: str) -> dict:
    """Return existing wallet row, creating one if it doesn't exist yet."""
    row = await database.fetch_one(
        "SELECT * FROM user_wallets WHERE user_id = :uid",
        {"uid": _to_uuid(user_id)},
    )
    if row:
        return dict(row)

    await database.execute(
        """INSERT INTO user_wallets
               (user_id, wallet_balance, total_credited, total_debited,
                created_at, updated_at)
           VALUES (:uid, 0, 0, 0, :now, :now)""",
        {"uid": _to_uuid(user_id), "now": _utcnow()},
    )
    row = await database.fetch_one(
        "SELECT * FROM user_wallets WHERE user_id = :uid",
        {"uid": _to_uuid(user_id)},
    )
    return dict(row)


async def credit_wallet(
    user_id: str,
    amount: float,
    description: str,
    reference_id: str | None = None,
) -> dict:
    """Add amount to wallet and record a CREDIT transaction."""
    wallet = await get_or_create_wallet(user_id)
    wallet_id = str(wallet["id"])
    now = _utcnow()

    async with database.transaction():
        await database.execute(
            """UPDATE user_wallets
               SET wallet_balance = wallet_balance + :amt,
                   total_credited = total_credited + :amt,
                   updated_at     = :now
               WHERE id = :wid""",
            {"amt": amount, "now": now, "wid": _to_uuid(wallet_id)},
        )
        await database.execute(
            """INSERT INTO wallet_transactions
                   (wallet_id, user_id, transaction_type, amount,
                    description, reference_id, created_at)
               VALUES (:wid, :uid, 'CREDIT', :amt, :desc, :ref, :now)""",
            {
                "wid":  _to_uuid(wallet_id),
                "uid":  _to_uuid(user_id),
                "amt":  amount,
                "desc": description,
                "ref":  _to_uuid(reference_id),   # uuid.UUID object — no ::cast needed
                "now":  now,
            },
        )

    return await get_or_create_wallet(user_id)


async def debit_wallet(
    user_id: str,
    amount: float,
    description: str,
    reference_id: str | None = None,
) -> dict:
    """Deduct amount from wallet. Raises ValueError if balance is insufficient."""
    wallet = await get_or_create_wallet(user_id)
    if float(wallet["wallet_balance"]) < amount:
        raise ValueError("Insufficient wallet balance")

    wallet_id = str(wallet["id"])
    now = _utcnow()

    async with database.transaction():
        await database.execute(
            """UPDATE user_wallets
               SET wallet_balance = wallet_balance - :amt,
                   total_debited  = total_debited  + :amt,
                   updated_at     = :now
               WHERE id = :wid""",
            {"amt": amount, "now": now, "wid": _to_uuid(wallet_id)},
        )
        await database.execute(
            """INSERT INTO wallet_transactions
                   (wallet_id, user_id, transaction_type, amount,
                    description, reference_id, created_at)
               VALUES (:wid, :uid, 'DEBIT', :amt, :desc, :ref, :now)""",
            {
                "wid":  _to_uuid(wallet_id),
                "uid":  _to_uuid(user_id),
                "amt":  amount,
                "desc": description,
                "ref":  _to_uuid(reference_id),
                "now":  now,
            },
        )

    return await get_or_create_wallet(user_id)


async def get_transactions(user_id: str, limit: int = 50) -> list:
    rows = await database.fetch_all(
        """SELECT id, transaction_type, amount, description,
                  reference_id, created_at
           FROM wallet_transactions
           WHERE user_id = :uid
           ORDER BY created_at DESC
           LIMIT :lim""",
        {"uid": _to_uuid(user_id), "lim": limit},
    )
    return [dict(r) for r in rows]
