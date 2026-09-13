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


async function adminFetch(path, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
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

let adminPeriod = "week";
let adminCustomStart = "";
let adminCustomEnd = "";

function getAdminPeriodQuery() {
  if (
    adminPeriod === "custom" &&
    adminCustomStart &&
    adminCustomEnd
  ) {
    return (
      `?period=custom` +
      `&start=${encodeURIComponent(adminCustomStart)}` +
      `&end=${encodeURIComponent(adminCustomEnd)}`
    );
  }

  return `?period=${encodeURIComponent(adminPeriod)}`;
}

async function loadOverview() {
  const data =
  await adminFetch(
    `/api/admin/overview${getAdminPeriodQuery()}`
  );

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
  const data =
  await adminFetch(
    `/api/admin/leaderboard/tokens${getAdminPeriodQuery()}`
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
  const data =
  await adminFetch(
    `/api/admin/leaderboard/referrals${getAdminPeriodQuery()}`
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
  const data =
  await adminFetch(
    `/api/admin/leaderboard/burners${getAdminPeriodQuery()}`
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
  await adminFetch(
    `/api/burns${getAdminPeriodQuery()}`
  );

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
  await adminFetch(
    `/api/admin/referrals${getAdminPeriodQuery()}`
  );

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
      adminNav.hidden = false;
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

const periodButtons =
  document.querySelectorAll(".period-btn");

const customPeriodRange =
  document.getElementById("customPeriodRange");

const customPeriodStart =
  document.getElementById("customPeriodStart");

const customPeriodEnd =
  document.getElementById("customPeriodEnd");

const applyCustomPeriodBtn =
  document.getElementById("applyCustomPeriodBtn");

function setActivePeriodButton(period) {
  periodButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.period === period
    );
  });
}

periodButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const period =
      button.dataset.period;

    if (!period) {
      return;
    }

    adminPeriod = period;

    setActivePeriodButton(period);

    if (period === "custom") {
      customPeriodRange.hidden = false;
      return;
    }

    customPeriodRange.hidden = true;

    adminCustomStart = "";
    adminCustomEnd = "";

    await loadDashboard();
  });
});

applyCustomPeriodBtn.addEventListener(
  "click",
  async () => {
    const start =
      customPeriodStart.value;

    const end =
      customPeriodEnd.value;

    if (!start || !end) {
      alert(
        "Please select both start and end dates."
      );
      return;
    }

    if (start > end) {
      alert(
        "Start date cannot be after end date."
      );
      return;
    }

    adminPeriod = "custom";
    adminCustomStart = start;
    adminCustomEnd = end;

    setActivePeriodButton("custom");

    await loadDashboard();
  }
);
const adminNav =
  document.getElementById("adminNav");

const adminDashboardTab =
  document.getElementById("adminDashboardTab");

const adminBurnEventsTab =
  document.getElementById("adminBurnEventsTab");

const adminBurnEvents =
  document.getElementById("adminBurnEvents");

  const burnEventForm =
  document.getElementById("burnEventForm");

const burnEventName =
  document.getElementById("burnEventName");

const burnEventTokenSymbol =
  document.getElementById("burnEventTokenSymbol");

const burnEventTokenMint =
  document.getElementById("burnEventTokenMint");

const burnEventMinimumBurn =
  document.getElementById("burnEventMinimumBurn");

const burnEventPointsPerTxn =
  document.getElementById("burnEventPointsPerTxn");

const burnEventDailyCap =
  document.getElementById("burnEventDailyCap");

const burnEventWinnersCount =
  document.getElementById("burnEventWinnersCount");

const burnEventStartAt =
  document.getElementById("burnEventStartAt");

const burnEventEndAt =
  document.getElementById("burnEventEndAt");

const burnEventStatus =
  document.getElementById("burnEventStatus");

const burnEventSubmitBtn =
  document.getElementById("burnEventSubmitBtn");

const burnEventFormMessage =
  document.getElementById("burnEventFormMessage");

  const burnEventsList =
  document.getElementById("burnEventsList");

const refreshBurnEventsBtn =
  document.getElementById("refreshBurnEventsBtn");

  const burnEventDetails =
  document.getElementById("burnEventDetails");

const burnEventDetailsContent =
  document.getElementById("burnEventDetailsContent");

const burnEventLeaderboard =
  document.getElementById("burnEventLeaderboard");

const backToBurnEventsBtn =
  document.getElementById("backToBurnEventsBtn");

const refreshBurnEventDetailsBtn =
  document.getElementById("refreshBurnEventDetailsBtn");

let selectedBurnEventId = null;

  async function loadBurnEvents() {
  const data =
    await adminFetch("/api/admin/burn-events");

  const events =
    Array.isArray(data.events)
      ? data.events
      : [];

  if (!events.length) {
    burnEventsList.innerHTML = `
      <p>No Burning Events found.</p>
    `;

    return;
  }

  burnEventsList.innerHTML =
    events
      .map((event) => {
        const start =
          event.startAt
            ? new Date(
                event.startAt
              ).toLocaleString()
            : "—";

        const end =
          event.endAt
            ? new Date(
                event.endAt
              ).toLocaleString()
            : "—";

        return `
          <article class="burn-event-card">
            <h4 class="burn-event-card-title">
              ${event.name}
            </h4>

            <div class="burn-event-card-meta">
              <div>
                <strong>Status</strong>
                ${event.status}
              </div>

              <div>
                <strong>Token</strong>
                ${event.tokenSymbol || "—"}
              </div>

              <div>
                <strong>Minimum Burn</strong>
                ${event.minimumBurn}
              </div>

              <div>
                <strong>Points / TXN</strong>
                ${event.pointsPerTxn}
              </div>

              <div>
                <strong>Daily Cap</strong>
                ${event.dailyCap}
              </div>

              <div>
                <strong>Winners</strong>
                ${event.winnersCount}
              </div>

              <div>
                <strong>Start</strong>
                ${start}
              </div>

              <div>
                <strong>End</strong>
                ${end}
              </div>
            </div>
            <div class="burn-event-card-actions">
  <button
    type="button"
    class="manage-burn-event-btn"
    data-event-id="${event.id}"
  >
    Manage Event
  </button>
</div>
          </article>
        `;
      })
      .join("");
}
async function openBurnEventDetails(eventId) {
  selectedBurnEventId = eventId;

  burnEventDetails.hidden = false;

  burnEventDetailsContent.innerHTML = `
    <p>Loading event details...</p>
  `;

  burnEventLeaderboard.innerHTML = `
    <tr>
      <td colspan="7">
        Loading leaderboard...
      </td>
    </tr>
  `;

  burnEventDetails.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  try {
    const data =
      await adminFetch(
        `/api/admin/burn-events/${encodeURIComponent(eventId)}/leaderboard`
      );

    const eventData =
      data.event || {};

    const rows =
      Array.isArray(data.leaderboard)
        ? data.leaderboard
        : [];

    const start =
      eventData.startAt
        ? new Date(
            eventData.startAt
          ).toLocaleString()
        : "—";

    const end =
      eventData.endAt
        ? new Date(
            eventData.endAt
          ).toLocaleString()
        : "—";

    burnEventDetailsContent.innerHTML = `
      <h3>${eventData.name || "Burning Event"}</h3>

      <div class="burn-event-card-meta">
        <div>
          <strong>Status</strong>
          ${eventData.status || "—"}
        </div>

        <div>
          <strong>Token</strong>
          ${eventData.tokenSymbol || "—"}
        </div>

        <div>
          <strong>Minimum Burn</strong>
          ${eventData.minimumBurn ?? "—"}
        </div>

        <div>
          <strong>Points / TXN</strong>
          ${eventData.pointsPerTxn ?? "—"}
        </div>

        <div>
          <strong>Daily Cap</strong>
          ${eventData.dailyCap ?? "—"}
        </div>

        <div>
          <strong>Winners</strong>
          ${eventData.winnersCount ?? "—"}
        </div>

        <div>
          <strong>Start</strong>
          ${start}
        </div>

        <div>
          <strong>End</strong>
          ${end}
        </div>
      </div>
    `;

    if (!rows.length) {
      burnEventLeaderboard.innerHTML = `
        <tr>
          <td colspan="7">
            No qualifying transactions yet.
          </td>
        </tr>
      `;

      return;
    }

    burnEventLeaderboard.innerHTML =
      rows
        .map((row) => {
          const latest =
            row.latestQualifyingBurn
              ? new Date(
                  row.latestQualifyingBurn
                ).toLocaleString()
              : "—";

          return `
            <tr>
              <td>#${row.rank}</td>
              <td>${row.wallet}</td>
              <td>${row.points}</td>
              <td>${row.qualifyingTransactions}</td>
              <td>${row.activeDays}</td>
              <td>${row.totalBurned}</td>
              <td>${latest}</td>
            </tr>
          `;
        })
        .join("");
  } catch (error) {
    burnEventDetailsContent.innerHTML = `
      <p>Unable to load event details.</p>
    `;

    burnEventLeaderboard.innerHTML = `
      <tr>
        <td colspan="7">
          Unable to load leaderboard.
        </td>
      </tr>
    `;

    console.error(
      "Burn Event details error:",
      error
    );
  }
}
function showAdminView(view) {
  const showDashboard =
    view === "dashboard";

  adminDashboard.hidden =
    !showDashboard;

  adminBurnEvents.hidden =
    showDashboard;

  adminDashboardTab.classList.toggle(
    "active",
    showDashboard
  );

  adminBurnEventsTab.classList.toggle(
    "active",
    !showDashboard
  );
}

adminDashboardTab.addEventListener(
  "click",
  () => {
    showAdminView("dashboard");
  }
);

adminBurnEventsTab.addEventListener(
  "click",
  async () => {
    showAdminView("burn-events");

    try {
      await loadBurnEvents();
    } catch (error) {
      burnEventsList.innerHTML = `
        <p>Unable to load Burning Events.</p>
      `;

      console.error(
        "Burning Events load error:",
        error
      );
    }
  }
);
refreshBurnEventsBtn.addEventListener(
  "click",
  async () => {
    try {
      await loadBurnEvents();
    } catch (error) {
      burnEventsList.innerHTML = `
        <p>Unable to load Burning Events.</p>
      `;

      console.error(
        "Burning Events refresh error:",
        error
      );
    }
  }
);
burnEventsList.addEventListener(
  "click",
  async (event) => {
    const button =
      event.target.closest(
        ".manage-burn-event-btn"
      );

    if (!button) {
      return;
    }

    const eventId =
      button.dataset.eventId;

    if (!eventId) {
      return;
    }

    openBurnEventDetails(eventId);
  }
);
backToBurnEventsBtn.addEventListener(
  "click",
  () => {
    selectedBurnEventId = null;
    burnEventDetails.hidden = true;
  }
);
refreshBurnEventDetailsBtn.addEventListener(
  "click",
  async () => {
    if (!selectedBurnEventId) {
      return;
    }

    await openBurnEventDetails(
      selectedBurnEventId
    );
  }
);
burnEventForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    burnEventFormMessage.textContent = "";
    burnEventSubmitBtn.disabled = true;

    const payload = {
      name:
        burnEventName.value.trim(),

      tokenSymbol:
        burnEventTokenSymbol.value
          .trim()
          .toUpperCase(),

      tokenMint:
        burnEventTokenMint.value.trim(),

      minimumBurn:
        Number(burnEventMinimumBurn.value),

      pointsPerTxn:
        Number(burnEventPointsPerTxn.value),

      dailyCap:
        Number(burnEventDailyCap.value),

      winnersCount:
        Number(burnEventWinnersCount.value),

      startAt:
  new Date(
    burnEventStartAt.value
  ).toISOString(),

endAt:
  new Date(
    burnEventEndAt.value
  ).toISOString(),

      status:
        burnEventStatus.value,
    };
        try {
      await adminFetch(
        "/api/admin/burn-events",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      burnEventFormMessage.textContent =
        "Event created successfully.";

      burnEventForm.reset();

      burnEventPointsPerTxn.value = "1";
      burnEventStatus.value = "draft";

      await loadBurnEvents();

    } catch (error) {
      burnEventFormMessage.textContent =
        error.message ||
        "Unable to create event.";
    } finally {
      burnEventSubmitBtn.disabled = false;
    }
  }
);
adminLogoutBtn.addEventListener(
  "click",
  () => {
    adminKey = "";

    adminDashboard.hidden = true;
    adminNav.hidden = true;
    adminLogin.hidden = false;

    loginError.textContent = "";
    adminKeyInput.value = "";
    adminKeyInput.focus();
  }
);