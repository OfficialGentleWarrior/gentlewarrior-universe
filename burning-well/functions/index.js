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

    return res.status(200).json({
  jsonrpc: "2.0",
  id: req.body?.id ?? null,
  error: {
    code: -32000,
    message: error.message,
  },
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

    const referralSnapshot = await db
  .collection("referral_rewards")
  .where(
    "referrerWallet",
    "==",
    wallet
  )
  .get();

const referrals =
  referralSnapshot.docs.map((doc) => {
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
        data.createdAt?.toDate
          ? data.createdAt
              .toDate()
              .toISOString()
          : null,
    };
  });

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
  code,
  successfulReferrals,
  rewardsEarned,
  rewardsPaid,
  referrals,
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
        referrerWallet,
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

function extractBurnCandidate(tx) {
  if (!tx || tx.meta?.err) {
    return null;
  }

  const instructions =
    tx.transaction?.message?.instructions || [];

  const burns = [];
  const transfers = [];

  for (const ix of instructions) {
    const parsed = ix?.parsed;
    const type =
      String(parsed?.type || "").toLowerCase();

    if (
      type === "burn" ||
      type === "burnchecked"
    ) {
      const info = parsed.info || {};

      const wallet = String(
        info.authority ||
        info.owner ||
        ""
      );

      const mint = String(
        info.mint || ""
      );

      const amountBaseUnits = String(
        info.tokenAmount?.amount ||
        info.amount ||
        ""
      );

      const decimals = Number(
        info.tokenAmount?.decimals
      );

      if (
        isValidAddress(wallet) &&
        isValidAddress(mint) &&
        isValidBaseUnits(amountBaseUnits)
      ) {
        burns.push({
          wallet,
          mint,
          amountBaseUnits,
          decimals:
            Number.isFinite(decimals)
              ? decimals
              : null,
        });
      }
    }

    if (
      String(ix?.program || "").toLowerCase() ===
        "system" &&
      type === "transfer"
    ) {
      const info = parsed.info || {};

      transfers.push({
        source: String(info.source || ""),
        destination: String(
          info.destination || ""
        ),
        lamports: String(
          info.lamports || "0"
        ),
      });
    }
  }

  if (burns.length !== 1) {
    return null;
  }

  const burn = burns[0];

  const serviceTransfer =
    transfers.find(
      (transfer) =>
        transfer.source === burn.wallet &&
        transfer.destination === FEE_WALLET
    );

  if (!serviceTransfer) {
    return null;
  }

  return {
    ...burn,
    serviceLamports:
      serviceTransfer.lamports,
    transfers,
    blockTime:
      Number(tx.blockTime || 0),
  };
}
app.get("/api/admin/reconcile/inspect/:signature", async (req, res) => {
  try {
    const signature = String(
      req.params.signature || ""
    );

    if (!isValidSignature(signature)) {
      return res.status(400).json({
        error: "Invalid transaction signature.",
      });
    }

    const existing = await db
      .collection("burn_registry")
      .doc(signature)
      .get();

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
      return res.status(404).json({
        error: "Transaction not found.",
      });
    }

    const candidate =
      extractBurnCandidate(tx);

    return res.json({
      ok: true,
      signature,
      alreadyRegistered: existing.exists,
      blockTime: tx.blockTime || null,
      transactionError: tx.meta?.err || null,
      candidate,
    });
  } catch (error) {
    console.error(
      "Reconciliation inspection error:",
      error
    );

    return res.status(500).json({
      error: "Unable to inspect transaction.",
    });
  }
});

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
  feeQuote.referrerWallet ||
  feeQuote.referralWallet ||
  null;

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
    const bounds =
  req.query.period
    ? getAdminPeriodBounds(req)
    : {
        period: "all",
        startMs: null,
        endMs: null,
      };
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
  .filter((record) =>
    isInsideAdminPeriod(
      record.createdAt,
      bounds
    )
  )
  .sort(
    (a, b) =>
      Number(b.blockTime || 0) -
      Number(a.blockTime || 0)
  );

    return res.json({
  period: bounds.period,
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
const PHT_OFFSET_MS =
  8 * 60 * 60 * 1000;

function firestoreTimeToMs(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value._seconds === "number") {
    return value._seconds * 1000;
  }

  const parsed = Date.parse(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function getAdminPeriodBounds(req) {
  const period =
    String(req.query.period || "week")
      .trim()
      .toLowerCase();

  const now = Date.now();

  const phtNow =
    new Date(now + PHT_OFFSET_MS);

  const year =
    phtNow.getUTCFullYear();

  const month =
    phtNow.getUTCMonth();

  const date =
    phtNow.getUTCDate();

  const startOfTodayPht =
    Date.UTC(
      year,
      month,
      date
    ) - PHT_OFFSET_MS;

  if (period === "today") {
    return {
      period,
      startMs: startOfTodayPht,
      endMs: now,
    };
  }

  if (period === "week") {
    const day =
      phtNow.getUTCDay();

    const daysSinceMonday =
      day === 0
        ? 6
        : day - 1;

    return {
      period,
      startMs:
        startOfTodayPht -
        daysSinceMonday *
          24 *
          60 *
          60 *
          1000,
      endMs: now,
    };
  }

  if (period === "month") {
    return {
      period,
      startMs:
        Date.UTC(
          year,
          month,
          1
        ) - PHT_OFFSET_MS,
      endMs: now,
    };
  }

  if (period === "custom") {
    const start =
      String(req.query.start || "");

    const end =
      String(req.query.end || "");

    const datePattern =
      /^\d{4}-\d{2}-\d{2}$/;

    if (
      !datePattern.test(start) ||
      !datePattern.test(end)
    ) {
      throw new Error(
        "Custom period requires valid start and end dates."
      );
    }

    const startMs =
      Date.parse(
        `${start}T00:00:00+08:00`
      );

    const endMs =
      Date.parse(
        `${end}T23:59:59.999+08:00`
      );

    if (
      !Number.isFinite(startMs) ||
      !Number.isFinite(endMs) ||
      startMs > endMs
    ) {
      throw new Error(
        "Invalid custom date range."
      );
    }

    return {
      period,
      startMs,
      endMs,
    };
  }

  return {
    period: "all",
    startMs: null,
    endMs: null,
  };
}

function isInsideAdminPeriod(
  createdAt,
  bounds
) {
  if (
    bounds.startMs === null ||
    bounds.endMs === null
  ) {
    return true;
  }

  const time =
    firestoreTimeToMs(createdAt);

  return (
    time >= bounds.startMs &&
    time <= bounds.endMs
  );
}
const BURN_EVENT_STATUS = {
  DRAFT: "draft",
  LIVE: "live",
  ENDED: "ended",
};

function normalizeBurnEventStatus(value) {
  const status =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    status === BURN_EVENT_STATUS.DRAFT ||
    status === BURN_EVENT_STATUS.LIVE ||
    status === BURN_EVENT_STATUS.ENDED
  ) {
    return status;
  }

  return BURN_EVENT_STATUS.DRAFT;
}

function parseEventDate(value) {
  const text =
    String(value || "").trim();

  if (!text) {
    return null;
  }

  const ms = Date.parse(text);

  return Number.isFinite(ms)
    ? ms
    : null;
}
app.post("/api/admin/burn-events", async (req, res) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const body = req.body || {};

    const name =
      String(body.name || "").trim();

    const tokenMint =
      String(body.tokenMint || "").trim();

    const tokenSymbol =
      String(body.tokenSymbol || "").trim();

    const minimumBurn =
      Number(body.minimumBurn);

    const pointsPerTxn =
      Number(body.pointsPerTxn);

    const dailyCap =
      Number(body.dailyCap);

    const winnersCount =
      Number(body.winnersCount);

    const startAtMs =
      parseEventDate(body.startAt);

    const endAtMs =
      parseEventDate(body.endAt);

    const status =
      normalizeBurnEventStatus(
        body.status
      );

    if (!name) {
      return res.status(400).json({
        error: "Event name is required.",
      });
    }

    if (!isValidAddress(tokenMint)) {
      return res.status(400).json({
        error: "Valid token mint is required.",
      });
    }

    if (
      !Number.isFinite(minimumBurn) ||
      minimumBurn <= 0
    ) {
      return res.status(400).json({
        error: "Minimum burn must be greater than 0.",
      });
    }

    if (
      !Number.isFinite(pointsPerTxn) ||
      pointsPerTxn <= 0
    ) {
      return res.status(400).json({
        error: "Points per transaction must be greater than 0.",
      });
    }

    if (
      !Number.isInteger(dailyCap) ||
      dailyCap <= 0
    ) {
      return res.status(400).json({
        error: "Daily cap must be a positive whole number.",
      });
    }

    if (
      !Number.isInteger(winnersCount) ||
      winnersCount <= 0
    ) {
      return res.status(400).json({
        error: "Winners count must be a positive whole number.",
      });
    }

    if (
      startAtMs === null ||
      endAtMs === null ||
      startAtMs >= endAtMs
    ) {
      return res.status(400).json({
        error: "Valid event start and end dates are required.",
      });
    }

    const eventRef =
      db.collection("burn_events").doc();

    await eventRef.set({
      name,
      tokenMint,
      tokenSymbol:
        tokenSymbol || null,
      minimumBurn,
      pointsPerTxn,
      dailyCap,
      winnersCount,
      startAt:
        Timestamp.fromMillis(startAtMs),
      endAt:
        Timestamp.fromMillis(endAtMs),
      status,
      createdAt:
        FieldValue.serverTimestamp(),
      updatedAt:
        FieldValue.serverTimestamp(),
    });

    return res.json({
      ok: true,
      id: eventRef.id,
    });
  } catch (error) {
    console.error(
      "Create burn event error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Unable to create burn event.",
    });
  }
});
app.get("/api/admin/burn-events", async (req, res) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const snap = await db
      .collection("burn_events")
      .get();

    const events = snap.docs
      .map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          name:
            data.name || "Untitled Event",
          tokenMint:
            data.tokenMint || null,
          tokenSymbol:
            data.tokenSymbol || null,
          minimumBurn:
            Number(data.minimumBurn || 0),
          pointsPerTxn:
            Number(data.pointsPerTxn || 0),
          dailyCap:
            Number(data.dailyCap || 0),
          winnersCount:
            Number(data.winnersCount || 0),
          status:
            normalizeBurnEventStatus(
              data.status
            ),
          startAt:
            data.startAt?.toDate
              ? data.startAt
                  .toDate()
                  .toISOString()
              : null,
          endAt:
            data.endAt?.toDate
              ? data.endAt
                  .toDate()
                  .toISOString()
              : null,
          createdAt:
            data.createdAt?.toDate
              ? data.createdAt
                  .toDate()
                  .toISOString()
              : null,
        };
      })
      .sort((a, b) => {
        const aTime =
          Date.parse(a.startAt || "") || 0;

        const bTime =
          Date.parse(b.startAt || "") || 0;

        return bTime - aTime;
      });

    return res.json({
      events,
    });
  } catch (error) {
    console.error(
      "Load burn events error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Unable to load burn events.",
    });
  }
});
app.get(
  "/api/admin/burn-events/:eventId/leaderboard",
  async (req, res) => {
    if (!requireAdmin(req, res)) {
      return;
    }

    try {
      const eventId =
        String(req.params.eventId || "").trim();

      if (!eventId) {
        return res.status(400).json({
          error: "Event ID is required.",
        });
      }

      const eventDoc = await db
        .collection("burn_events")
        .doc(eventId)
        .get();

      if (!eventDoc.exists) {
        return res.status(404).json({
          error: "Burn event not found.",
        });
      }

      const event = eventDoc.data();
      const startAtMs =
  event.startAt?.toMillis
    ? event.startAt.toMillis()
    : 0;

const endAtMs =
  event.endAt?.toMillis
    ? event.endAt.toMillis()
    : 0;

const tokenMint =
  String(event.tokenMint || "");

const minimumBurn =
  Number(event.minimumBurn || 0);

const pointsPerTxn =
  Number(event.pointsPerTxn || 1);

const dailyCap =
  Number(event.dailyCap || 1);
  const burnSnap = await db
  .collection("burn_registry")
  .where("status", "==", "verified")
  .get();

const walletMap = new Map();
burnSnap.forEach((doc) => {
  const burn = doc.data();

  if (
    String(burn.mint || "") !== tokenMint
  ) {
    return;
  }

  const burnTimeMs =
    burn.createdAt?.toMillis
      ? burn.createdAt.toMillis()
      : Number(burn.blockTime || 0) * 1000;

  if (
    !burnTimeMs ||
    burnTimeMs < startAtMs ||
    burnTimeMs > endAtMs
  ) {
    return;
  }

  const amount =
    Number(burn.amount || 0);

  if (
    !Number.isFinite(amount) ||
    amount < minimumBurn
  ) {
    return;
  }

  const wallet =
    String(burn.wallet || "").trim();

  if (!wallet) {
    return;
  }
  const phtDate =
  new Date(
    burnTimeMs + 8 * 60 * 60 * 1000
  );

const dayKey =
  [
    phtDate.getUTCFullYear(),
    String(
      phtDate.getUTCMonth() + 1
    ).padStart(2, "0"),
    String(
      phtDate.getUTCDate()
    ).padStart(2, "0"),
  ].join("-");

if (!walletMap.has(wallet)) {
  walletMap.set(wallet, {
    wallet,
    points: 0,
    qualifyingTransactions: 0,
    totalBurned: 0,
    activeDays: new Set(),
    dailyCounts: new Map(),
    firstQualifyingBurn: null,
    latestQualifyingBurn: null,
  });
}

const entry =
  walletMap.get(wallet);
  const currentDailyCount =
  entry.dailyCounts.get(dayKey) || 0;

if (
  currentDailyCount >= dailyCap
) {
  return;
}

entry.dailyCounts.set(
  dayKey,
  currentDailyCount + 1
);

entry.qualifyingTransactions += 1;
entry.points += pointsPerTxn;
entry.totalBurned += amount;

entry.activeDays.add(dayKey);

if (
  !entry.firstQualifyingBurn ||
  burnTimeMs < entry.firstQualifyingBurn
) {
  entry.firstQualifyingBurn =
    burnTimeMs;
}

if (
  !entry.latestQualifyingBurn ||
  burnTimeMs > entry.latestQualifyingBurn
) {
  entry.latestQualifyingBurn =
    burnTimeMs;
}
});
const leaderboard =
  Array.from(walletMap.values())
    .map((entry) => ({
      wallet: entry.wallet,
      points: entry.points,
      qualifyingTransactions:
        entry.qualifyingTransactions,
      totalBurned:
        entry.totalBurned,
      activeDays:
        entry.activeDays.size,
      firstQualifyingBurn:
        entry.firstQualifyingBurn,
      latestQualifyingBurn:
        entry.latestQualifyingBurn,
    }))
    .sort((a, b) =>
      b.points - a.points ||
      b.activeDays - a.activeDays ||
      a.latestQualifyingBurn -
        b.latestQualifyingBurn
    )
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
    return res.json({
  event: {
    id: eventDoc.id,
    name:
      event.name || "Untitled Event",
    tokenMint,
    tokenSymbol:
      event.tokenSymbol || null,
    minimumBurn,
    pointsPerTxn,
    dailyCap,
    winnersCount:
      Number(event.winnersCount || 0),
    status:
      normalizeBurnEventStatus(
        event.status
      ),
    startAt:
      event.startAt?.toDate
        ? event.startAt
            .toDate()
            .toISOString()
        : null,
    endAt:
      event.endAt?.toDate
        ? event.endAt
            .toDate()
            .toISOString()
        : null,
  },
  leaderboard,
});
    } catch (error) {
      console.error(
        "Burn event leaderboard error:",
        error
      );

      return res.status(500).json({
        error:
          error.message ||
          "Unable to load burn event leaderboard.",
      });
    }
  }
);
app.get("/api/admin/overview", async (req, res) => {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const bounds =
  getAdminPeriodBounds(req);
    const burnSnap = await db
      .collection("burn_registry")
      .where("status", "==", "verified")
      .get();

    const referralSnap = await db
      .collection("referral_rewards")
      .get();

    const burns = burnSnap.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  .filter((burn) =>
    isInsideAdminPeriod(
      burn.createdAt,
      bounds
    )
  );

    const referrals = referralSnap.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  .filter((referral) =>
    isInsideAdminPeriod(
      referral.createdAt,
      bounds
    )
  );

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
      period: bounds.period,
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
      const bounds =
  getAdminPeriodBounds(req);
      const snap = await db
        .collection("burn_registry")
        .where("status", "==", "verified")
        .get();

      const tokens = new Map();

      snap.forEach((doc) => {
        const burn = doc.data();
        if (
  !isInsideAdminPeriod(
    burn.createdAt,
    bounds
  )
) {
  return;
}

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
  period: bounds.period,
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
      const bounds =
  getAdminPeriodBounds(req);
      const snap = await db
        .collection("referral_rewards")
        .get();

      const referrers = new Map();

      snap.forEach((doc) => {
        const reward = doc.data();
        if (
  !isInsideAdminPeriod(
    reward.createdAt,
    bounds
  )
) {
  return;
}

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
  period: bounds.period,
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
      const bounds =
  getAdminPeriodBounds(req);
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

if (
  !isInsideAdminPeriod(
    timestamp,
    bounds
  )
) {
  return;
}

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
  period: bounds.period,
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
      const bounds =
  getAdminPeriodBounds(req);
      const snap = await db
        .collection("burn_registry")
        .where("status", "==", "verified")
        .get();

      const burners = new Map();

      snap.forEach((doc) => {
        const burn = doc.data();
        if (
  !isInsideAdminPeriod(
    burn.createdAt,
    bounds
  )
) {
  return;
}

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
  period: bounds.period,
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