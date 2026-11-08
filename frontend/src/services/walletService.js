import { apiFetch } from './api';

/**
 * Fetch the authenticated user's current wallet balance.
 * Returns { wallet_balance, total_credited, total_debited }
 */
export async function getWalletBalance() {
  const data = await apiFetch('/wallet/balance');
  return {
    balance:        data.wallet_balance,
    totalCredited:  data.total_credited,
    totalDebited:   data.total_debited,
  };
}

/**
 * Fetch the authenticated user's transaction history.
 * Returns an array of transaction objects.
 */
export async function getTransactions(limit = 50) {
  const data = await apiFetch(`/wallet/transactions?limit=${limit}`);
  return data.transactions ?? [];
}
