const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const admin = require("firebase-admin");

const {
  onRequest,
} = require("firebase-functions/v2/https");

const {
  defineSecret,
} = require("firebase-functions/params");

admin.initializeApp();

const {
  getFirestore,
  FieldValue,
  Timestamp,
} = require("firebase-admin/firestore");

const db = getFirestore();

const app = express();

app.use(
  cors({
    origin: [
      "https://gentlewarrior.world",
      "https://www.gentlewarrior.world",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
"http://127.0.0.1:5174",
    ],
    methods: [
      "GET",
      "POST",
      "OPTIONS",
    ],
    allowedHeaders: [
  "Content-Type",
  "x-admin-key",
  "solana-client",
],
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

const FEE_WALLET =
  "AdHbukAvr1CeQVGg7iMnbETTrnyqLekQowukfh53nsy4";

const SERVICE_FEE_USD = 1.50;

const REFERRAL_REWARD_USD = 0.05;

const LAMPORTS_PER_SOL =
  1_000_000_000;

const SOL_MINT =
  "So11111111111111111111111111111111111111112";

const JUPITER_TOKEN_SEARCH_URL =
  "https://lite-api.jup.ag/tokens/v2/search";

const ANKR_RPC_URL =
  defineSecret("ANKR_RPC_URL");

const ADMIN_API_KEY =
  defineSecret(
    "BURNING_WELL_ADMIN_KEY"
  );
  function isValidAddress(value) {
  return (
    typeof value === "string" &&
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(
      value
    )
  );
}

function isValidSignature(value) {
  return (
    typeof value === "string" &&
    /^[1-9A-HJ-NP-Za-km-z]{80,100}$/.test(
      value
    )
  );
}

function isValidBaseUnits(value) {
  return (
    typeof value === "string" &&
    /^\d+$/.test(value)
  );
}

function referralCodeForWallet(wallet) {
  return (
    "BW-" +
    crypto
      .createHash("sha256")
      .update(wallet)
      .digest("hex")
      .slice(0, 12)
      .toUpperCase()
  );
}
async function rpc(method, params) {
  const rpcUrl = ANKR_RPC_URL.value();

  if (!rpcUrl) {
    throw new Error(
      "ANKR_RPC_URL is not configured."
    );
  }

  const response = await fetch(
    rpcUrl,
    {
      method: "POST",

      headers: {
        "content-type":
          "application/json",
      },

      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    }
  );

  const data =
    await response.json();

  if (
    !response.ok ||
    data.error
  ) {
    throw new Error(
      data.error?.message ||
        `RPC HTTP ${response.status}`
    );
  }

  return data.result;
}
app.post("/api/rpc", async (req, res) => {
  try {
    const { method, params = [] } = req.body || {};

    if (
      typeof method !== "string" ||
      !method
    ) {
      return res.status(400).json({
        error: "RPC method is required.",
      });
    }

    const result = await rpc(
      method,
      params
    );

    return res.json({
      jsonrpc: "2.0",
      id: req.body?.id ?? null,
      result,
    });
  } catch (error) {
    console.error(
      "RPC proxy error:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
});
app.post("/api/referrals/register", async (req, res) => {
  try {
    const wallet = String(req.body?.wallet || "").trim();

    if (!isValidAddress(wallet)) {
      return res.status(400).json({
        error: "Invalid wallet.",
      });
    }

    const code = referralCodeForWallet(wallet);

    await db
  .collection("referral_codes")
  .doc(code)
  .set(
    {
      code,
      wallet,
      updatedAt:
        FieldValue.serverTimestamp(),
    },
    {
      merge: true,
    }
  );

    return res.json({
      code,
    });
  } catch (error) {
    console.error(
      "Referral registration error:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
});
app.get("/api/fee-quote", async (req, res) => {
  try {
    const ref =
      typeof req.query.ref === "string"
        ? req.query.ref.trim()
        : "";

    const referralCode =
  ref && /^BW-[A-F0-9]{12}$/.test(ref)
    ? ref
    : null;

    let referrerWallet = null;

if (referralCode) {
  const referralDoc = await db
    .collection("referral_codes")
    .doc(referralCode)
    .get();

  if (referralDoc.exists) {
    referrerWallet =
      referralDoc.data()?.wallet || null;
  }
}

    const response = await fetch(
      "https://lite-api.jup.ag/price/v3?ids=" +
        SOL_MINT
    );

    if (!response.ok) {
      throw new Error(
        `Jupiter price request failed: ${response.status}`
      );
    }

    const priceData =
      await response.json();

    const solPriceUsd = Number(
      priceData?.[SOL_MINT]?.usdPrice
    );

    if (
      !Number.isFinite(solPriceUsd) ||
      solPriceUsd <= 0
    ) {
      throw new Error(
        "Invalid SOL/USD price."
      );
    }

    const serviceFeeUsd =
  referrerWallet
    ? SERVICE_FEE_USD - REFERRAL_REWARD_USD
    : SERVICE_FEE_USD;

const serviceLamports = Math.ceil(
  (serviceFeeUsd / solPriceUsd) *
    LAMPORTS_PER_SOL
);

    const referralLamports =
  referrerWallet
    ? Math.ceil(
        (REFERRAL_REWARD_USD /
          solPriceUsd) *
        LAMPORTS_PER_SOL
      )
    : 0;

    const totalLamports =
      serviceLamports +
      referralLamports;

    const quoteId = crypto
      .randomBytes(16)
      .toString("hex");

    await db
      .collection("fee_quotes")
      .doc(quoteId)
      .set({
        quoteId,
        solPriceUsd,
        serviceLamports,
        referralLamports,
        totalLamports,
        referralWallet: referrerWallet,
        referralCode,
        createdAt:
  FieldValue.serverTimestamp(),

expiresAt:
  Timestamp.fromMillis(
    Date.now() + 5 * 60 * 1000
  ),
      });

    return res.json({
      quoteId,
      solPriceUsd,
      serviceLamports,
      referralLamports,
      totalLamports,
      referralCode,
      referrerWallet,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error(
      "Fee quote error:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
});
app.get("/api/referrals", async (req, res) => {
  try {
    const wallet = String(
      req.query.wallet || ""
    ).trim();

    if (!isValidAddress(wallet)) {
      return res.status(400).json({
        error: "Invalid wallet.",
      });
    }

    const snapshot = await db
      .collection("referral_rewards")
      .where(
        "referrerWallet",
        "==",
        wallet
      )
      .get();

    const referrals = snapshot.docs.map(
      (doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          referredUser:
            data.referredUser || null,
          referralCode:
            data.referralCode || null,
          rewardUsd:
            Number(data.rewardUsd || 0),
          status:
            data.status || "unknown",
          payoutSignature:
            data.payoutSignature || null,
          createdAt:
            data.createdAt?.toDate?.()
              ?.toISOString?.() || null,
        };
      }
    );

    const successfulReferrals =
      referrals.length;

    const rewardsEarned =
      referrals.reduce(
        (sum, item) =>
          sum + item.rewardUsd,
        0
      );

    const rewardsPaid =
      referrals
        .filter(
          (item) =>
            item.status === "paid"
        )
        .reduce(
          (sum, item) =>
            sum + item.rewardUsd,
          0
        );

    return res.json({
      wallet,
      successfulReferrals,
      rewardsEarned,
      rewardsPaid,
      referrals,
    });
  } catch (error) {
    console.error(
      "Referral lookup error:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
});
function extractBurnAndFee(tx, expected) {
  if (!tx || tx.meta?.err) {
    return {
      valid: false,
      reason: "Transaction failed or not found.",
    };
  }

  const instructions =
    tx.transaction?.message?.instructions || [];

  const expectedAmount =
    String(expected.amount);

  const expectedMint =
    String(expected.mint);

  const expectedOwner =
    String(expected.wallet);

  let burnFound = false;
  const transfers = [];

  for (const ix of instructions) {
    const parsed = ix?.parsed;

    if (
      parsed?.type === "burn" ||
      parsed?.type === "burnChecked"
    ) {
      const info = parsed.info || {};

      if (
        String(info.mint || "") === expectedMint &&
        String(
          info.authority ||
          info.owner ||
          ""
        ) === expectedOwner &&
        String(info.tokenAmount?.amount || "") === expectedAmount
      ) {
        burnFound = true;
      }
    }

    if (
      String(ix?.program || "").toLowerCase() ===
        "system" &&
      parsed?.type === "transfer"
    ) {
      const info = parsed.info || {};

      if (
        String(info.source || "") ===
        expectedOwner
      ) {
        transfers.push({
          destination: String(
            info.destination || ""
          ),
          lamports: String(
            info.lamports || "0"
          ),
        });
      }
    }
  }

  if (!burnFound) {
    return {
      valid: false,
      reason:
        "Verified burn instruction was not found.",
      transfers,
    };
  }

  const feeLamports = transfers.reduce(
    (total, transfer) =>
      total + BigInt(transfer.lamports),
    0n
  );

  return {
    valid: true,
    transfers,
    feeLamports: feeLamports.toString(),
  };
}


app.post("/api/burns/register", async (req, res) => {
  try {
    const b = req.body || {};

    const wallet = String(b.wallet || "");
    const mint = String(b.mint || "");
    const signature = String(
      b.signature || ""
    );
    const amount = String(b.amount || "");
    const amountBaseUnits = String(
      b.amountBaseUnits || ""
    );
    const decimals = Number(b.decimals);

    const referralCode =
      b.referralCode
        ? String(b.referralCode)
        : null;

    if (
      !isValidAddress(wallet) ||
      !isValidAddress(mint) ||
      !isValidSignature(signature) ||
      !/^\d+(\.\d+)?$/.test(amount) ||
      !/^\d+$/.test(amountBaseUnits)
    ) {
      return res.status(400).json({
        error: "Invalid burn payload.",
      });
    }

    const existing = await db
      .collection("burn_registry")
      .doc(signature)
      .get();

    if (existing.exists) {
      return res.json({
        ok: true,
        duplicate: true,
        record: existing.data(),
      });
    }

    const tx = await rpc(
      "getTransaction",
      [
        signature,
        {
          commitment: "confirmed",
          encoding: "jsonParsed",
          maxSupportedTransactionVersion: 0,
        },
      ]
    );

    if (!tx) {
      return res.status(409).json({
        error:
          "Transaction is not confirmed yet.",
      });
    }

    const verification =
      extractBurnAndFee(tx, {
        wallet,
        mint,
        amount: amountBaseUnits,
      });

    if (!verification.valid) {
      return res.status(400).json({
        error: verification.reason,
        verification,
      });
    }

    const quoteId = String(
      b.quoteId || ""
    );

    if (!/^[a-f0-9]{32}$/.test(quoteId)) {
      return res.status(400).json({
        error:
          "A valid fee quote is required.",
      });
    }

    const quoteDoc = await db
      .collection("fee_quotes")
      .doc(quoteId)
      .get();

    if (!quoteDoc.exists) {
      return res.status(400).json({
        error:
          "Fee quote not found or expired.",
      });
    }

    const feeQuote = quoteDoc.data();

    const expiresAt =
      feeQuote.expiresAt?.toMillis
        ? feeQuote.expiresAt.toMillis()
        : Number(feeQuote.expiresAt || 0);

    if (expiresAt < Date.now()) {
      return res.status(400).json({
        error:
          "Fee quote expired. Please try the burn again.",
      });
    }

    

    const quotedService = BigInt(
      feeQuote.serviceLamports || "0"
    );

    const quotedReferral = BigInt(
      feeQuote.referralLamports || "0"
    );



    const referrerWallet =
      feeQuote.referrerWallet || null;

    if (referrerWallet === wallet) {
      return res.status(400).json({
        error:
          "Self-referral is not allowed.",
      });
    }

    if (
      referralCode !==
      (feeQuote.referralCode || null)
    ) {
      return res.status(400).json({
        error:
          "Referral attribution does not match the fee quote.",
      });
    }

    const serviceTransfer =
      verification.transfers.find(
        (x) =>
          x.destination === FEE_WALLET
      );

    if (
      !serviceTransfer ||
      BigInt(serviceTransfer.lamports) !==
        quotedService
    ) {
      return res.status(400).json({
        error:
          "Service fee destination/amount does not match the approved fee quote.",
      });
    }

    if (referrerWallet) {
      const referralTransfer =
        verification.transfers.find(
          (x) =>
            x.destination ===
            referrerWallet
        );

      if (
        !referralTransfer ||
        BigInt(
          referralTransfer.lamports
        ) !== quotedReferral
      ) {
        return res.status(400).json({
          error:
            "Referral reward transfer was not found in the confirmed transaction.",
        });
      }
    } else if (
      quotedReferral !== 0n
    ) {
      return res.status(400).json({
        error:
          "Referral quote is inconsistent.",
      });
    }

    const blockTime =
      tx.blockTime ||
      Math.floor(Date.now() / 1000);

    const feeSol =
  Number(quotedService) /
  LAMPORTS_PER_SOL;

    const record = {
      signature,
      quoteId,
      wallet,
      mint,
      tokenName: b.tokenName || null,
      tokenSymbol: b.tokenSymbol || null,
      amount,
      decimals: Number.isFinite(
        decimals
      )
        ? decimals
        : null,
      amountBaseUnits,
      feeSol,
      serviceFeeSol:
        Number(quotedService) /
        LAMPORTS_PER_SOL,
      feeLamports:
  quotedService.toString(),
      serviceFeeUsd:
  referrerWallet
    ? SERVICE_FEE_USD - REFERRAL_REWARD_USD
    : SERVICE_FEE_USD,
      serviceFeeLamports:
        quotedService.toString(),
      referralRewardUsd:
        referrerWallet
          ? REFERRAL_REWARD_USD
          : 0,
      referralRewardLamports:
        quotedReferral.toString(),
      referralCode:
        referrerWallet
          ? referralCode
          : null,
      referrerWallet:
        referrerWallet || null,
      blockTime,
      createdAt:
        FieldValue.serverTimestamp(),
      status: "verified",
    };

    const batch = db.batch();

    batch.set(
      db
        .collection("burn_registry")
        .doc(signature),
      record
    );

    if (referrerWallet) {
      const rewardId =
        `${signature}_${referrerWallet}`;

      batch.set(
        db
          .collection("referral_rewards")
          .doc(rewardId),
        {
          signature,
          referrerWallet,
          referredUser: wallet,
          referralCode,
          rewardUsd:
            REFERRAL_REWARD_USD,
          rewardLamports:
            quotedReferral.toString(),
          status: "paid",
          payoutSignature:
            signature,
          createdAt:
            FieldValue.serverTimestamp(),
        }
      );
    }

    await batch.commit();

    return res.json({
      ok: true,
      record,
    });
  } catch (error) {
    console.error(
      "Burn registration error:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
});
app.get("/api/burns", async (req, res) => {
  try {
    let query = db
      .collection("burn_registry")
      .where("status", "==", "verified");

    if (
      req.query.wallet &&
      isValidAddress(String(req.query.wallet))
    ) {
      query = query.where(
        "wallet",
        "==",
        String(req.query.wallet)
      );
    }

    const snap = await query.get();

    const records = snap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort(
        (a, b) =>
          Number(b.blockTime || 0) -
          Number(a.blockTime || 0)
      );

    return res.json({
      records,
    });
  } catch (error) {
    console.error(
      "Burn registry error:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
});
app.get("/api/stats", async (req, res) => {
  try {
    const snap = await db
      .collection("burn_registry")
      .where("status", "==", "verified")
      .get();

    let totalFeesSol = 0;
    let totalServiceFeesSol = 0;
    let totalBurns = 0;
    let totalReferralRewardsSol = 0;

    const wallets = new Set();
    const tokens = new Set();

    snap.forEach((doc) => {
      const d = doc.data();

      totalBurns += 1;

      totalFeesSol += Number(
        d.feeSol || 0
      );

      totalServiceFeesSol += Number(
        d.serviceFeeSol ??
          d.feeSol ??
          0
      );

      totalReferralRewardsSol +=
        Number(
          d.referralRewardLamports || 0
        ) / LAMPORTS_PER_SOL;

      if (d.wallet) {
        wallets.add(d.wallet);
      }

      if (d.mint) {
        tokens.add(d.mint);
      }
    });

    return res.json({
      totalBurnTransactions: totalBurns,
      totalFeesSol,
      totalServiceFeeSol:
        totalServiceFeesSol,
      totalFeesUsd:
        totalBurns * SERVICE_FEE_USD,
      totalReferralRewardsSol,
      uniqueBurners: wallets.size,
      uniqueTokens: tokens.size,
    });
  } catch (error) {
    console.error(
      "Stats error:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
});
function requireAdmin(req, res) {
  const providedKey =
    String(req.get("x-admin-key") || "").trim();

  const expectedKey =
    String(ADMIN_API_KEY.value() || "").trim();

  if (
    !providedKey ||
    !expectedKey ||
    providedKey !== expectedKey
  ) {
    res.status(401).json({
      error: "Unauthorized.",
    });

    return false;
  }

  return true;
}

app.get("/api/admin/ping", (req, res) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  return res.json({
    ok: true,
    message: "Burning Well admin access verified.",
  });
});
app.get("/api/admin/overview", async (req, res) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const burnSnap = await db
      .collection("burn_registry")
      .where("status", "==", "verified")
      .get();

    const referralSnap = await db
      .collection("referral_rewards")
      .get();

    const burns = burnSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const referrals = referralSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const uniqueBurners = new Set();
    const uniqueTokens = new Set();

    let totalServiceFeesUsd = 0;
    let totalReferralRewardsUsd = 0;

    for (const burn of burns) {
      if (burn.wallet) {
        uniqueBurners.add(burn.wallet);
      }

      if (burn.mint) {
        uniqueTokens.add(burn.mint);
      }

      totalServiceFeesUsd +=
        Number(burn.serviceFeeUsd || 0);
    }

    for (const referral of referrals) {
      totalReferralRewardsUsd +=
        Number(referral.rewardUsd || 0);
    }

    return res.json({
      totalBurnTransactions: burns.length,
      uniqueBurners: uniqueBurners.size,
      uniqueTokens: uniqueTokens.size,
      totalServiceFeesUsd:
        Number(totalServiceFeesUsd.toFixed(2)),
      totalReferralRewardsUsd:
        Number(totalReferralRewardsUsd.toFixed(2)),
    });
  } catch (error) {
    console.error(
      "Admin overview error:",
      error
    );

    return res.status(500).json({
      error: "Unable to load admin overview.",
    });
  }
});
app.get(
  "/api/admin/leaderboard/tokens",
  async (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const snap = await db
        .collection("burn_registry")
        .where("status", "==", "verified")
        .get();

      const tokens = new Map();

      snap.forEach((doc) => {
        const burn = doc.data();

        if (!burn.mint) {
          return;
        }

        if (!tokens.has(burn.mint)) {
          tokens.set(burn.mint, {
            mint: burn.mint,
            tokenName:
              burn.tokenName || "Unknown Token",
            tokenSymbol:
              burn.tokenSymbol || "",
            totalBurned: 0,
            burnTransactions: 0,
            burners: new Set(),
            latestBurn: null,
          });
        }

        const token = tokens.get(burn.mint);

        token.totalBurned +=
          Number(burn.amount || 0);

        token.burnTransactions += 1;

        if (burn.wallet) {
          token.burners.add(burn.wallet);
        }

        const burnTime =
          Number(burn.blockTime || 0);

        if (
          burnTime &&
          (
            !token.latestBurn ||
            burnTime > token.latestBurn
          )
        ) {
          token.latestBurn = burnTime;
        }
      });

      const leaderboard = Array.from(
        tokens.values()
      )
        .map((token) => ({
          mint: token.mint,
          tokenName: token.tokenName,
          tokenSymbol: token.tokenSymbol,
          totalBurned: token.totalBurned,
          burnTransactions:
            token.burnTransactions,
          uniqueBurners:
            token.burners.size,
          latestBurn:
            token.latestBurn,
        }))
        .sort(
          (a, b) =>
            b.totalBurned -
            a.totalBurned
        )
        .map((token, index) => ({
          rank: index + 1,
          ...token,
        }));

      return res.json({
        leaderboard,
      });
    } catch (error) {
      console.error(
        "Token leaderboard error:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load token leaderboard.",
      });
    }
  }
);
app.get(
  "/api/admin/leaderboard/referrals",
  async (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const snap = await db
        .collection("referral_rewards")
        .get();

      const referrers = new Map();

      snap.forEach((doc) => {
        const reward = doc.data();

        const referrerWallet =
          reward.referrerWallet || null;

        if (!referrerWallet) {
          return;
        }

        if (!referrers.has(referrerWallet)) {
          referrers.set(referrerWallet, {
            referrerWallet,
            referralCode:
              reward.referralCode || null,
            successfulReferrals: 0,
            rewardsEarnedUsd: 0,
            rewardsPaidUsd: 0,
            latestReferral: null,
          });
        }

        const referrer =
          referrers.get(referrerWallet);

        referrer.successfulReferrals += 1;

        const rewardUsd =
          Number(reward.rewardUsd || 0);

        referrer.rewardsEarnedUsd +=
          rewardUsd;

        if (reward.status === "paid") {
          referrer.rewardsPaidUsd +=
            rewardUsd;
        }

        const referralTime =
          Number(
            reward.blockTime ||
            reward.createdAt?.seconds ||
            0
          );

        if (
          referralTime &&
          (
            !referrer.latestReferral ||
            referralTime >
              referrer.latestReferral
          )
        ) {
          referrer.latestReferral =
            referralTime;
        }
      });

      const leaderboard = Array.from(
        referrers.values()
      )
        .map((referrer) => ({
          ...referrer,
          rewardsEarnedUsd:
            Number(
              referrer.rewardsEarnedUsd.toFixed(2)
            ),
          rewardsPaidUsd:
            Number(
              referrer.rewardsPaidUsd.toFixed(2)
            ),
        }))
        .sort(
          (a, b) =>
            b.successfulReferrals -
              a.successfulReferrals ||
            b.rewardsEarnedUsd -
              a.rewardsEarnedUsd
        )
        .map((referrer, index) => ({
          rank: index + 1,
          ...referrer,
        }));

      return res.json({
        leaderboard,
      });
    } catch (error) {
      console.error(
        "Referral leaderboard error:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load referral leaderboard.",
      });
    }
  }
);
app.get(
  "/api/admin/referrals",
  async (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const snap = await db
        .collection("referral_rewards")
        .get();

      const referrals = [];

      snap.forEach((doc) => {
        const reward = doc.data();

        const timestamp =
          reward.timestamp ||
          reward.createdAt ||
          reward.paidAt ||
          null;

        let timestampSeconds = null;

        if (
          timestamp &&
          typeof timestamp.toDate === "function"
        ) {
          timestampSeconds = Math.floor(
            timestamp.toDate().getTime() / 1000
          );
        } else if (
          timestamp &&
          typeof timestamp.seconds === "number"
        ) {
          timestampSeconds = timestamp.seconds;
        } else if (
          typeof timestamp === "number"
        ) {
          timestampSeconds = timestamp;
        }

        referrals.push({
          id: doc.id,

          referralCode:
            reward.referralCode || null,

          referrerWallet:
            reward.referrerWallet || null,

          burnerWallet:
            reward.burnerWallet ||
            reward.wallet ||
            null,

          rewardUsd:
            Number(
              reward.rewardUsd ??
              reward.referralRewardUsd ??
              0
            ),

          status:
            reward.status || null,

          signature:
            reward.signature ||
            reward.transactionSignature ||
            reward.txSignature ||
            null,

          timestamp: timestampSeconds,
        });
      });

      referrals.sort(
        (a, b) =>
          Number(b.timestamp || 0) -
          Number(a.timestamp || 0)
      );

      return res.json({
        referrals,
      });
    } catch (error) {
      console.error(
        "Admin referral transactions error:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load referral transactions.",
      });
    }
  }
);
app.get(
  "/api/admin/leaderboard/burners",
  async (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const snap = await db
        .collection("burn_registry")
        .where("status", "==", "verified")
        .get();

      const burners = new Map();

      snap.forEach((doc) => {
        const burn = doc.data();

        if (!burn.wallet) {
          return;
        }

        if (!burners.has(burn.wallet)) {
          burners.set(burn.wallet, {
            wallet: burn.wallet,
            burnTransactions: 0,
            totalBurned: 0,
            tokens: new Set(),
            firstBurn: null,
            latestBurn: null,
          });
        }

        const burner =
          burners.get(burn.wallet);

        burner.burnTransactions += 1;

        burner.totalBurned +=
          Number(burn.amount || 0);

        if (burn.mint) {
          burner.tokens.add(burn.mint);
        }

        const burnTime =
          Number(burn.blockTime || 0);

        if (burnTime) {
          if (
            !burner.firstBurn ||
            burnTime < burner.firstBurn
          ) {
            burner.firstBurn = burnTime;
          }

          if (
            !burner.latestBurn ||
            burnTime > burner.latestBurn
          ) {
            burner.latestBurn = burnTime;
          }
        }
      });

      const leaderboard = Array.from(
        burners.values()
      )
        .map((burner) => ({
          wallet: burner.wallet,
          burnTransactions:
            burner.burnTransactions,
          uniqueTokens:
            burner.tokens.size,
          totalBurned:
            burner.totalBurned,
          firstBurn:
            burner.firstBurn,
          latestBurn:
            burner.latestBurn,
        }))
        .sort(
          (a, b) =>
            b.burnTransactions -
              a.burnTransactions ||
            b.latestBurn -
              a.latestBurn
        )
        .map((burner, index) => ({
          rank: index + 1,
          ...burner,
        }));

      return res.json({
        leaderboard,
      });
    } catch (error) {
      console.error(
        "Burner leaderboard error:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load burner leaderboard.",
      });
    }
  }
);
exports.burningWellApi = onRequest(
  {
    region: "asia-southeast1",
    secrets: [
      ANKR_RPC_URL,
      ADMIN_API_KEY,
    ],
  },
  app
);