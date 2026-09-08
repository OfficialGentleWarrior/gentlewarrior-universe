import {
  createClient,
  address,
  lamports,
} from "@solana/kit";

import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner } from "@solana/kit-plugin-wallet";

import {
  getBurnCheckedInstruction as getSplBurnCheckedInstruction,
} from "@solana-program/token";

import {
  getBurnCheckedInstruction as getToken2022BurnCheckedInstruction,
} from "@solana-program/token-2022";

import {
  getTransferSolInstruction,
} from "@solana-program/system";

// ======================================================
// CONFIG
// ======================================================

const API_BASE_URL =
  "https://burningwellapi-slmbcnmgwa-as.a.run.app";

// RPC now goes through the backend so the ANKR secret never reaches the browser.
const RPC_ENDPOINTS = [
  `${API_BASE_URL}/api/rpc`,
];

const ANKR_RPC_URL =
  `${API_BASE_URL}/api/rpc`;

const TOKEN_PROGRAM_ID =
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

const TOKEN_2022_PROGRAM_ID =
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

// ======================================================
// BURNING WELL SERVICE FEE
// ======================================================

const FEE_WALLET =
  "AdHbukAvr1CeQVGg7iMnbETTrnyqLekQowukfh53nsy4";

const SERVICE_FEE_USD = 1.50;

const SOL_MINT =
  "So11111111111111111111111111111111111111112";

const LAMPORTS_PER_SOL = 1_000_000_000;

// ======================================================
// TOKEN METADATA
// ======================================================

const JUPITER_TOKEN_SEARCH_URL =
  "https://lite-api.jup.ag/tokens/v2/search";

// ======================================================
// WALLET CLIENT
// ======================================================

const client = createClient()
  .use(
    walletSigner({
      chain: "solana:mainnet",
    })
  )
  .use(
  solanaRpc({
    rpcUrl: ANKR_RPC_URL,
    rpcSubscriptionsUrl:
      "wss://api.mainnet-beta.solana.com",
  })
);

// ======================================================
// ELEMENTS
// ======================================================

const connectWalletBtn =
  document.getElementById(
    "connectWalletBtn"
  );

const walletStatus =
  document.getElementById(
    "walletStatus"
  );

const tokenSelect =
  document.getElementById(
    "tokenSelect"
  );

const burnAmount =
  document.getElementById(
    "burnAmount"
  );

const maxBtn =
  document.getElementById(
    "maxBtn"
  );

const burnBtn =
  document.getElementById(
    "burnBtn"
  );

// ======================================================
// STATE
// ======================================================

let walletTokens = [];

let selectedToken = null;

let activeBurnModal = null;

const tokenMetadataCache =
  new Map();

let burnRegistryRecords = [];

let registryLoading = false;

const referralCodeFromUrl =
  new URLSearchParams(window.location.search).get("ref") || null;

let activeReferralCode = referralCodeFromUrl;

let ownReferralCode = null;

let referralStats = {
  successfulReferrals: 0,
  rewardsEarned: 0,
  rewardsPaid: 0,
  referrals: [],
};

// ======================================================
// HELPERS
// ======================================================

function shortenAddress(
  value
) {
  if (!value) {
    return "";
  }

  const text =
    String(value);

  return `${text.slice(
    0,
    4
  )}...${text.slice(-4)}`;
}

// ======================================================

function formatBalance(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "0";
  }

  return number.toLocaleString(
    undefined,
    {
      maximumFractionDigits:
        9,
    }
  );
}

// ======================================================

function escapeHtml(
  value
) {
  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

// ======================================================
// RPC
// ======================================================

async function rpcRequest(
  method,
  params
) {
  let lastError =
    null;

  for (
    const endpoint of
    RPC_ENDPOINTS
  ) {
    try {
      const response =
        await fetch(
          endpoint,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                jsonrpc:
                  "2.0",

                id:
                  Date.now(),

                method,

                params,
              }),
          }
        );

      if (
        !response.ok
      ) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      if (
        data.error
      ) {
        throw new Error(
          data.error.message ||
          `Solana RPC error: ${data.error.code}`
        );
      }

      return data.result;

    } catch (error) {

      console.warn(
        "RPC failed:",
        endpoint,
        error
      );

      lastError =
        error;
    }
  }

  throw (
    lastError ||
    new Error(
      "All Solana RPC endpoints failed."
    )
  );
}
async function waitForTransaction(
  signature,
  maxAttempts = 30
) {
  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    const transaction =
      await rpcRequest(
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

    if (transaction) {
      if (transaction.meta?.err) {
        throw new Error(
          "The Solana transaction failed on-chain."
        );
      }

      return transaction;
    }

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 1000)
    );
  }

  throw new Error(
    "Transaction confirmation timed out. The transaction may still be processing."
  );
}
// ======================================================
// TOKEN ACCOUNTS
// ======================================================

async function getTokenAccounts(
  owner,
  programId
) {
  const result =
    await rpcRequest(
      "getTokenAccountsByOwner",
      [
        owner,

        {
          programId,
        },

        {
          commitment:
            "confirmed",

          encoding:
            "jsonParsed",
        },
      ]
    );

  if (
    !result?.value
  ) {
    return [];
  }

  return result.value
    .map(
      (account) => {

        try {

          const parsed =
            account
              .account
              .data
              .parsed;

          const info =
            parsed.info;

          const tokenAmount =
            info.tokenAmount;

          return {
            tokenAccount:
              String(
                account.pubkey
              ),

            mint:
              String(
                info.mint
              ),

            owner:
              String(
                info.owner
              ),

            amount:
              String(
                tokenAmount.amount
              ),

            decimals:
              Number(
                tokenAmount.decimals
              ),

            uiAmount:
              Number(
                tokenAmount.uiAmount ||
                0
              ),

            uiAmountString:
              tokenAmount.uiAmountString,

            programId,

            name:
              null,

            symbol:
              null,

            logoURI:
              null,
          };

        } catch (
          error
        ) {

          console.warn(
            "Skipping malformed token:",
            error
          );

          return null;
        }
      }
    )
    .filter(
      (token) =>
        token &&
        token.uiAmount > 0
    );
}

// ======================================================
// TOKEN METADATA
// ======================================================

async function getTokenMetadata(
  mint
) {
  if (!mint) {
    return null;
  }

  if (
    tokenMetadataCache.has(
      mint
    )
  ) {
    return tokenMetadataCache.get(
      mint
    );
  }

  try {

    const url =
      `${JUPITER_TOKEN_SEARCH_URL}?query=${encodeURIComponent(
        mint
      )}`;

    const response =
      await fetch(
        url
      );

    if (
      !response.ok
    ) {

      tokenMetadataCache.set(
        mint,
        null
      );

      return null;
    }

    const data =
      await response.json();

    if (
      !Array.isArray(
        data
      ) ||
      data.length === 0
    ) {

      tokenMetadataCache.set(
        mint,
        null
      );

      return null;
    }

    const token =
      data.find(
        (item) =>
          item?.id ===
          mint
      ) ||
      data[0];

    const metadata = {
      name:
        token?.name ||
        null,

      symbol:
        token?.symbol ||
        null,

      logoURI:
        token?.icon ||
        token?.logoURI ||
        null,
    };

    tokenMetadataCache.set(
      mint,
      metadata
    );

    return metadata;

  } catch (
    error
  ) {

    console.warn(
      "Metadata lookup failed:",
      mint,
      error
    );

    tokenMetadataCache.set(
      mint,
      null
    );

    return null;
  }
}

// ======================================================
// ENRICH TOKENS
// ======================================================

async function enrichTokenMetadata(
  tokens
) {
  return Promise.all(
    tokens.map(
      async (token) => {

        const metadata =
          await getTokenMetadata(
            token.mint
          );

        return {
          ...token,

          name:
            metadata?.name ||
            null,

          symbol:
            metadata?.symbol ||
            null,

          logoURI:
            metadata?.logoURI ||
            null,
        };
      }
    )
  );
}

// ======================================================
// RESET TOKEN UI
// ======================================================

function resetTokenUI() {

  walletTokens = [];

  selectedToken =
    null;

  tokenSelect.innerHTML = `
    <option value="">
      Connect wallet first
    </option>
  `;

  tokenSelect.disabled =
    true;

  burnAmount.value =
    "";

  burnAmount.disabled =
    true;

  maxBtn.disabled =
    true;

  burnBtn.disabled =
    true;
}

// ======================================================
// WALLET UI
// ======================================================

function updateWalletUI() {

  const state =
    client.wallet.getState();

  const connected =
    state.connected;

  if (
    connected?.account?.address
  ) {

    const walletName =
      connected.wallet?.name ||
      "Wallet";

    walletStatus.textContent =
      `${walletName} • ${shortenAddress(
        connected.account.address
      )}`;

    connectWalletBtn.textContent =
      "Disconnect";

  } else {

    walletStatus.textContent =
      "Not connected";

    connectWalletBtn.textContent =
      "Connect Wallet";
  }

  renderWalletHistory();
}

// ======================================================
// LOAD TOKENS
// ======================================================

async function loadWalletTokens() {

  const state =
    client.wallet.getState();

  const connected =
    state.connected;

  if (
    !connected?.account?.address
  ) {

    resetTokenUI();

    return;
  }

  const owner =
    String(
      connected.account.address
    );

  tokenSelect.disabled =
    true;

  burnAmount.disabled =
    true;

  maxBtn.disabled =
    true;

  burnBtn.disabled =
    true;

  tokenSelect.innerHTML = `
    <option value="">
      Loading tokens...
    </option>
  `;

  try {

    const splTokens =
      await getTokenAccounts(
        owner,
        TOKEN_PROGRAM_ID
      );

    const token2022Tokens =
      await getTokenAccounts(
        owner,
        TOKEN_2022_PROGRAM_ID
      );

    const allTokens = [
      ...splTokens,
      ...token2022Tokens,
    ];

    tokenSelect.innerHTML = `
      <option value="">
        Loading token names...
      </option>
    `;

    walletTokens =
      await enrichTokenMetadata(
        allTokens
      );

    renderTokenSelect();

  } catch (
    error
  ) {

    console.error(
      "TOKEN RPC ERROR:",
      error
    );

    tokenSelect.innerHTML = `
      <option value="">
        Failed to load tokens
      </option>
    `;

    tokenSelect.disabled =
      true;

    alert(
      "Unable to load your Solana tokens.\n\n" +
      (
        error?.message ||
        "Unknown error"
      )
    );
  }
}

// ======================================================
// TOKEN SELECT
// ======================================================

function renderTokenSelect() {

  tokenSelect.innerHTML =
    "";

  if (
    walletTokens.length === 0
  ) {

    tokenSelect.innerHTML = `
      <option value="">
        No tokens found
      </option>
    `;

    tokenSelect.disabled =
      true;

    return;
  }

  const defaultOption =
    document.createElement(
      "option"
    );

  defaultOption.value =
    "";

  defaultOption.textContent =
    "Select a token";

  tokenSelect.appendChild(
    defaultOption
  );

  walletTokens.forEach(
    (
      token,
      index
    ) => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        String(index);

      let label = "";

      if (
        token.name &&
        token.symbol
      ) {

        label =
          `${token.name} (${token.symbol}) — ${formatBalance(
            token.uiAmount
          )}`;

      } else if (
        token.symbol
      ) {

        label =
          `${token.symbol} — ${formatBalance(
            token.uiAmount
          )}`;

      } else if (
        token.name
      ) {

        label =
          `${token.name} — ${formatBalance(
            token.uiAmount
          )}`;

      } else {

        label =
          `${shortenAddress(
            token.mint
          )} — ${formatBalance(
            token.uiAmount
          )}`;
      }

      option.textContent =
        label;

      tokenSelect.appendChild(
        option
      );
    }
  );

  tokenSelect.disabled =
    false;
}

// ======================================================
// TOKEN SELECTION
// ======================================================

tokenSelect.addEventListener(
  "change",
  () => {

    const value =
      tokenSelect.value;

    if (
      value === ""
    ) {

      selectedToken =
        null;

      burnAmount.value =
        "";

      burnAmount.disabled =
        true;

      maxBtn.disabled =
        true;

      burnBtn.disabled =
        true;

      return;
    }

    const index =
      Number(value);

    const token =
      walletTokens[index];

    if (!token) {

      selectedToken =
        null;

      burnAmount.disabled =
        true;

      maxBtn.disabled =
        true;

      burnBtn.disabled =
        true;

      return;
    }

    selectedToken =
      token;

    burnAmount.value =
      "";

    burnAmount.disabled =
      false;

    maxBtn.disabled =
      false;

    burnBtn.disabled =
  false;
  }
);

// ======================================================
// MAX
// ======================================================

maxBtn.addEventListener(
  "click",
  () => {

    if (
      !selectedToken
    ) {
      return;
    }

    burnAmount.value =
      selectedToken.uiAmountString ||
      selectedToken.uiAmount;

    updateBurnButton();
  }
);

// ======================================================
// AMOUNT
// ======================================================

burnAmount.addEventListener(
  "input",
  updateBurnButton
);

// ======================================================
// BURN BUTTON STATE
// ======================================================

function updateBurnButton() {

  if (
    !selectedToken
  ) {

    burnBtn.disabled =
      true;

    return;
  }

  const amount =
    Number(
      burnAmount.value
    );

  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {

    burnBtn.disabled =
      true;

    return;
  }

  if (
    amount >
    selectedToken.uiAmount
  ) {

    burnBtn.disabled =
      true;

    return;
  }

  burnBtn.disabled =
    false;
}

// ======================================================
// WALLET MODAL
// ======================================================

function createWalletModal() {

  const existing =
    document.getElementById(
      "walletModal"
    );

  if (existing) {
    existing.remove();
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "walletModal";

  modal.className =
    "wallet-modal";

  modal.innerHTML = `
    <div class="wallet-modal-backdrop"></div>

    <div
      class="wallet-modal-card"
      role="dialog"
      aria-modal="true"
    >

      <button
        class="wallet-modal-close"
        id="walletModalClose"
        type="button"
        aria-label="Close"
      >
        ×
      </button>

      <div class="wallet-modal-logo">
        🔥
      </div>

      <p class="wallet-modal-eyebrow">
        GENTLE WARRIOR
      </p>

      <h2>
        Connect Your Wallet
      </h2>

      <p class="wallet-modal-subtitle">
        Choose a Solana wallet to continue.
      </p>

      <div
        id="walletList"
        class="wallet-list"
      ></div>

      <p class="wallet-modal-note">
        Your wallet stays in your control.
        Every transaction requires your approval.
      </p>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  document
    .getElementById(
      "walletModalClose"
    )
    .addEventListener(
      "click",
      closeWalletModal
    );

  modal
    .querySelector(
      ".wallet-modal-backdrop"
    )
    .addEventListener(
      "click",
      closeWalletModal
    );

  return modal;
}

// ======================================================
// CLOSE WALLET MODAL
// ======================================================

function closeWalletModal() {

  const modal =
    document.getElementById(
      "walletModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "is-open"
  );

  setTimeout(
    () => {
      modal.remove();
    },
    180
  );
}

// ======================================================
// RENDER WALLETS
// ======================================================

function renderWallets(
  wallets
) {

  const modal =
    createWalletModal();

  const walletList =
    document.getElementById(
      "walletList"
    );

  if (
    !wallets.length
  ) {

    walletList.innerHTML = `
      <div class="wallet-empty">

        <strong>
          No Solana wallet detected.
        </strong>

        <span>
          Please install Phantom,
          Backpack, Solflare,
          or another compatible wallet.
        </span>

      </div>
    `;

    requestAnimationFrame(
      () => {
        modal.classList.add(
          "is-open"
        );
      }
    );

    return;
  }

  wallets.forEach(
    (wallet) => {

      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "wallet-option";

      const icon =
        wallet.icon || "";

      button.innerHTML = `
        <span class="wallet-option-icon">

          ${
            icon
              ? `
                <img
                  src="${icon}"
                  alt=""
                />
              `
              : `
                <span class="wallet-fallback">
                  ◈
                </span>
              `
          }

        </span>

        <span class="wallet-option-info">

          <strong>
            ${escapeHtml(
              wallet.name
            )}
          </strong>

          <small>
            Solana wallet
          </small>

        </span>

        <span class="wallet-option-arrow">
          →
        </span>
      `;

      button.addEventListener(
        "click",
        async () => {

          const original =
            button.innerHTML;

          button.disabled =
            true;

          button.innerHTML = `
            <span class="wallet-option-icon">
              <span class="wallet-spinner"></span>
            </span>

            <span class="wallet-option-info">

              <strong>
                Connecting...
              </strong>

              <small>
                ${escapeHtml(
                  wallet.name
                )}
              </small>

            </span>
          `;

          try {

            await client.wallet.connect(
              wallet
            );

            const connectedAddress =
              String(
                client.wallet.getState().connected?.account?.address ||
                ""
              );

            ownReferralCode =
  await registerReferralWallet(
    connectedAddress
  );

console.log(
  "OWN REFERRAL CODE:",
  ownReferralCode
);

            if (ownReferralCode) {
  activeReferralCode =
    activeReferralCode || ownReferralCode;

  window.burningWellReferralCode =
    ownReferralCode;
}
renderWalletHistory();

            updateWalletUI();

            closeWalletModal();

            await loadWalletTokens();

            await loadBurnRegistry();

            await loadReferralStats();

          } catch (
            error
          ) {

            console.error(
              "Wallet connection failed:",
              error
            );

            button.disabled =
              false;

            button.innerHTML =
              original;

            alert(
              error?.message ||
              "Wallet connection failed."
            );
          }
        }
      );

      walletList.appendChild(
        button
      );
    }
  );

  requestAnimationFrame(
    () => {
      modal.classList.add(
        "is-open"
      );
    }
  );
}

// ======================================================
// CONNECT / DISCONNECT
// ======================================================

connectWalletBtn.addEventListener(
  "click",
  async () => {

    try {

      const state =
        client.wallet.getState();

      if (
        state.connected
      ) {

        await client.wallet.disconnect();

        resetTokenUI();

        updateWalletUI();

        return;
      }

      const wallets =
        state.wallets || [];

      console.log(
        "Available wallets:",
        wallets.map(
          (wallet) =>
            wallet.name
        )
      );

      renderWallets(
        wallets
      );

    } catch (
      error
    ) {

      console.error(
        "Wallet operation failed:",
        error
      );

      alert(
        error?.message ||
        "Wallet operation failed."
      );
    }
  }
);

// ======================================================
// SOL PRICE
// ======================================================

async function getSolUsdPrice() {

  const url =
    `${JUPITER_TOKEN_SEARCH_URL}?query=${encodeURIComponent(
      SOL_MINT
    )}`;

  const response =
    await fetch(
      url
    );

  if (
    !response.ok
  ) {

    throw new Error(
      `Unable to get SOL price. HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    !Array.isArray(
      data
    ) ||
    data.length === 0
  ) {

    throw new Error(
      "Unable to get current SOL price."
    );
  }

  const solToken =
    data.find(
      (token) =>
        token?.id ===
        SOL_MINT
    ) ||
    data[0];

  const price =
    Number(
      solToken?.usdPrice
    );

  if (
    !Number.isFinite(
      price
    ) ||
    price <= 0
  ) {

    throw new Error(
      "Invalid SOL/USD price."
    );
  }

  return price;
}

// ======================================================
// SERVICE FEE
// ======================================================

async function getServiceFeeLamports(referralCode = null) {

  const url = new URL(
    `${API_BASE_URL}/api/fee-quote`
  );

  if (referralCode) {
    url.searchParams.set(
      "ref",
      referralCode
    );
  }

  const response = await fetch(
    url.toString()
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Unable to get the Burning Well service fee."
    );
  }

  return {
    quoteId: data.quoteId,
    solUsdPrice: Number(data.solUsdPrice),
    feeSol: Number(data.totalLamports) / LAMPORTS_PER_SOL,
    feeLamports: BigInt(data.totalLamports),
    serviceFeeLamports: BigInt(data.serviceLamports),
    referralRewardLamports: BigInt(data.referralLamports),
    referralCode: data.referralCode || null,
    referrerWallet: data.referrerWallet || null,
  };
}

// ======================================================
// BACKEND REGISTRATION
// ======================================================

async function registerReferralWallet(wallet) {

  if (!wallet) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/referrals/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Unable to register referral code."
      );
    }

    return data.code || null;
  } catch (error) {
    console.warn(
      "Referral registration failed:",
      error
    );
    return null;
  }
}

async function registerBurnWithBackend({
  signature,
  wallet,
  token,
  amount,
  baseUnits,
  quoteId,
  referralCode,
}) {

  const response = await fetch(
    `${API_BASE_URL}/api/burns/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signature,
        wallet,
        mint: token.mint,
        tokenName: token.name || null,
        tokenSymbol: token.symbol || null,
        amount: String(amount),
        amountBaseUnits: baseUnits.toString(),
        decimals: token.decimals,
        quoteId,
        referralCode: referralCode || null,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Burn was not registered by Burning Well."
    );
  }

  return data;
}

// ======================================================
// BURN EXPERIENCE
// ======================================================

function createBurnModal() {

  const existing =
    document.getElementById(
      "burnModal"
    );

  if (existing) {
    existing.remove();
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "burnModal";

  modal.className =
    "burn-modal";

  modal.innerHTML = `
    <div class="burn-modal-card">

      <div class="burn-modal-video-wrap">

        <video
          id="burnExperienceVideo"
          class="burn-modal-video"
          muted
          playsinline
          preload="auto"
        >
          <source
            src="./assets/burning well.mp4"
            type="video/mp4"
          />
        </video>

      </div>

      <div
        id="burnModalContent"
        class="burn-modal-content"
      >

        <div class="burning-spinner"></div>

        <p class="burn-modal-eyebrow">
          BURNING WELL
        </p>

        <h2
          id="burnModalTitle"
          class="burn-modal-title"
        >
          BURNING...
        </h2>

        <p
          id="burnModalAmount"
          class="burn-modal-amount"
        ></p>

        <p
          id="burnModalStatus"
          class="burn-modal-status"
        >
          Preparing your burn transaction...
        </p>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  return modal;
}

// ======================================================
// OPEN BURNING MODAL
// ======================================================

function openBurningModal(
  amount,
  tokenLabel
) {

  const modal =
    createBurnModal();

  const video =
    document.getElementById(
      "burnExperienceVideo"
    );

  const amountEl =
    document.getElementById(
      "burnModalAmount"
    );

  const statusEl =
    document.getElementById(
      "burnModalStatus"
    );

  amountEl.textContent =
    `${formatBalance(
      amount
    )} ${tokenLabel}`;

  statusEl.textContent =
    "Preparing your burn transaction...";

  modal.classList.add(
    "is-open"
  );

  activeBurnModal =
    modal;

  video.currentTime =
    0;

  video
    .play()
    .catch(
      () => {}
    );

  return modal;
}
function showBurnConfirmation(
  amount,
  tokenLabel
) {
  return new Promise((resolve) => {
    const modal = createBurnModal();

    const content =
      document.getElementById(
        "burnModalContent"
      );

    if (!modal || !content) {
      resolve(false);
      return;
    }

    content.innerHTML = `
      <p class="burn-modal-eyebrow">
        BURNING WELL
      </p>

      <h2 class="burn-modal-title">
        🔥 CONFIRM BURN
      </h2>

      <p class="burn-modal-amount">
        ${escapeHtml(
          formatBalance(amount)
        )} ${escapeHtml(tokenLabel)}
      </p>

      <p class="burn-modal-status">
        This token will be permanently burned.<br />
        A $${SERVICE_FEE_USD.toFixed(2)}
        USD-equivalent service fee in SOL will also be paid.
      </p>

      <div class="burn-modal-actions">

        <button
          id="burnConfirmCancel"
          class="burn-modal-action"
          type="button"
        >
          Cancel
        </button>

        <button
          id="burnConfirmProceed"
          class="burn-modal-action"
          type="button"
        >
          🔥 Confirm Burn
        </button>

      </div>
    `;

    modal.classList.add("is-open");
    activeBurnModal = modal;

    const cleanup = (result) => {
      modal.classList.remove("is-open");

      setTimeout(() => {
        modal.remove();
      }, 250);

      activeBurnModal = null;

      resolve(result);
    };

    document
      .getElementById("burnConfirmCancel")
      ?.addEventListener(
        "click",
        () => cleanup(false)
      );

    document
      .getElementById("burnConfirmProceed")
      ?.addEventListener(
        "click",
        () => cleanup(true)
      );
  });
}
// ======================================================
// BURNING STATUS
// ======================================================

function setBurningStatus(
  message
) {

  const statusEl =
    document.getElementById(
      "burnModalStatus"
    );

  if (statusEl) {
    statusEl.textContent =
      message;
  }
}

// ======================================================
// BURN COMPLETE
// ======================================================

function showBurnComplete(
  amount,
  tokenLabel,
  signature
) {

  const modal =
    activeBurnModal ||
    document.getElementById(
      "burnModal"
    );

  if (!modal) {
    return;
  }

  const content =
    document.getElementById(
      "burnModalContent"
    );

  if (!content) {
    return;
  }

  const safeAmount =
    escapeHtml(
      formatBalance(
        amount
      )
    );

  const safeToken =
    escapeHtml(
      tokenLabel
    );

  const txUrl =
    signature
      ? `https://solscan.io/tx/${encodeURIComponent(
          signature
        )}`
      : window.location.href;

  content.innerHTML = `
    <p class="burn-modal-eyebrow">
      BURNING WELL
    </p>

    <h2 class="burn-modal-title">
      🔥 BURN COMPLETE
    </h2>

    <p class="burn-modal-amount">
      ${safeAmount} ${safeToken}
    </p>

    <p class="burn-modal-status">
      Permanently Burned<br />
      ✓ Solana Verified
    </p>

    <div class="burn-modal-brand">
      <strong>Burning Well</strong>
      by Gentle Warrior
    </div>

    <div class="burn-modal-actions">

      <button
        id="shareXBtn"
        class="burn-modal-action"
        type="button"
      >
        Share to X
      </button>

      <button
        id="shareBtn"
        class="burn-modal-action"
        type="button"
      >
        Share
      </button>

      <button
        id="copyTxBtn"
        class="burn-modal-action"
        type="button"
      >
        Copy TX
      </button>

    </div>

    <button
      id="burnModalClose"
      class="burn-modal-close"
      type="button"
    >
      Done
    </button>
  `;

  const shareText =
    `🔥 I just permanently burned ${formatBalance(
      amount
    )} ${tokenLabel} using Burning Well by @GentleWarrior02 .\n\n` +
    `Burn Tokens. Fund Hope. Strengthen GWAR. 💚`;

  // ====================================================
  // SHARE TO X
  // ====================================================

  document
    .getElementById(
      "shareXBtn"
    )
    .addEventListener(
      "click",
      () => {

        const url =
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(
            txUrl
          )}`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      }
    );

  // ====================================================
  // SHARE
  // ====================================================

  document
    .getElementById(
      "shareBtn"
    )
    .addEventListener(
      "click",
      async () => {

        try {

          if (
            navigator.share
          ) {

            await navigator.share({
              title:
                "Burning Well — Burn Complete",

              text:
                shareText,

              url:
                txUrl,
            });

          } else {

            await navigator.clipboard.writeText(
              `${shareText}\n\n${txUrl}`
            );

            alert(
              "Share text copied to clipboard."
            );
          }

        } catch (
          error
        ) {

          if (
            error?.name !==
            "AbortError"
          ) {

            console.error(
              "Share failed:",
              error
            );
          }
        }
      }
    );

  // ====================================================
  // COPY TX
  // ====================================================

  document
    .getElementById(
      "copyTxBtn"
    )
    .addEventListener(
      "click",
      async () => {

        if (!signature) {
          return;
        }

        try {

          await navigator.clipboard.writeText(
            signature
          );

          const button =
            document.getElementById(
              "copyTxBtn"
            );

          button.textContent =
            "Copied ✓";

          setTimeout(
            () => {

              button.textContent =
                "Copy TX";

            },
            1600
          );

        } catch (
          error
        ) {

          console.error(
            "Copy TX failed:",
            error
          );

          alert(
            "Unable to copy the transaction signature."
          );
        }
      }
    );

  // ====================================================
  // CLOSE
  // ====================================================

  document
    .getElementById(
      "burnModalClose"
    )
    .addEventListener(
      "click",
      () => {

        modal.classList.remove(
          "is-open"
        );

        setTimeout(
          () => {
            modal.remove();
          },
          250
        );

        activeBurnModal =
          null;
      }
    );
}

// ======================================================
// DECIMAL → BASE UNITS
// ======================================================

function decimalToBaseUnits(
  value,
  decimals
) {

  const text =
    String(
      value ?? ""
    ).trim();

  if (
    !/^\d+(\.\d+)?$/.test(
      text
    )
  ) {

    throw new Error(
      "Enter a valid token amount."
    );
  }

  const [
    wholePart,
    fractionPart = "",
  ] =
    text.split(".");

  if (
    fractionPart.length >
    decimals
  ) {

    throw new Error(
      `Maximum ${decimals} decimal places allowed for this token.`
    );
  }

  const paddedFraction =
    fractionPart.padEnd(
      decimals,
      "0"
    );

  const baseUnitsText =
    `${wholePart}${paddedFraction}`
      .replace(
        /^0+(?=\d)/,
        ""
      );

  return BigInt(
    baseUnitsText ||
    "0"
  );
}

// ======================================================
// REGISTRY HELPERS
// ======================================================

function getBurnFromTransaction(
  transaction
) {

  const instructions =
    transaction
      ?.transaction
      ?.message
      ?.instructions ||
    [];

  for (
    const instruction of
    instructions
  ) {

    const parsed =
      instruction?.parsed;

    if (!parsed?.info) {
      continue;
    }

    const type =
      String(
        parsed.type ||
        ""
      ).toLowerCase();

    if (
      type !== "burn" &&
      type !== "burnchecked"
    ) {
      continue;
    }

    const info =
      parsed.info;

    if (
      info?.mint &&
      info?.account &&
      info?.amount
    ) {

      return {
        mint:
          String(
            info.mint
          ),

        account:
          String(
            info.account
          ),

        authority:
          info.authority
            ? String(
                info.authority
              )
            : null,

        amount:
          String(
            info.amount
          ),

        decimals:
          Number(
            info.decimals ||
            0
          ),
      };
    }
  }

  return null;
}

// ======================================================
// FIND FEE TRANSFER
// ======================================================

function getBurningWellFeeFromTransaction(
  transaction
) {

  const instructions =
    transaction
      ?.transaction
      ?.message
      ?.instructions ||
    [];

  for (
    const instruction of
    instructions
  ) {

    const parsed =
      instruction?.parsed;

    if (!parsed?.info) {
      continue;
    }

    const type =
      String(
        parsed.type ||
        ""
      ).toLowerCase();

    if (
      type !==
      "transfer"
    ) {
      continue;
    }

    const info =
      parsed.info;

    if (
      String(
        info.destination ||
        ""
      ) ===
      FEE_WALLET
    ) {

      return {
        source:
          info.source
            ? String(
                info.source
              )
            : null,

        lamports:
          Number(
            info.lamports ||
            0
          ),
      };
    }
  }

  return null;
}

// ======================================================
// GET TRANSACTION
// ======================================================

async function getTransaction(
  signature
) {

  return rpcRequest(
    "getTransaction",
    [
      signature,

      {
        commitment:
          "confirmed",

        encoding:
          "jsonParsed",

        maxSupportedTransactionVersion:
          0,
      },
    ]
  );
}

// ======================================================
// LOAD BURN REGISTRY
// ======================================================
//
// The registry is verified directly from Solana.
//
// A transaction is considered a Burning Well burn
// when BOTH are present:
//
// 1. Token burn instruction
// 2. $1.50-equivalent SOL fee transfer to the
//    official Burning Well fee wallet
//
// This works for SPL Token and Token-2022.
// ======================================================

async function loadBurnRegistry() {

  if (registryLoading) {
    return;
  }

  registryLoading = true;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/burns`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Unable to load Burning Well history."
      );
    }

    burnRegistryRecords =
      Array.isArray(data.records)
        ? data.records
        : [];

    renderWalletHistory();

  } catch (error) {
    console.warn(
      "Burn Registry unavailable:",
      error
    );

    burnRegistryRecords = [];
    renderWalletHistory();

  } finally {
    registryLoading = false;
  }
}
async function loadReferralStats() {
  const wallet =
    getConnectedWalletAddress();

  if (!wallet) {
    referralStats = {
      successfulReferrals: 0,
      rewardsEarned: 0,
      rewardsPaid: 0,
      referrals: [],
    };

    renderWalletHistory();
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/referrals?wallet=${encodeURIComponent(
        wallet
      )}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Unable to load referral details."
      );
    }

    referralStats = {
      successfulReferrals:
        Number(data.successfulReferrals || 0),
      rewardsEarned:
        Number(data.rewardsEarned || 0),
      rewardsPaid:
        Number(data.rewardsPaid || 0),
      referrals:
        Array.isArray(data.referrals)
          ? data.referrals
          : [],
    };

    renderWalletHistory();
  } catch (error) {
    console.warn(
      "Referral stats unavailable:",
      error
    );

    referralStats = {
      successfulReferrals: 0,
      rewardsEarned: 0,
      rewardsPaid: 0,
      referrals: [],
    };

    renderWalletHistory();
  }
}
async function loadGlobalStats() {

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stats`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Unable to load Burning Well statistics."
      );
    }

    const burnCounter =
      document.getElementById(
        "totalBurnTransactions"
      );

    const feeCounter =
      document.getElementById(
        "totalFeesGenerated"
      );

    if (burnCounter) {
      burnCounter.textContent =
        Number(
          data.totalBurnTransactions || 0
        ).toLocaleString();
    }

    if (feeCounter) {
      feeCounter.textContent =
        `$${Number(
          data.totalFeesUsd || 0
        ).toFixed(2)}`;
    }

  } catch (error) {
    console.warn(
      "Global stats unavailable:",
      error
    );
  }
}

// ======================================================
// REGISTRY UI
// ======================================================

function createRegistryUI() {

  let registry =
    document.getElementById(
      "burnRegistry"
    );

  if (registry) {
    return registry;
  }

  registry =
    document.createElement(
      "section"
    );

  registry.id =
    "burnRegistry";

  registry.innerHTML = `
    <div
      class="burn-registry-card"
      style="
        width:100%;
        max-width:1100px;
        margin:40px auto;
      "
    >

      <div
        class="burn-registry-header"
      >

        <p>
          BURNING WELL
        </p>

        <h2>
          Burn Registry
        </h2>

        <span>
          Burn Tokens. Fund Hope. Strengthen GWAR. 💚
        </span>

      </div>

      <div
        class="burn-registry-stats"
        style="
          display:grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap:16px;
          margin-top:20px;
        "
      >

        <div
          class="burn-registry-stat"
        >

          <small>
            Total Burn Transactions
          </small>

          <strong
            id="totalBurnTransactions"
          >
            0
          </strong>

        </div>

        <div
          class="burn-registry-stat"
        >

          <small>
            Total Fees Generated
          </small>

          <strong
            id="totalFeesGenerated"
          >
            $0.00
          </strong>

        </div>

      </div>

      <div
        class="burn-registry-list"
        id="burnRegistryList"
        style="
          margin-top:24px;
        "
      ></div>

    </div>
  `;

  const main =
    document.querySelector(
      "main"
    );

  if (main) {

    main.appendChild(
      registry
    );

  } else {

    document.body.appendChild(
      registry
    );
  }

  return registry;
}

// ======================================================
// RENDER REGISTRY
// ======================================================

function renderRegistry() {

  const registry =
    createRegistryUI();

  const totalBurns =
    burnRegistryRecords.length;

  const totalFees =
    burnRegistryRecords.reduce(
      (sum, record) =>
        sum + Number(record.feeSol || 0),
      0
    );

  const burnCounter =
    document.getElementById(
      "totalBurnTransactions"
    );

  const feeCounter =
    document.getElementById(
      "totalFeesGenerated"
    );

  if (
    burnCounter
  ) {

    burnCounter.textContent =
      totalBurns.toLocaleString();
  }

  if (
    feeCounter
  ) {

    feeCounter.textContent =
      `$${totalFees.toFixed(2)}`;
  }

  const list =
    registry.querySelector(
      "#burnRegistryList"
    );

  if (!list) {
    return;
  }

  if (
    burnRegistryRecords.length ===
    0
  ) {

    list.innerHTML = `
      <div class="burn-registry-empty">
        No Burning Well burns found yet.
      </div>
    `;

    return;
  }

  list.innerHTML =
    burnRegistryRecords
      .slice(
        0,
        20
      )
      .map(
        (record) => {

          const tokenLabel =
            record.name
              ? record.symbol
                ? `${record.name} (${record.symbol})`
                : record.name
              : record.symbol ||
                shortenAddress(
                  record.mint
                );

          const date =
            record.blockTime
              ? new Date(
                  record.blockTime *
                    1000
                ).toLocaleString()
              : "";

          return `
            <div
              class="burn-registry-row"
              style="
                display:flex;
                justify-content:
                  space-between;
                gap:16px;
                padding:14px 0;
              "
            >

              <div>

                <strong>
                  ${escapeHtml(
                    tokenLabel
                  )}
                </strong>

                <div>
                  ${escapeHtml(
                    shortenAddress(
                      record.wallet
                    )
                  )}
                </div>

              </div>

              <div>

                <strong>
                  ${escapeHtml(
                    formatBalance(
                      record.amount
                    )
                  )}
                </strong>

                <div>
                  ${escapeHtml(
                    date
                  )}
                </div>

              </div>

              <a
                href="https://solscan.io/tx/${encodeURIComponent(
                  record.signature
                )}"
                target="_blank"
                rel="noopener noreferrer"
              >
                View TX
              </a>

            </div>
          `;
        }
      )
      .join("");
}

// ======================================================
// USER BURN HISTORY
// ======================================================

function getConnectedWalletAddress() {

  const state =
    client.wallet.getState();

  return state
    .connected
    ?.account
    ?.address
    ? String(
        state.connected
          .account
          .address
      )
    : null;
}

// ======================================================

function getUserBurnHistory() {

  const wallet =
    getConnectedWalletAddress();

  if (!wallet) {
    return [];
  }

  return burnRegistryRecords.filter(
    (record) =>
      record.wallet ===
      wallet
  );
}

// ======================================================

function renderWalletHistory() {

  let section =
    document.getElementById(
      "walletBurnHistory"
    );

  if (!section) {

    section =
      document.createElement(
        "section"
      );

    section.id =
      "walletBurnHistory";

    section.innerHTML = `
      <div
        class="wallet-burn-history-card"
        style="
          width:100%;
          max-width:1100px;
          margin:30px auto;
        "
      >

        <div>
          <p>
            BURNING WELL
          </p>

          <h2>
            Your Burn History
          </h2>

          <p>
            Your confirmed Burning Well transactions.
          </p>
        </div>

        <div class="burn-referral-box">
  <strong>Your Referral Link</strong>

  <div class="burn-referral-link">
    ${
  window.burningWellReferralCode
    ? `https://gentlewarrior.world/burning-well?ref=${encodeURIComponent(
  window.burningWellReferralCode
)}`
    : "Connect your wallet to get your referral link."
}
  </div>

  <button
  id="copyReferralBtn"
  type="button"
  class="burn-modal-action"
>
  Copy Referral Link
</button>
<div class="burn-referral-stats">
  <div>
    <strong>${referralStats.successfulReferrals}</strong>
    <span>Successful Referrals</span>
  </div>

  <div>
    <strong>$${referralStats.rewardsEarned.toFixed(2)}</strong>
    <span>Rewards Earned</span>
  </div>

  <div>
    <strong>$${referralStats.rewardsPaid.toFixed(2)}</strong>
    <span>Rewards Paid</span>
  </div>
</div>
<div class="burn-referral-list">
  <strong>Your Referrals</strong>

  ${
    referralStats.referrals.length
      ? referralStats.referrals
          .map(
            (item) => `
              <div class="burn-referral-item">
                <span>
                  ${shortenAddress(
                    item.referredUser
                  )}
                </span>

                <span>
                  $${Number(
                    item.rewardUsd || 0
                  ).toFixed(2)}
                </span>

                <span>
                  ${item.status || "unknown"}
                </span>
              </div>
            `
          )
          .join("")
      : `
          <div class="burn-referral-empty">
            No successful referrals yet.
          </div>
        `
  }
</div>
</div>
        <div
          id="walletBurnHistoryList"
        ></div>

      </div>
    `;

    const main =
      document.querySelector(
        "main"
      );

    if (main) {

      main.appendChild(
        section
      );

    } else {

      document.body.appendChild(
        section
      );
    }
  }
const referralLink =
  section.querySelector(
    ".burn-referral-link"
  );

if (referralLink) {
  referralLink.textContent =
    window.burningWellReferralCode
      ? `https://gentlewarrior.world/burning-well/?ref=${encodeURIComponent(
  window.burningWellReferralCode
)}`
      : "Connect your wallet to get your referral link.";
}
  const list =
    document.getElementById(
      "walletBurnHistoryList"
    );

  if (!list) {
    return;
  }

  const copyReferralBtn =
  document.getElementById("copyReferralBtn");

if (copyReferralBtn && ownReferralCode) {
  copyReferralBtn.addEventListener(
    "click",
    async () => {
      const referralLink =
  `https://gentlewarrior.world/burning-well/?ref=${encodeURIComponent(
    ownReferralCode
  )}`;

      await navigator.clipboard.writeText(
        referralLink
      );

      copyReferralBtn.textContent =
        "✓ Copied!";
    }
  );
}
  const wallet =
    getConnectedWalletAddress();

    console.log(
  "RENDER REFERRAL:",
  window.burningWellReferralCode
);

  if (!wallet) {

    list.innerHTML = `
      <div>
        Connect your wallet to view your burn history.
      </div>
    `;

    return;
  }

  const records =
    getUserBurnHistory();

  if (
    records.length ===
    0
  ) {

    list.innerHTML = `
      <div>
        No burns yet for this wallet.
      </div>
    `;

    return;
  }

  list.innerHTML =
    records
      .slice(
        0,
        20
      )
      .map(
        (record) => {

          const tokenLabel =
  record.tokenName
    ? record.tokenSymbol
      ? `${record.tokenName} (${record.tokenSymbol})`
      : record.tokenName
    : record.tokenSymbol ||
      shortenAddress(
        record.mint
      );

          const date =
            record.blockTime
              ? new Date(
                  record.blockTime *
                    1000
                ).toLocaleString()
              : "";

          return `
            <article
              class="wallet-burn-history-item"
              style="
                padding:16px 0;
              "
            >

              <strong>
                ${escapeHtml(
                  tokenLabel
                )}
              </strong>

              <div>
                ${escapeHtml(
                  formatBalance(
                    record.amount
                  )
                )}
              </div>

              <small>
                ${escapeHtml(
                  date
                )}
              </small>

              <div>
                ✓ Permanently Burned
              </div>

              <a
                href="https://solscan.io/tx/${encodeURIComponent(
                  record.signature
                )}"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction
              </a>

            </article>
          `;
        }
      )
      .join("");
}

// ======================================================
// BURN BUTTON
// ======================================================

burnBtn.addEventListener(
  "click",
  async () => {

    if (
      !selectedToken
    ) {
      return;
    }

    const state =
      client.wallet.getState();

    const connected =
      state.connected;

    if (
      !connected?.account?.address ||
      !connected?.signer
    ) {

      alert(
        "Please connect your wallet again before burning."
      );

      return;
    }

    // --------------------------------------------------
    // AMOUNT
    // --------------------------------------------------

    let baseUnits;

    try {

      baseUnits =
        decimalToBaseUnits(
          burnAmount.value,
          selectedToken.decimals
        );

    } catch (
      error
    ) {

      alert(
        error?.message ||
        "Invalid burn amount."
      );

      return;
    }

    if (
      baseUnits <= 0n
    ) {

      alert(
        "Enter an amount greater than 0."
      );

      return;
    }

    const walletBalance =
      BigInt(
        selectedToken.amount
      );

    if (
      baseUnits >
      walletBalance
    ) {

      alert(
        "You cannot burn more than your wallet balance."
      );

      return;
    }

    // --------------------------------------------------
    // SERVICE FEE
    // --------------------------------------------------

    let feeInfo;

    try {

      feeInfo =
        await getServiceFeeLamports(
          activeReferralCode
        );

    } catch (
      error
    ) {

      console.error(
        "SERVICE FEE ERROR:",
        error
      );

      alert(
        "Unable to calculate the $1.50 SOL service fee.\n\n" +
        (
          error?.message ||
          "Please try again."
        )
      );

      return;
    }

    const {
      quoteId,
      solUsdPrice,
      feeSol,
      feeLamports,
      serviceFeeLamports,
      referralRewardLamports,
      referralCode,
      referrerWallet,
    } = feeInfo;

    // --------------------------------------------------
    // TOKEN LABEL
    // --------------------------------------------------

    const tokenLabel =
      selectedToken.name ||
      selectedToken.symbol ||
      shortenAddress(
        selectedToken.mint
      );

    // --------------------------------------------------
    // CONFIRM
    // --------------------------------------------------

    const confirmed =
  await showBurnConfirmation(
    burnAmount.value,
    tokenLabel
  );

if (!confirmed) {
  return;
}

    // --------------------------------------------------
    // OPEN BURNING WELL
    // --------------------------------------------------

    openBurningModal(
      burnAmount.value,
      tokenLabel
    );

    setBurningStatus(
      "Please approve the transaction in your wallet."
    );

    const originalText =
      burnBtn.textContent;

    burnBtn.disabled =
      true;

    tokenSelect.disabled =
      true;

    burnAmount.disabled =
      true;

    maxBtn.disabled =
      true;

    try {

      console.log(
        "================================="
      );

      console.log(
        "BURNING WELL TRANSACTION"
      );

      console.log(
        "================================="
      );

      console.log({
        mint:
          selectedToken.mint,

        tokenAccount:
          selectedToken.tokenAccount,

        amount:
          baseUnits.toString(),

        decimals:
          selectedToken.decimals,

        programId:
          selectedToken.programId,

        name:
          selectedToken.name,

        symbol:
          selectedToken.symbol,

        serviceFeeUsd:
          SERVICE_FEE_USD,

        solUsdPrice,

        feeSol,

        feeLamports:
          feeLamports.toString(),
      });

      setBurningStatus(
        "Building your burn transaction..."
      );

      // ------------------------------------------------
      // AUTHORITY
      // ------------------------------------------------

      const authority =
        connected.signer;

      // ------------------------------------------------
      // BURN INSTRUCTION
      // ------------------------------------------------

      let burnInstruction;

      if (
        selectedToken.programId ===
        TOKEN_PROGRAM_ID
      ) {

        burnInstruction =
          getSplBurnCheckedInstruction({
            account:
              address(
                selectedToken.tokenAccount
              ),

            mint:
              address(
                selectedToken.mint
              ),

            authority,

            amount:
              baseUnits,

            decimals:
              selectedToken.decimals,
          });

      } else if (
        selectedToken.programId ===
        TOKEN_2022_PROGRAM_ID
      ) {

        burnInstruction =
          getToken2022BurnCheckedInstruction({
            account:
              address(
                selectedToken.tokenAccount
              ),

            mint:
              address(
                selectedToken.mint
              ),

            authority,

            amount:
              baseUnits,

            decimals:
              selectedToken.decimals,
          });

      } else {

        throw new Error(
          "Unsupported Solana token program."
        );
      }

      // ------------------------------------------------
      // SERVICE FEE INSTRUCTION
      // ------------------------------------------------

      const feeInstructions = [
        getTransferSolInstruction({
          source: authority,
          destination: address(FEE_WALLET),
          amount: lamports(serviceFeeLamports),
        }),
      ];

      if (referrerWallet && referralRewardLamports > 0n) {
        feeInstructions.push(
          getTransferSolInstruction({
            source: authority,
            destination: address(referrerWallet),
            amount: lamports(referralRewardLamports),
          })
        );
      }

      // ------------------------------------------------
      // WAIT FOR APPROVAL
      // ------------------------------------------------

      setBurningStatus(
        "Waiting for your wallet approval..."
      );

      // ------------------------------------------------
      // ATOMIC TRANSACTION
      // ------------------------------------------------
      //
      // Both instructions are sent together:
      //
      // 1. Burn token
      // 2. Pay service fee
      //
      // If the transaction fails,
      // neither should be completed.
      // ------------------------------------------------

      const {
  createTransactionMessage,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  signTransactionMessageWithSigners,
  getBase64EncodedWireTransaction,
} = await import("@solana/kit");

const latestBlockhashResponse =
  await rpcRequest(
    "getLatestBlockhash",
    [
      {
        commitment: "confirmed",
      },
    ]
  );

const latestBlockhash =
  latestBlockhashResponse.value;

const transactionMessage =
  appendTransactionMessageInstructions(
    [
      burnInstruction,
      ...feeInstructions,
    ],
    setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      setTransactionMessageFeePayerSigner(
        authority,
        createTransactionMessage({
          version: 0,
        })
      )
    )
  );

const signedTransaction =
  await signTransactionMessageWithSigners(
    transactionMessage
  );

const encodedTransaction =
  getBase64EncodedWireTransaction(
    signedTransaction
  );

const signature =
  await rpcRequest(
    "sendTransaction",
    [
      encodedTransaction,
      {
        encoding: "base64",
        preflightCommitment: "confirmed",
      },
    ]
  );

if (!signature) {
  throw new Error(
    "Transaction was submitted but no signature was returned."
  );
}

console.log(
  "BURN + FEE TRANSACTION:",
  signature
);

      // ------------------------------------------------
      // WAIT FOR CONFIRMATION
      // ------------------------------------------------

      setBurningStatus(
        "Transaction submitted. Waiting for Solana confirmation..."
      );

      // Give Solana RPC a moment to expose
      // the confirmed transaction.
      await waitForTransaction(signature);

      // ------------------------------------------------
      // REGISTER VERIFIED BURN IN BACKEND
      // ------------------------------------------------

      setBurningStatus(
        "Verifying and recording your burn..."
      );

      await registerBurnWithBackend({
        signature,
        wallet: String(connected.account.address),
        token: selectedToken,
        amount: burnAmount.value,
        baseUnits,
        quoteId,
        referralCode,
      });

      // ------------------------------------------------
      // REFRESH GLOBAL + USER HISTORY
      // ------------------------------------------------

      await loadBurnRegistry();
      await loadGlobalStats();

      // ------------------------------------------------
      // SHOW COMPLETE
      // ------------------------------------------------

      showBurnComplete(
        burnAmount.value,
        tokenLabel,
        signature
      );

      // ------------------------------------------------
      // RESET TOKEN SELECTION
      // ------------------------------------------------

      selectedToken =
        null;

      burnAmount.value =
        "";

      burnAmount.disabled =
        true;

      maxBtn.disabled =
        true;

      burnBtn.disabled =
        true;

      tokenSelect.value =
        "";

      // ------------------------------------------------
      // REFRESH BALANCES
      // ------------------------------------------------

      await loadWalletTokens();

      // Refresh registry again after
      // the transaction has propagated.
      setTimeout(
        () => {
          loadBurnRegistry();
        },
        5000
      );

    } catch (
      error
    ) {

      console.error(
        "BURN + FEE TRANSACTION FAILED:",
        error
      );

      const modal =
        activeBurnModal ||
        document.getElementById(
          "burnModal"
        );

      if (modal) {

        modal.classList.remove(
          "is-open"
        );

        setTimeout(
          () => {

            if (
              modal.parentNode
            ) {
              modal.remove();
            }

          },
          250
        );

        activeBurnModal =
          null;
      }

      alert(
        "Burn transaction failed.\n\n" +
        (
          error?.message ||
          "Unknown error."
        )
      );

      updateBurnButton();

    } finally {

      burnBtn.textContent =
        originalText ||
        "🔥 Burn Tokens";

      tokenSelect.disabled =
        walletTokens.length ===
        0;

      if (
        selectedToken &&
        burnAmount.value
      ) {

        updateBurnButton();

      } else {

        burnBtn.disabled =
          true;
      }
    }
  }
);

// ======================================================
// INITIALIZATION
// ======================================================

renderWalletHistory();

resetTokenUI();

updateWalletUI();

console.log(
  "================================="
);

console.log(
  "Burning Well initialized."
);

console.log(
  "Service Fee:",
  `$${SERVICE_FEE_USD.toFixed(2)} USD-equivalent`
);

console.log(
  "Fee Wallet:",
  FEE_WALLET
);

console.log(
  "Registry:",
  "Enabled"
);

console.log(
  "Supported:",
  "SPL Token + Token-2022"
);

console.log(
  "================================="
);

// ======================================================
// INITIAL REGISTRY LOAD
// ======================================================

loadBurnRegistry();
loadGlobalStats();

// ======================================================
// PERIODIC REGISTRY REFRESH
// ======================================================

setInterval(
  () => {

    loadBurnRegistry();

  },
  60 * 1000
);

// ======================================================
// REFRESH WHEN PAGE BECOMES VISIBLE
// ======================================================

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState ===
      "visible"
    ) {

      loadBurnRegistry();
    }
  }
);

// ======================================================
// REFRESH WHEN WINDOW FOCUSES
// ======================================================

window.addEventListener(
  "focus",
  () => {

    loadBurnRegistry();

  }
);