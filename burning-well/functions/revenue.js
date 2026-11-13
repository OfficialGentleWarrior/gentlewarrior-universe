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

  const feeBySignature = new Map();
  const walletBySignature = new Map();
  const referrerBySignature = new Map();
  const conflictingSignatures = new Set();
  const invalidSignatures = new Set();
  for (const record of records) {
    if (record.status !== 'verified') continue;
    const time = Number(record.blockTime);
    if (!Number.isFinite(time) || time <= 0 || time > nowSeconds || (cutoff !== null && time < cutoff)) continue;
    if (!record.signature) continue;
    const fee = record.serviceFeeLamports ?? record.feeLamports;
    if (fee == null) continue;
    let amount;
    try { amount = parseLamports(fee).toString()+String.fromCharCode(58)+parseLamports(record.referralRewardLamports).toString(); }
    catch (error) { invalidSignatures.add(record.signature); continue; }
    if (feeBySignature.has(record.signature) && feeBySignature.get(record.signature) !== amount) conflictingSignatures.add(record.signature);
    if (record.wallet && walletBySignature.has(record.signature) && walletBySignature.get(record.signature) !== record.wallet) conflictingSignatures.add(record.signature);
    if (!feeBySignature.has(record.signature)) feeBySignature.set(record.signature, amount);
    if (record.wallet && !walletBySignature.has(record.signature)) walletBySignature.set(record.signature, record.wallet);
    if (record.referrerWallet && referrerBySignature.has(record.signature) && referrerBySignature.get(record.signature) !== record.referrerWallet) conflictingSignatures.add(record.signature);
    if (record.referrerWallet && !referrerBySignature.has(record.signature)) referrerBySignature.set(record.signature, record.referrerWallet);
  }

  for (const record of records) {
    if (record.status !== 'verified') continue;
    const time = Number(record.blockTime);
    if (!Number.isFinite(time) || time <= 0 || time > nowSeconds || (cutoff !== null && time < cutoff)) continue;
    if (!record.signature || signatures.has(record.signature) || conflictingSignatures.has(record.signature) || invalidSignatures.has(record.signature)) continue;

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
    invalidFinancialSignatures: invalidSignatures.size,
    netRevenueLamports: net.toString(),
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
