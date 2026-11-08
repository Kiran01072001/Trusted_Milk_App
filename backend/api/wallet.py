from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user
from services.wallet_service import get_balance, get_transaction_history

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.get("/balance")
async def wallet_balance(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's wallet balance."""
    data = await get_balance(current_user["user_id"])
    return {"status": "success", **data}


@router.get("/transactions")
async def wallet_transactions(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    """Return the last N wallet transactions for the authenticated user."""
    txns = await get_transaction_history(current_user["user_id"], limit)
    return {"status": "success", "transactions": txns}
