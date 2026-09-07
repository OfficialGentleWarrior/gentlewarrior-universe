const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT || 8787);
const FEE_WALLET = process.env.FEE_WALLET || 'AdHbukAvr1CeQVGg7iMnbETTrnyqLekQowukfh53nsy4';
const ANKR_RPC_URL = process.env.ANKR_RPC_URL;
const SERVICE_FEE_USD = 1.50;
const REFERRAL_REWARD_USD = 0.05;
const LAMPORTS_PER_SOL = 1_000_000_000;
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const JUPITER_TOKEN_SEARCH_URL = 'https://lite-api.jup.ag/tokens/v2/search';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

if (!ANKR_RPC_URL) {
  console.warn('WARNING: ANKR_RPC_URL is not configured. RPC proxy/verification will fail until it is set.');
}

let db = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({ credential: admin.credential.cert(credentials) });
  } else {
    const serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || './firebase-service-account.json';
    const serviceAccountPath = path.resolve(__dirname, serviceAccountFile);
    if (fs.existsSync(serviceAccountPath)) {
      const credentials = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(credentials) });
    } else {
      admin.initializeApp();
    }
  }
  db = admin.firestore();
} catch (err) {
  console.error('Firebase Admin initialization failed:', err.message);
}

function requireDb(res) {
  if (!db) {
    res.status(503).json({ error: 'Database is not configured.' });
    return false;
  }
  return true;
}

function isValidAddress(value) {
  return typeof value === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

function isValidSignature(value) {
  return typeof value === 'string' && /^[1-9A-HJ-NP-Za-km-z]{80,100}$/.test(value);
}

function referralCodeForWallet(wallet) {
  return `BW-${crypto.createHash('sha256').update(wallet).digest('hex').slice(0, 12).toUpperCase()}`;
}

function walletForReferralCode(code) {
  return null;
}

async function rpc(method, params) {
  if (!ANKR_RPC_URL) throw new Error('ANKR_RPC_URL is not configured.');
  const response = await fetch(ANKR_RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params })
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || `RPC HTTP ${response.status}`);
  return data.result;
}

async function solUsdPrice() {
  const response = await fetch(`${JUPITER_TOKEN_SEARCH_URL}?query=${encodeURIComponent(SOL_MINT)}`);
  if (!response.ok) throw new Error(`Unable to get SOL price. HTTP ${response.status}`);
  const data = await response.json();
  const token = Array.isArray(data) ? (data.find(x => x?.id === SOL_MINT) || data[0]) : null;
  const price = Number(token?.usdPrice);
  if (!Number.isFinite(price) || price <= 0) throw new Error('Invalid SOL/USD price.');
  return price;
}

async function getFeeQuote(referralCode) {
  const price = await solUsdPrice();
  const totalLamports = BigInt(Math.ceil((SERVICE_FEE_USD / price) * LAMPORTS_PER_SOL));
  let referralLamports = 0n;
  let serviceLamports = totalLamports;
  let referrerWallet = null;
  let normalizedReferralCode = null;

  if (referralCode && typeof referralCode === 'string') {
    const doc = await db.collection('referral_codes').doc(referralCode).get();
    if (doc.exists) {
      const wallet = doc.data().wallet;
      if (isValidAddress(wallet)) {
        referrerWallet = wallet;
        normalizedReferralCode = referralCode;
        referralLamports = BigInt(Math.ceil((REFERRAL_REWARD_USD / price) * LAMPORTS_PER_SOL));
        serviceLamports = totalLamports - referralLamports;
      }
    }
  }

  const quoteId = crypto.randomBytes(24).toString('hex');
  await db.collection('fee_quotes').doc(quoteId).set({
    quoteId,
    solUsdPrice: price,
    totalLamports: totalLamports.toString(),
    serviceLamports: serviceLamports.toString(),
    referralLamports: referralLamports.toString(),
    referralCode: normalizedReferralCode,
    referrerWallet,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  return {
    quoteId,
    solUsdPrice: price,
    totalLamports: totalLamports.toString(),
    serviceLamports: serviceLamports.toString(),
    referralLamports: referralLamports.toString(),
    serviceFeeUsd: SERVICE_FEE_USD,
    referralRewardUsd: referralLamports > 0n ? REFERRAL_REWARD_USD : 0,
    feeWallet: FEE_WALLET,
    referralCode: normalizedReferralCode,
    referrerWallet
  };
}

function adminOnly(req, res, next) {
  if (!ADMIN_API_KEY || req.get('x-admin-key') !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'burning-well-backend' }));

// Frontend RPC proxy. The Ankr secret never reaches the browser.
app.post('/api/rpc', async (req, res) => {
  try {
    const result = await rpc(req.body?.method, req.body?.params || []);
    res.json({ jsonrpc: '2.0', id: req.body?.id ?? 1, result });
  } catch (err) {
    res.status(502).json({ jsonrpc: '2.0', id: req.body?.id ?? 1, error: { code: -32000, message: err.message } });
  }
});

app.get('/api/fee-quote', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    res.json(await getFeeQuote(req.query.ref || null));
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/referrals/register', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const wallet = String(req.body?.wallet || '');
    if (!isValidAddress(wallet)) return res.status(400).json({ error: 'Invalid wallet address.' });
    const code = referralCodeForWallet(wallet);
    await db.collection('referral_codes').doc(code).set({ wallet, code, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    res.json({ code, wallet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function extractBurnAndFee(tx, expected) {
  if (!tx || tx.meta?.err) return { valid: false, reason: 'Transaction failed or not found.' };
  const instructions = tx.transaction?.message?.instructions || [];
  const expectedAmount = String(expected.amount);
  const expectedMint = String(expected.mint);
  const expectedOwner = String(expected.wallet);
  let burnFound = false;
  const transfers = [];

  for (const ix of instructions) {
    const parsed = ix.parsed;
    if (parsed?.type === 'burn' || parsed?.type === 'burnChecked') {
      const info = parsed.info || {};
      if (String(info.mint || '') === expectedMint && String(info.authority || info.owner || '') === expectedOwner && String(info.amount || '') === expectedAmount) burnFound = true;
    }
    if (String(ix.program || '').toLowerCase() === 'system' && parsed?.type === 'transfer') {
      const info = parsed.info || {};
      if (String(info.source || '') === expectedOwner) {
        transfers.push({
          destination: String(info.destination || ''),
          lamports: String(info.lamports || '0')
        });
      }
    }
  }

  const serviceTransfer = transfers.find(x => x.destination === FEE_WALLET);
  return {
    valid: burnFound && Boolean(serviceTransfer),
    burnFound,
    feeFound: Boolean(serviceTransfer),
    feeLamports: serviceTransfer?.lamports || '0',
    transfers,
    reason: burnFound ? (serviceTransfer ? null : 'Service fee transfer not found.') : 'Expected token burn instruction not found.'
  };
}

app.post('/api/burns/register', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const b = req.body || {};
    const wallet = String(b.wallet || '');
    const mint = String(b.mint || '');
    const signature = String(b.signature || '');
    const amount = String(b.amount || '');
    const amountBaseUnits = String(b.amountBaseUnits || '');
    const decimals = Number(b.decimals);
    const referralCode = b.referralCode ? String(b.referralCode) : null;
    if (!isValidAddress(wallet) || !isValidAddress(mint) || !isValidSignature(signature) || !/^\d+(\.\d+)?$/.test(amount) || !/^\d+$/.test(amountBaseUnits)) return res.status(400).json({ error: 'Invalid burn payload.' });

    const existing = await db.collection('burn_registry').doc(signature).get();
    if (existing.exists) return res.json({ ok: true, duplicate: true, record: existing.data() });

    const tx = await rpc('getTransaction', [signature, { commitment: 'confirmed', encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]);
    if (!tx) return res.status(409).json({ error: 'Transaction is not confirmed yet.' });

    const verification = extractBurnAndFee(tx, { wallet, mint, amount: amountBaseUnits });
    if (!verification.valid) return res.status(400).json({ error: verification.reason, verification });

    const quoteId = String(b.quoteId || '');
    if (!/^[a-f0-9]{48}$/.test(quoteId)) {
      return res.status(400).json({ error: 'A valid fee quote is required.' });
    }

    const quoteDoc = await db.collection('fee_quotes').doc(quoteId).get();
    if (!quoteDoc.exists) {
      return res.status(400).json({ error: 'Fee quote not found or expired.' });
    }

    const feeQuote = quoteDoc.data();
    if (Number(feeQuote.expiresAt || 0) < Date.now()) {
      return res.status(400).json({ error: 'Fee quote expired. Please try the burn again.' });
    }

    const actualFee = BigInt(verification.feeLamports);
    const quotedTotal = BigInt(feeQuote.totalLamports);
    const quotedService = BigInt(feeQuote.serviceLamports || '0');
    const quotedReferral = BigInt(feeQuote.referralLamports || '0');
    if (actualFee !== quotedTotal) {
      return res.status(400).json({ error: 'Verified service fee does not match the approved fee quote.', expectedLamports: feeQuote.totalLamports, actualLamports: verification.feeLamports });
    }

    let referrerWallet = feeQuote.referrerWallet || null;
    if (referrerWallet === wallet) {
      return res.status(400).json({ error: 'Self-referral is not allowed.' });
    }

    if (referralCode !== (feeQuote.referralCode || null)) {
      return res.status(400).json({ error: 'Referral attribution does not match the fee quote.' });
    }

    const serviceTransfer = verification.transfers.find(x => x.destination === FEE_WALLET);
    if (!serviceTransfer || BigInt(serviceTransfer.lamports) !== quotedService) {
      return res.status(400).json({ error: 'Service fee destination/amount does not match the approved fee quote.' });
    }

    if (referrerWallet) {
      const referralTransfer = verification.transfers.find(x => x.destination === referrerWallet);
      if (!referralTransfer || BigInt(referralTransfer.lamports) !== quotedReferral) {
        return res.status(400).json({ error: 'Referral reward transfer was not found in the confirmed transaction.' });
      }
    } else if (quotedReferral !== 0n) {
      return res.status(400).json({ error: 'Referral quote is inconsistent.' });
    }

    const blockTime = tx.blockTime || Math.floor(Date.now() / 1000);
    const feeSol = Number(actualFee) / LAMPORTS_PER_SOL;
    const referralLamports = quotedReferral;
    const serviceLamports = quotedService;

    const record = {
      signature, quoteId, wallet, mint,
      tokenName: b.tokenName || null,
      tokenSymbol: b.tokenSymbol || null,
      amount,
      decimals: Number.isFinite(decimals) ? decimals : null,
      amountBaseUnits,
      feeSol,
      serviceFeeSol: Number(serviceLamports) / LAMPORTS_PER_SOL,
      feeLamports: actualFee.toString(),
      serviceFeeUsd: SERVICE_FEE_USD,
      serviceFeeLamports: serviceLamports.toString(),
      referralRewardUsd: referrerWallet ? REFERRAL_REWARD_USD : 0,
      referralRewardLamports: referralLamports.toString(),
      referralCode: referrerWallet ? referralCode : null,
      referrerWallet: referrerWallet || null,
      blockTime,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'verified'
    };

    const batch = db.batch();
    batch.set(db.collection('burn_registry').doc(signature), record);
    if (referrerWallet) {
      const rewardId = `${signature}_${referrerWallet}`;
      batch.set(db.collection('referral_rewards').doc(rewardId), {
        signature, referrerWallet, referredUser: wallet, referralCode,
        rewardUsd: REFERRAL_REWARD_USD,
        rewardLamports: referralLamports.toString(),
        status: 'paid',
        payoutSignature: signature,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    await batch.commit();

    res.json({ ok: true, record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const snap = await db.collection('burn_registry').where('status', '==', 'verified').get();
    let totalFeesSol = 0;
    let totalServiceFeesSol = 0;
    let totalBurns = 0;
    let totalReferralRewardsSol = 0;
    const wallets = new Set();
    const tokens = new Set();
    snap.forEach(d => {
      const x = d.data(); totalBurns++; totalFeesSol += Number(x.feeSol || 0); totalServiceFeesSol += Number(x.serviceFeeSol ?? x.feeSol ?? 0); wallets.add(x.wallet); tokens.add(x.mint); totalReferralRewardsSol += Number(x.referralRewardLamports || 0) / LAMPORTS_PER_SOL;
    });
    res.json({ totalBurnTransactions: totalBurns, totalFeesSol, totalServiceFeesSol, totalFeesUsd: totalBurns * SERVICE_FEE_USD, totalReferralRewardsSol, uniqueBurners: wallets.size, uniqueTokens: tokens.size });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/burns', async (req, res) => {
  try {
    if (!requireDb(res)) return;
    let query = db.collection('burn_registry').where('status', '==', 'verified');
    if (req.query.wallet && isValidAddress(String(req.query.wallet))) query = query.where('wallet', '==', String(req.query.wallet));
    const snap = await query.get();
    const records = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => Number(b.blockTime || 0) - Number(a.blockTime || 0));
    res.json({ records: records.slice(0, 500) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/overview', adminOnly, async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const snap = await db.collection('burn_registry').where('status', '==', 'verified').get();
    const tokenMap = new Map(), walletMap = new Map(), referralMap = new Map();
    let totalFeesSol = 0, totalServiceFeesSol = 0, totalBurns = 0, totalReferralRewardsSol = 0;
    snap.forEach(d => {
      const x = d.data(); const fee = Number(x.feeSol || 0); totalBurns++; totalFeesSol += fee; totalServiceFeesSol += Number(x.serviceFeeSol ?? fee);
      totalReferralRewardsSol += Number(x.referralRewardLamports || 0) / LAMPORTS_PER_SOL;
      const t = tokenMap.get(x.mint) || { mint:x.mint, tokenName:x.tokenName || null, tokenSymbol:x.tokenSymbol || null, totalBurnedBaseUnits:0n, decimals:Number(x.decimals || 0), burnCount:0, feesSol:0, serviceFeesSol:0 };
      t.totalBurnedBaseUnits += BigInt(x.amountBaseUnits || '0'); t.decimals = Number(x.decimals ?? t.decimals ?? 0); t.totalBurned = Number(t.totalBurnedBaseUnits) / (10 ** t.decimals); t.burnCount++; t.feesSol += fee; t.serviceFeesSol += Number(x.serviceFeeSol ?? fee); tokenMap.set(x.mint,t);
      const w = walletMap.get(x.wallet) || { wallet:x.wallet, burnCount:0, feesSol:0, serviceFeesSol:0 }; w.burnCount++; w.feesSol += fee; w.serviceFeesSol += Number(x.serviceFeeSol ?? fee); walletMap.set(x.wallet,w);
      if (x.referrerWallet) {
        const r = referralMap.get(x.referrerWallet) || { wallet:x.referrerWallet, referredUsers:new Set(), referralTxnCount:0, feesSol:0, rewardsSol:0, serviceFeesSol:0 };
        r.referredUsers.add(x.wallet); r.referralTxnCount++; r.feesSol += fee; r.serviceFeesSol += Number(x.serviceFeeSol ?? fee); r.rewardsSol += Number(x.referralRewardLamports || 0)/LAMPORTS_PER_SOL; referralMap.set(x.referrerWallet,r);
      }
    });
    const referralRows = [...referralMap.values()].map(x => ({ ...x, referredUsers:[...x.referredUsers] }));
    const tokenRows = [...tokenMap.values()].map(x => ({ ...x, totalBurnedBaseUnits: x.totalBurnedBaseUnits.toString() }));
    res.json({ stats:{ totalBurnTransactions:totalBurns,totalFeesSol, totalServiceFeesSol, totalFeesUsd:totalBurns*SERVICE_FEE_USD,totalReferralRewardsSol,uniqueBurners:walletMap.size,uniqueTokens:tokenMap.size,uniqueReferrers:referralRows.length }, tokenLeaderboard:tokenRows.sort((a,b)=>b.feesSol-a.feesSol), walletLeaderboard:[...walletMap.values()].sort((a,b)=>b.burnCount-a.burnCount), referralLeaderboard:referralRows.sort((a,b)=>b.referralTxnCount-a.referralTxnCount) });
  } catch(err) { res.status(500).json({error:err.message}); }
});

app.get('/api/admin/burns', adminOnly, async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const snap = await db.collection('burn_registry').where('status', '==', 'verified').get();
    let records = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    if (req.query.wallet) records = records.filter(x => x.wallet === String(req.query.wallet));
    if (req.query.mint) records = records.filter(x => x.mint === String(req.query.mint));
    if (req.query.referrer) records = records.filter(x => x.referrerWallet === String(req.query.referrer));
    records.sort((a,b) => Number(b.blockTime || 0) - Number(a.blockTime || 0));
    res.json({ records: records.slice(0, 1000) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/referral-rewards', adminOnly, async (req,res)=>{
  try { if(!requireDb(res)) return; const snap=await db.collection('referral_rewards').get(); const rows=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>Number(b.createdAt?.seconds||0)-Number(a.createdAt?.seconds||0)); res.json({records:rows}); }
  catch(err){res.status(500).json({error:err.message});}
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'), err => { if (err) next(); });
});

app.listen(PORT, () => console.log(`Burning Well backend listening on port ${PORT}`));
