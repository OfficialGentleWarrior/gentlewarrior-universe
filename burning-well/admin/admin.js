const API_BASE_URL =
  "https://burningwellapi-slmbcnmgwa-as.a.run.app";

let adminKey = "";

const adminLogin =
  document.getElementById("adminLogin");

const adminDashboard =
  document.getElementById("adminDashboard");

const adminKeyInput =
  document.getElementById("adminKey");

const adminLoginBtn =
  document.getElementById("adminLoginBtn");

const adminLogoutBtn =
  document.getElementById("adminLogoutBtn");

const loginError =
  document.getElementById("loginError");


function shortenAddress(value) {
  if (!value) {
    return "—";
  }

  const text = String(value);

  if (text.length <= 12) {
    return text;
  }

  return `${text.slice(0, 6)}...${text.slice(-6)}`;
}


function formatDate(timestamp) {
  const value = Number(timestamp || 0);

  if (!value) {
    return "—";
  }

  return new Date(
    value * 1000
  ).toLocaleString();
}


function formatUsd(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}


async function adminFetch(path) {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      headers: {
        "x-admin-key": adminKey,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Admin request failed."
    );
  }

  return data;
}


async function loadOverview() {
  const data =
    await adminFetch("/api/admin/overview");

  document.getElementById(
    "totalBurnTransactions"
  ).textContent =
    Number(data.totalBurnTransactions || 0);

  document.getElementById(
    "uniqueBurners"
  ).textContent =
    Number(data.uniqueBurners || 0);

  document.getElementById(
    "uniqueTokens"
  ).textContent =
    Number(data.uniqueTokens || 0);

  document.getElementById(
    "totalServiceFeesUsd"
  ).textContent =
    formatUsd(data.totalServiceFeesUsd);

  document.getElementById(
    "totalReferralRewardsUsd"
  ).textContent =
    formatUsd(data.totalReferralRewardsUsd);
}


async function loadTokenLeaderboard() {
  const data = await adminFetch(
    "/api/admin/leaderboard/tokens"
  );

  const tbody =
    document.getElementById(
      "tokenLeaderboard"
    );

  const rows =
    Array.isArray(data.leaderboard)
      ? data.leaderboard
      : [];

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          No token burn data yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows
    .map((item) => `
      <tr>
        <td>#${item.rank}</td>

        <td>
          <strong>
            ${item.tokenName || "Unknown Token"}
          </strong>
          ${
            item.tokenSymbol
              ? ` (${item.tokenSymbol})`
              : ""
          }
        </td>

        <td title="${item.mint || ""}">
          ${shortenAddress(item.mint)}
        </td>

        <td>
          ${Number(item.totalBurned || 0)}
        </td>

        <td>
          ${Number(item.burnTransactions || 0)}
        </td>

        <td>
          ${Number(item.uniqueBurners || 0)}
        </td>

        <td>
          ${formatDate(item.latestBurn)}
        </td>
      </tr>
    `)
    .join("");
}


async function loadReferralLeaderboard() {
  const data = await adminFetch(
    "/api/admin/leaderboard/referrals"
  );

  const tbody =
    document.getElementById(
      "referralLeaderboard"
    );

  const rows =
    Array.isArray(data.leaderboard)
      ? data.leaderboard
      : [];

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          No successful referrals yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows
    .map((item) => `
      <tr>
        <td>#${item.rank}</td>

        <td title="${item.referrerWallet || ""}">
          ${shortenAddress(item.referrerWallet)}
        </td>

        <td>
          ${item.referralCode || "—"}
        </td>

        <td>
          ${Number(item.successfulReferrals || 0)}
        </td>

        <td>
          ${formatUsd(item.rewardsEarnedUsd)}
        </td>

        <td>
          ${formatUsd(item.rewardsPaidUsd)}
        </td>

        <td>
          ${formatDate(item.latestReferral)}
        </td>
      </tr>
    `)
    .join("");
}


async function loadBurnerLeaderboard() {
  const data = await adminFetch(
    "/api/admin/leaderboard/burners"
  );

  const tbody =
    document.getElementById(
      "burnerLeaderboard"
    );

  const rows =
    Array.isArray(data.leaderboard)
      ? data.leaderboard
      : [];

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          No burner data yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows
    .map((item) => `
      <tr>
        <td>#${item.rank}</td>

        <td title="${item.wallet || ""}">
          ${shortenAddress(item.wallet)}
        </td>

        <td>
          ${Number(item.burnTransactions || 0)}
        </td>

        <td>
          ${Number(item.uniqueTokens || 0)}
        </td>

        <td>
          ${Number(item.totalBurned || 0)}
        </td>

        <td>
          ${formatDate(item.firstBurn)}
        </td>

        <td>
          ${formatDate(item.latestBurn)}
        </td>
      </tr>
    `)
    .join("");
}
async function loadBurnRegistry() {
  const data =
    await adminFetch("/api/burns");

  const tbody =
    document.getElementById("burnRegistry");

  const rows =
  Array.isArray(data.records)
    ? data.records
    : [];

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          No verified burns yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows
    .map((item) => {
      const timestamp =
  item.blockTime ||
  item.timestamp ||
  item.createdAt ||
  item.burnedAt ||
  0;

      const tokenName =
        item.tokenName ||
        item.name ||
        "Unknown Token";

      const tokenSymbol =
        item.tokenSymbol ||
        item.symbol ||
        "";

      const burner =
        item.wallet ||
        item.burnerWallet ||
        item.burner ||
        "";

      const amount =
        item.amount ??
        item.amountBurned ??
        item.burnAmount ??
        0;

      const serviceFee =
        item.serviceFeeUsd ??
        item.feeUsd ??
        0;

      const referral =
        item.referralCode ||
        item.referrerWallet ||
        "None";

      const signature =
        item.signature ||
        item.transactionSignature ||
        item.txSignature ||
        "";

      return `
        <tr>
          <td>
            ${formatDate(timestamp)}
          </td>

          <td>
            <strong>${tokenName}</strong>
            ${
              tokenSymbol
                ? ` (${tokenSymbol})`
                : ""
            }
          </td>

          <td title="${burner}">
            ${shortenAddress(burner)}
          </td>

          <td>
            ${Number(amount)}
          </td>

          <td>
            ${formatUsd(serviceFee)}
          </td>

          <td>
            ${referral}
          </td>

          <td>
            ${
              signature
                ? `
                  <a
                    href="https://solscan.io/tx/${signature}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View TX
                  </a>
                `
                : "—"
            }
          </td>
        </tr>
      `;
    })
    .join("");
}
async function loadReferralTransactions() {
  const data =
    await adminFetch("/api/admin/referrals");

  const tbody =
    document.getElementById(
      "referralTransactions"
    );

  const rows =
    Array.isArray(data.referrals)
      ? data.referrals
      : Array.isArray(data)
        ? data
        : [];

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          No referral transactions yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows
    .map((item) => {
      const timestamp =
        item.timestamp ||
        item.createdAt ||
        item.paidAt ||
        0;

      const referralCode =
        item.referralCode ||
        "—";

      const referrer =
        item.referrerWallet ||
        item.referrer ||
        "";

      const burner =
        item.burnerWallet ||
        item.wallet ||
        item.burner ||
        "";

      const reward =
        item.rewardUsd ??
        item.referralRewardUsd ??
        item.amountUsd ??
        0;

      const status =
        item.status ||
        "—";

      const signature =
        item.signature ||
        item.transactionSignature ||
        item.txSignature ||
        "";

      return `
        <tr>
          <td>
            ${formatDate(timestamp)}
          </td>

          <td>
            ${referralCode}
          </td>

          <td title="${referrer}">
            ${shortenAddress(referrer)}
          </td>

          <td title="${burner}">
            ${shortenAddress(burner)}
          </td>

          <td>
            ${formatUsd(reward)}
          </td>

          <td>
            ${status}
          </td>

          <td>
            ${
              signature
                ? `
                  <a
                    href="https://solscan.io/tx/${signature}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View TX
                  </a>
                `
                : "—"
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadDashboard() {
  await Promise.all([
    loadOverview(),
    loadTokenLeaderboard(),
    loadReferralLeaderboard(),
    loadBurnerLeaderboard(),
    loadBurnRegistry(),
    loadReferralTransactions(),
  ]);
}


adminLoginBtn.addEventListener(
  "click",
  async () => {
    const key =
      adminKeyInput.value.trim();

    if (!key) {
      loginError.textContent =
        "Enter your admin key.";
      return;
    }

    loginError.textContent = "";
    adminLoginBtn.disabled = true;

    try {
      adminKey = key;

      await adminFetch("/api/admin/ping");
      await loadDashboard();

      adminLogin.hidden = true;
      adminDashboard.hidden = false;

      adminKeyInput.value = "";
    } catch (error) {
      adminKey = "";

      loginError.textContent =
        error.message ||
        "Unable to access dashboard.";
    } finally {
      adminLoginBtn.disabled = false;
    }
  }
);


adminKeyInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      adminLoginBtn.click();
    }
  }
);


adminLogoutBtn.addEventListener(
  "click",
  () => {
    adminKey = "";

    adminDashboard.hidden = true;
    adminLogin.hidden = false;

    loginError.textContent = "";
    adminKeyInput.value = "";
    adminKeyInput.focus();
  }
);