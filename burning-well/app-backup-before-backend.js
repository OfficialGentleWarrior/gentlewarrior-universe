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

// KEEP YOUR EXISTING ANKR PREMIUM ENDPOINT HERE.
// Do not remove the API key.
const RPC_ENDPOINTS = [
  "https://rpc.ankr.com/solana/341ce5c3d01d10dbb8c11c82232e72da735817378f165ce312bc806551f6fc5e",
];

const ANKR_RPC_URL =
  "https://rpc.ankr.com/solana/341ce5c3d01d10dbb8c11c82232e72da735817378f165ce312bc806551f6fc5e";

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

// Jupiter Token API
const JUPITER_TOKEN_SEARCH_URL =
  "https://lite-api.jup.ag/tokens/v2/search";

// ======================================================
// SOLANA WALLET CLIENT
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
    })
  );

// ======================================================
// ELEMENTS
// ======================================================

const connectWalletBtn =
  document.getElementById("connectWalletBtn");

const walletStatus =
  document.getElementById("walletStatus");

const tokenSelect =
  document.getElementById("tokenSelect");

const burnAmount =
  document.getElementById("burnAmount");

const maxBtn =
  document.getElementById("maxBtn");

const burnBtn =
  document.getElementById("burnBtn");

// ======================================================
// STATE
// ======================================================

let walletTokens = [];
let selectedToken = null;

// Metadata cache prevents repeated API requests.
const tokenMetadataCache = new Map();

// ======================================================
// HELPERS
// ======================================================

function shortenAddress(address) {
  if (!address) return "";

  const value = String(address);

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}


function formatBalance(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 9,
  });
}


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ======================================================
// RPC REQUEST
// ======================================================

async function rpcRequest(method, params) {
  let lastError = null;

  for (const endpoint of RPC_ENDPOINTS) {
    try {
      console.log(
        "Trying Solana RPC:",
        endpoint
      );

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} from ${endpoint}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(
          data.error.message ||
          `Solana RPC error: ${data.error.code}`
        );
      }

      return data.result;

    } catch (error) {
      console.warn(
        `RPC failed: ${endpoint}`,
        error
      );

      lastError = error;
    }
  }

  throw lastError ||
    new Error(
      "All Solana RPC endpoints failed."
    );
}


// ======================================================
// GET TOKEN ACCOUNTS
// ======================================================

async function getTokenAccounts(
  owner,
  programId
) {
  console.log(
    "Querying token program:",
    programId
  );

  const result = await rpcRequest(
    "getTokenAccountsByOwner",
    [
      owner,

      {
        programId,
      },

      {
        commitment: "confirmed",
        encoding: "jsonParsed",
      },
    ]
  );

  if (!result?.value) {
    return [];
  }

  return result.value
    .map((account) => {
      try {
        const parsed =
          account.account.data.parsed;

        const info =
          parsed.info;

        const tokenAmount =
          info.tokenAmount;

        return {
          tokenAccount:
            String(account.pubkey),

          mint:
            String(info.mint),

          owner:
            String(info.owner),

          amount:
            String(tokenAmount.amount),

          decimals:
            Number(tokenAmount.decimals),

          uiAmount:
            Number(
              tokenAmount.uiAmount || 0
            ),

          uiAmountString:
            tokenAmount.uiAmountString,

          programId,

          // Metadata will be added later.
          name: null,
          symbol: null,
          logoURI: null,
        };

      } catch (error) {
        console.warn(
          "Skipping malformed token account:",
          error
        );

        return null;
      }
    })
    .filter(
      (token) =>
        token &&
        token.uiAmount > 0
    );
}


// ======================================================
// TOKEN METADATA LOOKUP
// ======================================================

async function getTokenMetadata(mint) {
  if (!mint) {
    return null;
  }

  // Return cached result.
  if (tokenMetadataCache.has(mint)) {
    return tokenMetadataCache.get(mint);
  }

  try {
    const url =
      `${JUPITER_TOKEN_SEARCH_URL}?query=${encodeURIComponent(
        mint
      )}`;

    const response =
      await fetch(url);

    if (!response.ok) {
      console.warn(
        `Token metadata lookup failed for ${mint}: HTTP ${response.status}`
      );

      tokenMetadataCache.set(
        mint,
        null
      );

      return null;
    }

    const data =
      await response.json();

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      tokenMetadataCache.set(
        mint,
        null
      );

      return null;
    }

    // Prefer the exact mint match.
    const token =
      data.find(
        (item) =>
          item?.id === mint
      ) || data[0];

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

  } catch (error) {
    console.warn(
      "Token metadata lookup failed:",
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
// ENRICH TOKEN METADATA
// ======================================================

async function enrichTokenMetadata(
  tokens
) {
  if (!Array.isArray(tokens)) {
    return [];
  }

  const enriched =
    await Promise.all(
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

  return enriched;
}


// ======================================================
// RESET TOKEN UI
// ======================================================

function resetTokenUI() {
  walletTokens = [];
  selectedToken = null;

  tokenSelect.innerHTML = `
    <option value="">
      Connect wallet first
    </option>
  `;

  tokenSelect.disabled = true;

  burnAmount.value = "";
  burnAmount.disabled = true;

  maxBtn.disabled = true;
  burnBtn.disabled = true;
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
}


// ======================================================
// LOAD WALLET TOKENS
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

  console.log(
    "================================="
  );

  console.log(
    "Loading tokens for wallet:",
    owner
  );

  console.log(
    "================================="
  );

  tokenSelect.disabled = true;

  burnAmount.disabled = true;
  maxBtn.disabled = true;
  burnBtn.disabled = true;

  tokenSelect.innerHTML = `
    <option value="">
      Loading tokens...
    </option>
  `;

  try {
    // --------------------------------------------
    // SPL TOKEN
    // --------------------------------------------

    const splTokens =
      await getTokenAccounts(
        owner,
        TOKEN_PROGRAM_ID
      );

    console.log(
      "SPL tokens:",
      splTokens
    );


    // --------------------------------------------
    // TOKEN-2022
    // --------------------------------------------

    const token2022Tokens =
      await getTokenAccounts(
        owner,
        TOKEN_2022_PROGRAM_ID
      );

    console.log(
      "Token-2022 tokens:",
      token2022Tokens
    );


    // --------------------------------------------
    // COMBINE
    // --------------------------------------------

    const allTokens = [
      ...splTokens,
      ...token2022Tokens,
    ];

    console.log(
      "ALL WALLET TOKENS BEFORE METADATA:",
      allTokens
    );


    // --------------------------------------------
    // TOKEN METADATA
    // --------------------------------------------

    tokenSelect.innerHTML = `
      <option value="">
        Loading token names...
      </option>
    `;

    walletTokens =
      await enrichTokenMetadata(
        allTokens
      );

    console.log(
      "ALL WALLET TOKENS WITH METADATA:",
      walletTokens
    );


    // --------------------------------------------
    // RENDER
    // --------------------------------------------

    renderTokenSelect();

  } catch (error) {
    console.error(
      "TOKEN RPC ERROR:",
      error
    );

    tokenSelect.innerHTML = `
      <option value="">
        Failed to load tokens
      </option>
    `;

    tokenSelect.disabled = true;

    alert(
      "Unable to load your Solana tokens.\n\n" +
      "RPC error: " +
      (error?.message ||
        "Unknown error")
    );
  }
}


// ======================================================
// RENDER TOKEN SELECT
// ======================================================

function renderTokenSelect() {
  tokenSelect.innerHTML = "";

  if (
    walletTokens.length === 0
  ) {
    tokenSelect.innerHTML = `
      <option value="">
        No tokens found
      </option>
    `;

    tokenSelect.disabled = true;

    return;
  }

  const defaultOption =
    document.createElement(
      "option"
    );

  defaultOption.value = "";

  defaultOption.textContent =
    "Select a token";

  tokenSelect.appendChild(
    defaultOption
  );


  walletTokens.forEach(
    (token, index) => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        String(index);


      const name =
        token.name || "";

      const symbol =
        token.symbol || "";


      let label;


      if (
        name &&
        symbol
      ) {
        label =
          `${name} (${symbol}) — ${formatBalance(
            token.uiAmount
          )}`;

      } else if (symbol) {
        label =
          `${symbol} — ${formatBalance(
            token.uiAmount
          )}`;

      } else if (name) {
        label =
          `${name} — ${formatBalance(
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


      // Store metadata for future UI use.
      if (token.name) {
        option.dataset.name =
          token.name;
      }

      if (token.symbol) {
        option.dataset.symbol =
          token.symbol;
      }

      if (token.logoURI) {
        option.dataset.logo =
          token.logoURI;
      }


      tokenSelect.appendChild(
        option
      );
    }
  );


  tokenSelect.disabled = false;
}


// ======================================================
// TOKEN SELECTION
// ======================================================

tokenSelect.addEventListener(
  "change",
  () => {
    const value =
      tokenSelect.value;

    if (value === "") {
      selectedToken = null;

      burnAmount.value = "";
      burnAmount.disabled = true;

      maxBtn.disabled = true;
      burnBtn.disabled = true;

      return;
    }


    const index =
      Number(value);

    const token =
      walletTokens[index];


    if (!token) {
      selectedToken = null;

      burnAmount.disabled = true;
      maxBtn.disabled = true;
      burnBtn.disabled = true;

      return;
    }


    selectedToken =
      token;


    console.log(
      "SELECTED TOKEN:",
      selectedToken
    );


    burnAmount.disabled =
      false;

    maxBtn.disabled =
      false;

    burnBtn.disabled =
      true;

    burnAmount.value = "";
  }
);


// ======================================================
// MAX BUTTON
// ======================================================

maxBtn.addEventListener(
  "click",
  () => {
    if (!selectedToken) {
      return;
    }

    burnAmount.value =
      selectedToken.uiAmountString ||
      selectedToken.uiAmount;

    updateBurnButton();
  }
);


// ======================================================
// AMOUNT INPUT
// ======================================================

burnAmount.addEventListener(
  "input",
  updateBurnButton
);


// ======================================================
// BURN BUTTON STATE
// ======================================================

function updateBurnButton() {
  if (!selectedToken) {
    burnBtn.disabled = true;
    return;
  }

  const amount =
    Number(
      burnAmount.value
    );


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    burnBtn.disabled = true;
    return;
  }


  if (
    amount >
    selectedToken.uiAmount
  ) {
    burnBtn.disabled = true;
    return;
  }


  burnBtn.disabled = false;
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


  setTimeout(() => {
    modal.remove();
  }, 180);
}


// ======================================================
// RENDER WALLETS
// ======================================================

function renderWallets(wallets) {
  const modal =
    createWalletModal();

  const walletList =
    document.getElementById(
      "walletList"
    );


  if (!wallets.length) {
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


    requestAnimationFrame(() => {
      modal.classList.add(
        "is-open"
      );
    });


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


            updateWalletUI();

            closeWalletModal();


            // Load tokens AFTER wallet connection.
            await loadWalletTokens();

          } catch (error) {
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


  requestAnimationFrame(() => {
    modal.classList.add(
      "is-open"
    );
  });
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


      // --------------------------------------------
      // DISCONNECT
      // --------------------------------------------

      if (state.connected) {
        await client.wallet.disconnect();

        resetTokenUI();

        updateWalletUI();

        return;
      }


      // --------------------------------------------
      // DETECT WALLETS
      // --------------------------------------------

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

    } catch (error) {
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

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Unable to get SOL price. HTTP ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "Unable to get current SOL price."
    );
  }

  const solToken =
    data.find(
      (token) =>
        token?.id === SOL_MINT
    ) || data[0];

  const price =
    Number(solToken?.usdPrice);

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    throw new Error(
      "Invalid SOL/USD price."
    );
  }

  return price;
}


// ======================================================
// CALCULATE SERVICE FEE
// ======================================================

async function getServiceFeeLamports() {
  const solUsdPrice =
    await getSolUsdPrice();

  const feeSol =
    SERVICE_FEE_USD /
    solUsdPrice;

  const feeLamports =
    BigInt(
      Math.ceil(
        feeSol *
        Number(LAMPORTS_PER_SOL)
      )
    );

  if (feeLamports <= 0n) {
    throw new Error(
      "Invalid service fee amount."
    );
  }

  return {
    solUsdPrice,
    feeSol,
    feeLamports,
  };
}
// ======================================================
// BURN EXPERIENCE
// ======================================================

let activeBurnModal = null;

function createBurnModal() {
  const existing =
    document.getElementById("burnModal");

  if (existing) {
    existing.remove();
  }

  const modal =
    document.createElement("div");

  modal.id = "burnModal";
  modal.className = "burn-modal";

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

  document.body.appendChild(modal);

  return modal;
}


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
    `${formatBalance(amount)} ${tokenLabel}`;

  statusEl.textContent =
    "Preparing your burn transaction...";

  modal.classList.add(
    "is-open"
  );

  activeBurnModal = modal;

  video.currentTime = 0;

  video.play().catch(() => {});

  return modal;
}


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
      formatBalance(amount)
    );

  const safeToken =
    escapeHtml(
      tokenLabel
    );

  const safeSignature =
    escapeHtml(
      signature || ""
    );

  const txUrl =
    signature
      ? `https://solscan.io/tx/${encodeURIComponent(
          signature
        )}`
      : "";

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


  // ====================================================
  // SHARE TO X
  // ====================================================

  const shareText =
    `🔥 I just permanently burned ${formatBalance(
      amount
    )} ${tokenLabel} using Burning Well by Gentle Warrior.\n\n` +
    `Burn Tokens. Fund Hope. Strengthen GWAR. 💚`;

  const shareUrl =
    txUrl ||
    window.location.href;

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
            shareUrl
          )}`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      }
    );


  // ====================================================
  // NATIVE SHARE
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
                shareUrl,
            });

          } else {

            await navigator.clipboard.writeText(
              `${shareText}\n\n${shareUrl}`
            );

            alert(
              "Share text copied to clipboard."
            );

          }

        } catch (error) {

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
  // COPY TRANSACTION
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

        } catch (error) {

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
// BURN BUTTON
// ======================================================

burnBtn.addEventListener(
  "click",
  async () => {

    if (!selectedToken) {
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


    // ==================================================
    // TOKEN AMOUNT
    // ==================================================

    let baseUnits;

    try {

      baseUnits =
        decimalToBaseUnits(
          burnAmount.value,
          selectedToken.decimals
        );

    } catch (error) {

      alert(
        error?.message ||
        "Invalid burn amount."
      );

      return;
    }


    if (baseUnits <= 0n) {

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


    // ==================================================
    // GET CURRENT $1.50 USD-EQUIVALENT SOL FEE
    // ==================================================

    let feeInfo;

    try {

      feeInfo =
        await getServiceFeeLamports();

    } catch (error) {

      console.error(
        "SERVICE FEE PRICE ERROR:",
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
      solUsdPrice,
      feeSol,
      feeLamports,
    } = feeInfo;


    // ==================================================
    // TOKEN LABEL
    // ==================================================

    const tokenLabel =
      selectedToken.name ||
      selectedToken.symbol ||
      shortenAddress(
        selectedToken.mint
      );


    // ==================================================
    // OPEN BURN EXPERIENCE
    // ==================================================

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


      // ==================================================
      // WALLET SIGNER
      // ==================================================

      const authority =
        connected.signer;


      // ==================================================
      // BUILD BURN INSTRUCTION
      // ==================================================

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


      // ==================================================
      // BUILD SOL SERVICE-FEE INSTRUCTION
      // ==================================================

      const feeInstruction =
        getTransferSolInstruction({
          source:
            authority,

          destination:
            address(
              FEE_WALLET
            ),

          amount:
            lamports(
              feeLamports
            ),
        });


      // ==================================================
      // UPDATE UI
      // ==================================================

      setBurningStatus(
        "Waiting for your wallet approval..."
      );


      // ==================================================
      // ONE ATOMIC TRANSACTION
      // ==================================================

      const result =
        await client.sendTransaction([
          burnInstruction,
          feeInstruction,
        ]);


      const signature =
        result?.context?.signature;


      console.log(
        "BURN + FEE TRANSACTION:",
        signature
      );


      setBurningStatus(
        "Transaction submitted. Waiting for Solana confirmation..."
      );


      // ==================================================
      // SUCCESS
      // ==================================================

      showBurnComplete(
        burnAmount.value,
        tokenLabel,
        signature
      );


      // ==================================================
      // RESET
      // ==================================================

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


      // Refresh wallet balances
      await loadWalletTokens();


    } catch (error) {

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
            modal.remove();
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