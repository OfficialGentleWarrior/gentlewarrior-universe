'use strict';

const LAMPORTS_PER_SOL = 1000000000n;

function parseLamports(value) {
  const text = String(value ?? '0');
  if (!/^\d+$/.test(text)) {
    throw new Error('Invalid lamport amount');
  }
  return BigInt(text);
}

function calculateRevenue(records, period = 'all', nowSeconds = Math.floor(Date.now() / 1000)) {
  const days = { '7d': 7, '30d': 30, '90d': 90, all: null };
  if (!Object.prototype.hasOwnProperty.call(days, period)) throw new Error('Invalid revenue period');
  const cutoff = days[period] === null ? null : nowSeconds - days[period] * 86400;
  let net = 0n;
  let referrals = 0n;
  let verifiedBurns = 0;
  let incompleteReferralRecords = 0;
  const signatures = new Set();

  for (const record of records) {
    if (record.status !== 'verified') continue;
    const time = Number(record.blockTime);
    if (!Number.isFinite(time) || time <= 0 || time > nowSeconds || (cutoff !== null && time < cutoff)) continue;
    if (!record.signature || signatures.has(record.signature)) continue;

    const serviceValue = record.serviceFeeLamports ?? record.feeLamports;
    if (serviceValue == null) continue;

    const service = parseLamports(serviceValue);
    const referral = parseLamports(record.referralRewardLamports);

    signatures.add(record.signature);
    net += service;
    referrals += referral;
    verifiedBurns++;

    if (record.recovered && !record.quoteId) {
      incompleteReferralRecords++;
    }
  }

  const gross = net + referrals;
  const leam = net * 30n / 100n;
  const cpKids = net * 30n / 100n;
  const community = net * 20n / 100n;
  const buyBurn = net - leam - cpKids - community;

  const sol = (value) => Number(value) / Number(LAMPORTS_PER_SOL);

  return {
    verifiedBurns,
    incompleteReferralRecords,
    grossCollectedSol: incompleteReferralRecords > 0 ? null : sol(gross),
    referralRewardsSol: incompleteReferralRecords > 0 ? null : sol(referrals),
    netRevenueSol: sol(net),
    allocations: {
      leamTherapySol: sol(leam),
      cpKidsSol: sol(cpKids),
      communityRewardsSol: sol(community),
      gwarBuyBurnSol: sol(buyBurn)
    }
  };
}

module.exports = { calculateRevenue };
