/* =========================================================
   CONFIG
   ========================================================= */

const API_BASE_URL =
  "https://burningwellapi-slmbcnmgwa-as.a.run.app";


/* =========================================================
   ELEMENTS
   ========================================================= */

const loadingState =
  document.getElementById(
    "loadingState"
  );

const errorState =
  document.getElementById(
    "errorState"
  );

const errorMessage =
  document.getElementById(
    "errorMessage"
  );

const eventContent =
  document.getElementById(
    "eventContent"
  );

const eventName =
  document.getElementById(
    "eventName"
  );

const eventToken =
  document.getElementById(
    "eventToken"
  );

const eventStatus =
  document.getElementById(
    "eventStatus"
  );

const minimumBurn =
  document.getElementById(
    "minimumBurn"
  );

const pointsPerTxn =
  document.getElementById(
    "pointsPerTxn"
  );

const dailyCap =
  document.getElementById(
    "dailyCap"
  );

const winnersCount =
  document.getElementById(
    "winnersCount"
  );

const startAt =
  document.getElementById(
    "startAt"
  );

const endAt =
  document.getElementById(
    "endAt"
  );

const tokenMint =
  document.getElementById(
    "tokenMint"
  );

const participationMessage =
  document.getElementById(
    "participationMessage"
  );

const connectWalletBtn =
  document.getElementById(
    "connectWalletBtn"
  );

const burnTokensBtn =
  document.getElementById(
    "burnTokensBtn"
  );


/* =========================================================
   STATE
   ========================================================= */

let currentEvent = null;


/* =========================================================
   HELPERS
   ========================================================= */

function formatNumber(value) {
  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 9,
    }
  ).format(number);
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}


function shortenAddress(value) {
  const address =
    String(value || "");

  if (address.length <= 14) {
    return address;
  }

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-6)
  );
}


function showError(message) {
  loadingState.hidden = true;
  eventContent.hidden = true;

  errorMessage.textContent =
    message;

  errorState.hidden = false;
}


/* =========================================================
   STATUS
   ========================================================= */

function renderStatus(status) {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  let label =
    "Unavailable";

  let statusKey =
    "ended";

  if (
    normalized === "live"
  ) {
    label = "Live";
    statusKey = "live";

  } else if (
    normalized === "upcoming" ||
    normalized === "draft"
  ) {
    label = "Upcoming";
    statusKey = "upcoming";

  } else if (
    normalized === "ended"
  ) {
    label = "Ended";
    statusKey = "ended";
  }

  eventStatus.textContent =
    label;

  eventStatus.dataset.status =
    statusKey;

  return statusKey;
}


/* =========================================================
   PARTICIPATION STATE
   ========================================================= */

function renderParticipation(
  statusKey
) {
  connectWalletBtn.hidden = false;
  connectWalletBtn.disabled = false;

  burnTokensBtn.hidden = true;
  burnTokensBtn.disabled = true;

  if (statusKey === "live") {
    participationMessage.textContent =
      "Connect your Solana wallet to participate in this burn event.";

    return;
  }

  if (statusKey === "upcoming") {
    participationMessage.textContent =
      "This event has not started yet.";

    connectWalletBtn.disabled = true;

    return;
  }

  participationMessage.textContent =
    "This burn event has ended.";

  connectWalletBtn.disabled = true;
}


/* =========================================================
   RENDER EVENT
   ========================================================= */

function renderEvent(event) {
  currentEvent = event;

  document.title =
    `${event.name} | Burning Well`;

  eventName.textContent =
    event.name ||
    "Burn Event";

  const symbol =
    String(
      event.tokenSymbol || ""
    )
      .trim()
      .toUpperCase();

  eventToken.textContent =
    symbol
      ? `${symbol} Burn Event`
      : "Solana Token Burn Event";

  minimumBurn.textContent =
    symbol
      ? `${formatNumber(
          event.minimumBurn
        )} ${symbol}`
      : formatNumber(
          event.minimumBurn
        );

  pointsPerTxn.textContent =
    formatNumber(
      event.pointsPerTxn
    );

  dailyCap.textContent =
    formatNumber(
      event.dailyCap
    );

  winnersCount.textContent =
    formatNumber(
      event.winnersCount
    );

  startAt.textContent =
    formatDate(
      event.startAt
    );

  endAt.textContent =
    formatDate(
      event.endAt
    );

  const mint =
    String(
      event.tokenMint || ""
    );

  tokenMint.textContent =
    shortenAddress(mint);

  tokenMint.title =
    mint;

  const statusKey =
    renderStatus(
      event.status
    );

  renderParticipation(
    statusKey
  );

  loadingState.hidden = true;
  errorState.hidden = true;
  eventContent.hidden = false;
}


/* =========================================================
   LOAD EVENT
   ========================================================= */

async function loadEvent() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const eventId =
    String(
      params.get("id") || ""
    ).trim();

  if (!eventId) {
    showError(
      "No burn event was specified."
    );

    return;
  }

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/public/burn-events/${encodeURIComponent(
          eventId
        )}`
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Unable to load burn event."
      );
    }

    if (!data?.event) {
      throw new Error(
        "Burn event data was not returned."
      );
    }

    renderEvent(
      data.event
    );

  } catch (error) {
    console.error(
      "Load event failed:",
      error
    );

    showError(
      error?.message ||
      "Unable to load burn event."
    );
  }
}


/* =========================================================
   INITIALIZE
   ========================================================= */

loadEvent();