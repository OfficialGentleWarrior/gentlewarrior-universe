import {
  address,
  createClient,
  getBase64EncodedWireTransaction,
  lamports,
} from "@solana/kit";

import {
  solanaRpc,
} from "@solana/kit-plugin-rpc";

import {
  walletSigner,
} from "@solana/kit-plugin-wallet";

import {
  getTransferSolInstruction,
} from "@solana-program/system";


/* =========================================================
   CONFIG
   ========================================================= */

const API_BASE_URL =
  "https://burningwellapi-slmbcnmgwa-as.a.run.app";

const ANKR_RPC_URL =
  `${API_BASE_URL}/api/rpc`;

const RPC_ENDPOINTS = [
  ANKR_RPC_URL,
];


/* =========================================================
   WALLET CLIENT
   ========================================================= */

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


/* =========================================================
   ELEMENTS
   ========================================================= */

const connectWalletBtn =
  document.getElementById(
    "connectWalletBtn"
  );

const connectedWallet =
  document.getElementById(
    "connectedWallet"
  );

const connectedWalletAddress =
  document.getElementById(
    "connectedWalletAddress"
  );

const connectStep =
  document.getElementById(
    "connectStep"
  );

const setupStep =
  document.getElementById(
    "setupStep"
  );

const backToConnectBtn =
  document.getElementById(
    "backToConnectBtn"
  );

  const eventSetupForm =
  document.getElementById(
    "eventSetupForm"
  );

const previewStep =
  document.getElementById(
    "previewStep"
  );

const eventPreview =
  document.getElementById(
    "eventPreview"
  );

const backToSetupBtn =
  document.getElementById(
    "backToSetupBtn"
  );

const continueToPaymentBtn =
  document.getElementById(
    "continueToPaymentBtn"
  );

const paymentStep =
  document.getElementById(
    "paymentStep"
  );

const paymentQuote =
  document.getElementById(
    "paymentQuote"
  );

const payAndCreateBtn =
  document.getElementById(
    "payAndCreateBtn"
  );

const backToPreviewBtn =
  document.getElementById(
    "backToPreviewBtn"
  );

const successStep =
  document.getElementById(
    "successStep"
  );

const createdEventDetails =
  document.getElementById(
    "createdEventDetails"
  );

/* =========================================================
   STATE
   ========================================================= */

let eventOwnerWallet = "";
let currentEventDraft = null;
let currentFeeQuote = null;
let pendingPaymentSignature = "";
let currentFeeQuoteExpiresAt = 0;


/* =========================================================
   HELPERS
   ========================================================= */
async function rpcRequest(
  method,
  params
) {
  let lastError = null;

  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const response = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
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

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      if (data.error) {
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

      lastError = error;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shortenAddress(address) {
  if (!address) {
    return "";
  }

  return (
    address.slice(0, 5) +
    "..." +
    address.slice(-5)
  );
}


function updateProgress(step) {
  const steps =
    document.querySelectorAll(
      ".progress-step"
    );

  steps.forEach((item) => {
    const itemStep =
      Number(item.dataset.step);

    item.classList.toggle(
      "is-active",
      itemStep === step
    );

    item.classList.toggle(
      "is-complete",
      itemStep < step
    );
  });
}


/* =========================================================
   WALLET MODAL
   ========================================================= */

function showWalletPicker(wallets) {
  const overlay =
    document.createElement("div");

  overlay.className =
    "wallet-picker-overlay";

  const modal =
    document.createElement("div");

  modal.className =
    "wallet-picker-modal";

  const title =
    document.createElement("h3");

  title.textContent =
    "Select Wallet";

  modal.appendChild(title);


  if (!wallets.length) {
    const empty =
      document.createElement("p");

    empty.className =
      "wallet-picker-empty";

    empty.textContent =
      "No compatible Solana wallet detected. Install Phantom, Backpack, Solflare, or another compatible wallet.";

    modal.appendChild(empty);
  }


  wallets.forEach((wallet) => {
    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "wallet-picker-option";

    if (wallet.icon) {
      const image =
        document.createElement("img");

      image.src = wallet.icon;
      image.alt = "";

      button.appendChild(image);
    }

    const name =
      document.createElement("span");

    name.textContent =
      wallet.name;

    button.appendChild(name);


    button.addEventListener(
      "click",
      async () => {
        button.disabled = true;

        try {
          await client.wallet.connect(
            wallet
          );

          const state =
            client.wallet.getState();

          const address =
            String(
              state.connected
                ?.account
                ?.address || ""
            );

          if (!address) {
            throw new Error(
              "Wallet address was not returned."
            );
          }

          eventOwnerWallet = address;

          connectedWalletAddress.textContent =
            shortenAddress(address);

          connectedWalletAddress.title =
            address;

          connectedWallet.hidden = false;

          connectWalletBtn.textContent =
            "Wallet Connected";

          connectWalletBtn.disabled =
            true;

          connectStep.hidden = true;
          setupStep.hidden = false;

          updateProgress(2);

          overlay.remove();

          setupStep.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

        } catch (error) {
          console.error(
            "Wallet connection failed:",
            error
          );

          alert(
            error?.message ||
            "Wallet connection failed."
          );

          button.disabled = false;
        }
      }
    );

    modal.appendChild(button);
  });


  const cancelButton =
    document.createElement("button");

  cancelButton.type = "button";

  cancelButton.className =
    "wallet-picker-cancel";

  cancelButton.textContent =
    "Cancel";

  cancelButton.addEventListener(
    "click",
    () => {
      overlay.remove();
    }
  );

  modal.appendChild(cancelButton);

  overlay.appendChild(modal);

  document.body.appendChild(overlay);
}


/* =========================================================
   CONNECT WALLET
   ========================================================= */

connectWalletBtn.addEventListener(
  "click",
  async () => {
    try {
      const state =
        client.wallet.getState();

      if (state.connected) {
        const address =
          String(
            state.connected
              ?.account
              ?.address || ""
          );

        if (address) {
          eventOwnerWallet =
            address;

          connectedWalletAddress.textContent =
            shortenAddress(address);

          connectedWalletAddress.title =
            address;

          connectedWallet.hidden =
            false;

          connectStep.hidden = true;
          setupStep.hidden = false;

          updateProgress(2);

          return;
        }
      }

      const wallets =
        state.wallets || [];

      showWalletPicker(wallets);

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
/* =========================================================
   EVENT SETUP → PREVIEW
   ========================================================= */

eventSetupForm.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    if (!eventSetupForm.reportValidity()) {
      return;
    }

    const name =
      document.getElementById("eventName").value.trim();

    const tokenMint =
      document.getElementById("tokenMint").value.trim();

    const tokenSymbol =
      document.getElementById("tokenSymbol").value
        .trim()
        .toUpperCase();

    const minimumBurn =
      Number(
        document.getElementById("minimumBurn").value
      );

    const pointsPerTxn =
      Number(
        document.getElementById("pointsPerTxn").value
      );

    const dailyCap =
      Number(
        document.getElementById("dailyCap").value
      );

    const winnersCount =
      Number(
        document.getElementById("winnersCount").value
      );

    const startAtValue =
      document.getElementById("startAt").value;

    const selectedPlan =
      document.querySelector(
        'input[name="eventPlan"]:checked'
      );

    if (!selectedPlan) {
      alert("Please select an event plan.");
      return;
    }

    const durationDays =
      Number(selectedPlan.value);

    if (
      durationDays !== 7 &&
      durationDays !== 30
    ) {
      alert("Invalid event duration.");
      return;
    }

    const startAt =
      new Date(startAtValue);

    if (
      Number.isNaN(startAt.getTime())
    ) {
      alert("Please enter a valid event start date.");
      return;
    }

    const endAt =
      new Date(
        startAt.getTime() +
        durationDays * 24 * 60 * 60 * 1000
      );

    const eventFeeUsd =
      durationDays === 7
        ? 5
        : 15;

        currentEventDraft = {
  name,
  tokenMint,
  tokenSymbol,
  minimumBurn,
  pointsPerTxn,
  dailyCap,
  winnersCount,
  startAt: startAt.toISOString(),
  endAt: endAt.toISOString(),
  durationDays,
  eventFeeUsd,
  ownerWallet: eventOwnerWallet,
};

    eventPreview.innerHTML = `
      <div class="preview-row">
        <span>Event Name</span>
        <strong>${escapeHtml(name)}</strong>
      </div>

      <div class="preview-row">
        <span>Token</span>
        <strong>${escapeHtml(tokenSymbol)}</strong>
      </div>

      <div class="preview-row">
        <span>Token Mint</span>
        <strong>${escapeHtml(tokenMint)}</strong>
      </div>

      <div class="preview-row">
        <span>Minimum Burn</span>
        <strong>${minimumBurn.toLocaleString()}</strong>
      </div>

      <div class="preview-row">
        <span>Points / Transaction</span>
        <strong>${pointsPerTxn}</strong>
      </div>

      <div class="preview-row">
        <span>Daily Transaction Cap</span>
        <strong>${dailyCap}</strong>
      </div>

      <div class="preview-row">
        <span>Winners</span>
        <strong>${winnersCount}</strong>
      </div>

      <div class="preview-row">
        <span>Start</span>
        <strong>${escapeHtml(
          startAt.toLocaleString()
        )}</strong>
      </div>

      <div class="preview-row">
        <span>End</span>
        <strong>${escapeHtml(
          endAt.toLocaleString()
        )}</strong>
      </div>

      <div class="preview-row">
        <span>Event Plan</span>
        <strong>
          ${durationDays} Days — $${eventFeeUsd}
        </strong>
      </div>

      <div class="preview-row">
        <span>Event Owner</span>
        <strong title="${escapeHtml(eventOwnerWallet)}">
          ${escapeHtml(
            shortenAddress(eventOwnerWallet)
          )}
        </strong>
      </div>
    `;

    setupStep.hidden = true;
    previewStep.hidden = false;

    updateProgress(3);

    previewStep.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
);


/* =========================================================
   PREVIEW → SETUP
   ========================================================= */

backToSetupBtn.addEventListener(
  "click",
  () => {
    previewStep.hidden = true;
    setupStep.hidden = false;

    updateProgress(2);

    setupStep.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
);
/* =========================================================
   PREVIEW → PAYMENT QUOTE
   ========================================================= */

continueToPaymentBtn.addEventListener(
  "click",
  async () => {
    if (!currentEventDraft) {
      alert(
        "Event details are missing. Please return to Setup."
      );
      return;
    }

    continueToPaymentBtn.disabled = true;
    continueToPaymentBtn.textContent =
      "Loading Quote...";

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/event-fee-quote?durationDays=${currentEventDraft.durationDays}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "Unable to get event fee quote."
        );
      }

      currentFeeQuote = data;

      currentFeeQuoteExpiresAt =
  Date.now() +
  Number(data.expiresInSeconds) * 1000;

      const solAmount =
        Number(data.totalLamports) /
        1_000_000_000;

      paymentQuote.innerHTML = `
        <div class="preview-row">
          <span>Event Plan</span>
          <strong>
            ${data.durationDays} Days
          </strong>
        </div>

        <div class="preview-row">
          <span>Event Fee</span>
          <strong>
            $${Number(data.eventFeeUsd).toFixed(2)}
          </strong>
        </div>

        <div class="preview-row">
          <span>SOL Price</span>
          <strong>
            $${Number(data.solPriceUsd).toFixed(2)}
          </strong>
        </div>

        <div class="preview-row">
          <span>Amount to Pay</span>
          <strong>
            ${solAmount.toFixed(6)} SOL
          </strong>
        </div>

        <div class="preview-row">
          <span>Quote Valid For</span>
          <strong>
            ${data.expiresInSeconds} seconds
          </strong>
        </div>
      `;

      previewStep.hidden = true;
      paymentStep.hidden = false;

      payAndCreateBtn.disabled = false;

      updateProgress(4);

      paymentStep.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    } catch (error) {
      console.error(
        "Event fee quote failed:",
        error
      );

      currentFeeQuote = null;
      currentFeeQuoteExpiresAt = 0;

      alert(
        error?.message ||
        "Unable to get event fee quote."
      );

    } finally {
      continueToPaymentBtn.disabled = false;
      continueToPaymentBtn.textContent =
        "Continue to Payment";
    }
  }
);
/* =========================================================
   PAYMENT → PREVIEW
   ========================================================= */

backToPreviewBtn.addEventListener(
  "click",
  () => {
    paymentStep.hidden = true;
    previewStep.hidden = false;

    currentFeeQuote = null;

    updateProgress(3);

    previewStep.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
);
/* =========================================================
   PAY & CREATE EVENT
   ========================================================= */

payAndCreateBtn.addEventListener(
  "click",
  async () => {
    if (!currentEventDraft) {
      alert(
        "Event details are missing. Please return to Setup."
      );
      return;
    }

    if (!currentFeeQuote) {
      alert(
        "Your payment quote is missing or expired. Please return to Preview and get a new quote."
      );
      return;
    }

    /*
 * Require enough quote lifetime to safely
 * sign, send, confirm, and verify payment.
 */
const quoteSafetyWindowMs =
  60 * 1000;

if (
  !pendingPaymentSignature &&
  (
    !currentFeeQuoteExpiresAt ||
    Date.now() >=
      currentFeeQuoteExpiresAt -
        quoteSafetyWindowMs
  )
) {
  currentFeeQuote = null;
  currentFeeQuoteExpiresAt = 0;

  alert(
    "Your payment quote is expired or too close to expiring. Please return to Preview and get a fresh quote."
  );

  return;
}

    payAndCreateBtn.disabled = true;
    backToPreviewBtn.disabled = true;

    const originalButtonText =
      payAndCreateBtn.textContent;

    try {
      const walletState =
        client.wallet.getState();

      const connected =
        walletState.connected;

      if (
        !connected ||
        !connected.signer
      ) {
        throw new Error(
          "Please connect your wallet again."
        );
      }

      const authority =
        connected.signer;

      const connectedAddress =
        String(
          connected.account?.address ||
          ""
        );

      if (
        connectedAddress !==
        eventOwnerWallet
      ) {
        throw new Error(
          "The connected wallet does not match the event owner."
        );
      }

      /* ---------------------------------------------
         SEND PAYMENT ONLY IF NOT ALREADY SENT
         --------------------------------------------- */

      if (!pendingPaymentSignature) {
        const paymentLamports =
          BigInt(
            String(
              currentFeeQuote.totalLamports
            )
          );

        if (paymentLamports <= 0n) {
          throw new Error(
            "Invalid payment amount."
          );
        }

        const feeWallet =
          String(
            currentFeeQuote.feeWallet ||
            ""
          );

        if (!feeWallet) {
          throw new Error(
            "Payment wallet is missing."
          );
        }

        const paymentInstruction =
          getTransferSolInstruction({
            source: authority,

            destination:
              address(feeWallet),

            amount:
              lamports(
                paymentLamports
              ),
          });

        const {
          createTransactionMessage,
          setTransactionMessageFeePayerSigner,
          setTransactionMessageLifetimeUsingBlockhash,
          appendTransactionMessageInstructions,
          signTransactionMessageWithSigners,
        } =
          await import(
            "@solana/kit"
          );

        const latestBlockhashResponse =
          await rpcRequest(
            "getLatestBlockhash",
            [
              {
                commitment:
                  "confirmed",
              },
            ]
          );

        const latestBlockhash =
          latestBlockhashResponse.value;

        const transactionMessage =
          appendTransactionMessageInstructions(
            [
              paymentInstruction,
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

        payAndCreateBtn.textContent =
          "Waiting for Wallet...";

        const signedTransaction =
          await signTransactionMessageWithSigners(
            transactionMessage
          );

        const wireTransaction =
          getBase64EncodedWireTransaction(
            signedTransaction
          );

        payAndCreateBtn.textContent =
          "Sending Payment...";

        const signature =
          await rpcRequest(
            "sendTransaction",
            [
              wireTransaction,
              {
                encoding: "base64",
                skipPreflight: false,
                preflightCommitment:
                  "confirmed",
              },
            ]
          );

        if (!signature) {
          throw new Error(
            "Solana did not return a payment signature."
          );
        }

        /*
         * IMPORTANT:
         * From this point forward,
         * never automatically send another payment.
         */
        pendingPaymentSignature =
          String(signature);
      }

      /* ---------------------------------------------
         WAIT FOR ON-CHAIN CONFIRMATION
         --------------------------------------------- */

      payAndCreateBtn.textContent =
        "Confirming Payment...";

      await waitForTransaction(
        pendingPaymentSignature
      );

      /* ---------------------------------------------
         BACKEND VERIFICATION + EVENT CREATION
         --------------------------------------------- */

      payAndCreateBtn.textContent =
        "Creating Event...";

      const response =
        await fetch(
          `${API_BASE_URL}/api/public/burn-events`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              creatorWallet:
                eventOwnerWallet,

              signature:
                pendingPaymentSignature,

              quoteId:
                currentFeeQuote.quoteId,

              name:
                currentEventDraft.name,

              tokenMint:
                currentEventDraft.tokenMint,

              tokenSymbol:
                currentEventDraft.tokenSymbol,

              minimumBurn:
                currentEventDraft.minimumBurn,

              pointsPerTxn:
                currentEventDraft.pointsPerTxn,

              dailyCap:
                currentEventDraft.dailyCap,

              winnersCount:
                currentEventDraft.winnersCount,

              startAt:
                currentEventDraft.startAt,

              endAt:
                currentEventDraft.endAt,

              status: "Live",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "Payment was sent, but event creation could not be verified."
        );
      }

      if (
        !data.ok ||
        !data.eventId
      ) {
        throw new Error(
          "The server did not return the created event."
        );
      }

      /* ---------------------------------------------
         SUCCESS
         --------------------------------------------- */

      createdEventDetails.innerHTML = `
        <div class="preview-row">
          <span>Event</span>
          <strong>
            ${escapeHtml(
              currentEventDraft.name
            )}
          </strong>
        </div>

        <div class="preview-row">
          <span>Event ID</span>
          <strong>
            ${escapeHtml(data.eventId)}
          </strong>
        </div>

        <div class="preview-row">
          <span>Duration</span>
          <strong>
            ${Number(data.durationDays)} Days
          </strong>
        </div>

        <div class="preview-row">
          <span>Payment Signature</span>
          <strong title="${escapeHtml(
            pendingPaymentSignature
          )}">
            ${escapeHtml(
              shortenAddress(
                pendingPaymentSignature
              )
            )}
          </strong>
        </div>
      `;

      paymentStep.hidden = true;
      successStep.hidden = false;

      updateProgress(5);

      successStep.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    } catch (error) {
      console.error(
        "Pay & Create Event failed:",
        error
      );

      /*
       * If a signature exists, SOL may already
       * have been sent. Do NOT clear it.
       */
      if (pendingPaymentSignature) {
        payAndCreateBtn.textContent =
          "Retry Event Verification";

        alert(
          `${error?.message || "Event creation failed."}\n\nYour payment transaction has already been submitted. Do not pay again. Use this button to retry verification.`
        );

        payAndCreateBtn.disabled =
          false;

        /*
         * Keep Back disabled after payment
         * has been submitted to prevent
         * accidentally generating another quote.
         */
        backToPreviewBtn.disabled =
          true;

        return;
      }

      alert(
        error?.message ||
        "Payment was cancelled or could not be completed."
      );

      payAndCreateBtn.textContent =
        originalButtonText;

      payAndCreateBtn.disabled =
        false;

      backToPreviewBtn.disabled =
        false;

      return;
    }

    payAndCreateBtn.disabled =
      true;

    backToPreviewBtn.disabled =
      true;
  }
);
/* =========================================================
   BACK TO CONNECT
   ========================================================= */

backToConnectBtn.addEventListener(
  "click",
  () => {
    setupStep.hidden = true;
    connectStep.hidden = false;

    updateProgress(1);

    connectStep.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
);


/* =========================================================
   INITIAL STATE
   ========================================================= */

updateProgress(1);