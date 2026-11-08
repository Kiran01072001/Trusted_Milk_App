import { apiFetch } from './api';

/**
 * Fetch the authenticated user's referral stats.
 * Returns { referral_code, friends_count, rewards_paid, total_earned }
 */
export async function getReferralStats() {
  const data = await apiFetch('/referrals/stats');
  return {
    referralCode:  data.referral_code,
    friendsCount:  data.friends_count,
    rewardsPaid:   data.rewards_paid,
    totalEarned:   data.total_earned,
  };
}

/**
 * Trigger referral reward processing after a first order is placed.
 * Safe to call even if no referral applies — server handles it gracefully.
 */
export async function processFirstOrderReward(orderId) {
  return apiFetch('/referrals/process-first-order-reward', {
    method: 'POST',
    body:   JSON.stringify({ order_id: orderId }),
  });
}

export async function completeOrder(orderId, paymentStatus = 'PAID') {
  return apiFetch('/orders/complete', {
    method: 'POST',
    body:   JSON.stringify({ order_id: orderId, payment_status: paymentStatus }),
  });
}
