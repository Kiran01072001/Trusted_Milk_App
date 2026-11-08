from pydantic import BaseModel
from typing import Optional


class WalletBalanceResponse(BaseModel):
    wallet_balance: float
    total_credited: float
    total_debited:  float


class TransactionItem(BaseModel):
    id:           str
    type:         str          # CREDIT | DEBIT
    amount:       float
    description:  Optional[str]
    reference_id: Optional[str]
    created_at:   str
