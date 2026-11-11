'use strict';

function getRevenueActivity(records, period = 'all', page = 1, limit = 20, nowSeconds = Math.floor(Date.now() / 1000)) {
  const days = { '7d': 7, '30d': 30, '90d': 90, all: null };
  if (!Object.prototype.hasOwnProperty.call(days, period)) throw new Error('Invalid revenue period');
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error('Invalid pagination');
  const cutoff = days[period] === null ? null : nowSeconds - days[period] * 86400;
  const seen = new Set();
  const items = [];
  for (const r of records) {
    if (r.status !== 'verified' || typeof r.signature !== 'string' || !r.signature || seen.has(r.signature)) continue;
    const time = Number(r.blockTime);
    if (!Number.isFinite(time) || time <= 0 || time > nowSeconds || (cutoff !== null && time < cutoff)) continue;
    const fee = r.serviceFeeLamports ?? r.feeLamports;
    if (fee == null || !/^\d+$/.test(String(fee))) continue;
    const reward = r.referralRewardLamports ?? '0';
    if (!/^\d+$/.test(String(reward))) continue;
    const net = BigInt(fee);
    const referral = BigInt(reward);
    const sol = n => Number(n) / 1e9;
    const referralDataIncomplete = Boolean(r.recovered && !r.quoteId);
    seen.add(r.signature);
    items.push({ signature: r.signature, blockTime: time, status: 'verified', grossCollectedSol: referralDataIncomplete ? null : sol(net + referral), referralRewardsSol: referralDataIncomplete ? null : sol(referral), netRevenueSol: sol(net), referralDataIncomplete });
  }
  items.sort((a, b) => b.blockTime - a.blockTime || a.signature.localeCompare(b.signature));
  const total = items.length;
  return {
    period, page, limit, total,
    totalPages: Math.ceil(total / limit),
    records: items.slice((page - 1) * limit, page * limit)
  };
}

module.exports = { getRevenueActivity };
