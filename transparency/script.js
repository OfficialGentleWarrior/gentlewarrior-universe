/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   UPDATED SCRIPT
   ========================================= */

"use strict";


/* =========================================
   CONFIG
   ========================================= */

const CONFIG = window.GW_CONFIG || window.CONFIG || {};

const SHEET_URL =
  CONFIG.sheetUrl ||
  CONFIG.SHEET_URL ||
  CONFIG.webAppUrl ||
  CONFIG.WEB_APP_URL ||
  "";

const SPREADSHEET_ID =
  CONFIG.spreadsheetId ||
  CONFIG.SPREADSHEET_ID ||
  "";

const SHEET_GIDS =
  CONFIG.sheetGids ||
  CONFIG.SHEET_GIDS ||
  {};

const SHEET_NAMES = {
  claimed: "Claimed",
  redeemed: "Redeemed",
  expenses: "Expenses",
  allocation: "Allocation"
};


/* =========================================
   HELPERS
   ========================================= */

function $(id) {
  return document.getElementById(id);
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function toNumber(value) {

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const cleaned = String(value)
    .replace(/₱/g, "")
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/SOL/gi, "")
    .replace(/PHP/gi, "")
    .trim();

  const number = parseFloat(cleaned);

  return Number.isFinite(number) ? number : 0;
}


function formatSOL(value) {
  return `${toNumber(value).toFixed(2)} SOL`;
}


function formatPeso(value) {
  return `₱${toNumber(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}


function formatUSD(value) {
  return `$${toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}


function formatRate(value) {

  const number = toNumber(value);

  if (!number) {
    return "—";
  }

  return `$${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}


function normalizeKey(value) {

  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[_-]/g, " ");
}


function getField(row, names) {

  const keys = Object.keys(row || {});

  for (const name of names) {

    const target = normalizeKey(name);

    const key = keys.find(
      key => normalizeKey(key) === target
    );

    if (key !== undefined) {
      return row[key];
    }
  }

  return "";
}


function getDate(row) {

  return getField(row, [
    "Date",
    "date",
    "DATE",
    "Timestamp",
    "timestamp"
  ]);
}


function getDescription(row) {

  return getField(row, [
    "Description",
    "description",
    "DESCRIPTION",
    "Item",
    "item",
    "Purpose",
    "purpose"
  ]);
}


function getRemarks(row) {

  return getField(row, [
    "Remarks",
    "remarks",
    "REMARKS",
    "Remark",
    "remark",
    "Notes",
    "notes",
    "Note",
    "note"
  ]);
}


/* =========================================
   STATE
   ========================================= */

const state = {

  claimed: [],

  redeemed: [],

  expenses: [],

  allocation: {
    leam: [],
    cp: [],
    project: []
  },

  note: "",

  loaded: false,

  sourceErrors: []

};


/* =========================================
   CSV PARSER
   ========================================= */

function parseCSV(text) {

  const rows = [];

  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {

    const char = text[i];
    const next = text[i + 1];

    if (
      char === '"' &&
      insideQuotes &&
      next === '"'
    ) {

      cell += '"';
      i++;

      continue;
    }

    if (char === '"') {

      insideQuotes = !insideQuotes;

      continue;
    }

    if (
      char === "," &&
      !insideQuotes
    ) {

      row.push(cell);

      cell = "";

      continue;
    }

    if (
      (
        char === "\n" ||
        char === "\r"
      ) &&
      !insideQuotes
    ) {

      if (
        char === "\r" &&
        next === "\n"
      ) {
        i++;
      }

      row.push(cell);

      cell = "";

      if (
        row.length > 1 ||
        row.some(
          value =>
            String(value ?? "").trim() !== ""
        )
      ) {

        rows.push(row);
      }

      row = [];

      continue;
    }

    cell += char;
  }

  row.push(cell);

  if (
    row.length > 1 ||
    row.some(
      value =>
        String(value ?? "").trim() !== ""
    )
  ) {

    rows.push(row);
  }

  return rows;
}


/* =========================================
   ROWS → OBJECTS
   ========================================= */

function rowsToObjects(rows) {

  if (
    !Array.isArray(rows) ||
    rows.length < 2
  ) {
    return [];
  }

  const headers =
    rows[0].map(
      header =>
        String(header ?? "").trim()
    );

  return rows
    .slice(1)
    .filter(row =>
      row.some(
        value =>
          String(value ?? "").trim() !== ""
      )
    )
    .map(row => {

      const object = {};

      headers.forEach(
        (header, index) => {

          if (header) {

            object[header] =
              row[index] ?? "";
          }
        }
      );

      return object;
    });
}


/* =========================================
   JSON NORMALIZER
   ========================================= */

function normalizeResponseData(data) {

  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  if (Array.isArray(data.rows)) {
    return data.rows;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  if (Array.isArray(data.values)) {

    return rowsToObjects(
      data.values
    );
  }

  if (Array.isArray(data.records)) {
    return data.records;
  }

  return [];
}


/* =========================================
   FETCH WITH TIMEOUT
   ========================================= */

async function fetchWithTimeout(
  url,
  options = {},
  timeout = 15000
) {

  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () => controller.abort(),
      timeout
    );

  try {

    return await fetch(
      url,
      {
        ...options,
        signal: controller.signal,
        cache: "no-store"
      }
    );

  } finally {

    clearTimeout(timer);
  }
}


/* =========================================
   GOOGLE SHEET / WEB APP FETCH
   ========================================= */

async function fetchSheet(sheetName) {

  const errors = [];

  /*
   * METHOD 1
   * Existing Gentle Warrior web-app endpoint.
   */

  if (SHEET_URL) {

    const parameterSets = [

      {
        sheet: sheetName
      },

      {
        tab: sheetName
      },

      {
        sheetName: sheetName
      }

    ];

    for (
      const params of parameterSets
    ) {

      try {

        const separator =
          SHEET_URL.includes("?")
            ? "&"
            : "?";

        const query =
          new URLSearchParams(params);

        const url =
          `${SHEET_URL}${separator}${query.toString()}`;

        const response =
          await fetchWithTimeout(url);

        if (!response.ok) {

          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const text =
          await response.text();

        if (!text.trim()) {

          throw new Error(
            "Empty response"
          );
        }

        /*
         * Try JSON first.
         */

        try {

          const json =
            JSON.parse(text);

          const data =
            normalizeResponseData(json);

          if (data.length) {
            return data;
          }

        } catch (_) {
          /*
           * Not JSON.
           * Continue with CSV.
           */
        }

        /*
         * Try CSV.
         */

        const rows =
          parseCSV(text);

        const data =
          rowsToObjects(rows);

        if (data.length) {
          return data;
        }

        /*
         * Some Apps Script endpoints
         * return a single row.
         */

        if (
          rows.length === 1 &&
          rows[0].length
        ) {

          const headers =
            rows[0];

          if (
            headers.some(
              value =>
                String(value)
                  .toLowerCase()
                  .includes("date")
            )
          ) {

            return [];
          }
        }

        throw new Error(
          "No usable records returned"
        );

      } catch (error) {

        errors.push(
          `${sheetName}: ${error.message}`
        );
      }
    }
  }


  /*
   * METHOD 2
   * Direct Google Sheets CSV export.
   *
   * This only activates when
   * spreadsheetId + sheetGids are configured.
   */

  if (SPREADSHEET_ID) {

    const gid =
      SHEET_GIDS[sheetName] ??
      SHEET_GIDS[
        sheetName.toLowerCase()
      ];

    if (
      gid !== undefined &&
      gid !== null &&
      String(gid) !== ""
    ) {

      try {

        return await fetchSheetDirect(
          SPREADSHEET_ID,
          gid
        );

      } catch (error) {

        errors.push(
          `${sheetName} direct: ${error.message}`
        );
      }
    }
  }


  throw new Error(
    errors.join(" | ") ||
    `Unable to load ${sheetName}.`
  );
}


/* =========================================
   DIRECT GOOGLE SHEETS CSV
   ========================================= */

async function fetchSheetDirect(
  sheetId,
  gid
) {

  const url =
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
      sheetId
    )}/export?format=csv&gid=${encodeURIComponent(
      gid
    )}`;

  const response =
    await fetchWithTimeout(url);

  if (!response.ok) {

    throw new Error(
      `Google Sheets HTTP ${response.status}`
    );
  }

  const text =
    await response.text();

  const rows =
    parseCSV(text);

  const data =
    rowsToObjects(rows);

  if (!data.length) {

    throw new Error(
      "Google Sheet returned no records"
    );
  }

  return data;
}


/* =========================================
   CLAIMED
   ========================================= */

function normalizeClaimed(rows) {

  return (rows || [])
    .map(row => ({

      date:
        getDate(row),

      sol:
        toNumber(
          getField(row, [
            "SOL Claimed",
            "SOL CLAIMED",
            "SOL",
            "Claimed",
            "CLAIMED",
            "Amount",
            "amount"
          ])
        )

    }))
    .filter(row =>
      row.date ||
      row.sol !== 0
    );
}


function renderClaimed() {

  const table =
    $("claimsTable");

  if (!table) return;

  const rows =
    state.claimed;

  const total =
    rows.reduce(
      (sum, row) =>
        sum + row.sol,
      0
    );

  if (!rows.length) {

    table.innerHTML = `
      <tr>
        <td colspan="2">
          No Creator Reward claims recorded yet.
        </td>
      </tr>
    `;

  } else {

    table.innerHTML =
      rows.map(row => `
        <tr>

          <td>
            ${escapeHTML(row.date)}
          </td>

          <td class="num">
            ${formatSOL(row.sol)}
          </td>

        </tr>
      `).join("");
  }

  if ($("claimsTotal")) {

    $("claimsTotal").textContent =
      formatSOL(total);
  }

  if ($("claimedCount")) {

    $("claimedCount").textContent =
      `${rows.length} ${
        rows.length === 1
          ? "record"
          : "records"
      }`;
  }

  if ($("totalClaimed")) {

    $("totalClaimed").textContent =
      formatSOL(total);
  }
}


/* =========================================
   REDEEMED
   ========================================= */

function normalizeRedeemed(rows) {

  return (rows || [])
    .map(row => ({

      date:
        getDate(row),

      sol:
        toNumber(
          getField(row, [
            "Sold SOL",
            "SOLD SOL",
            "SOL Sold",
            "SOL SOLD",
            "Sold",
            "SOLD",
            "SOL"
          ])
        ),

      rate:
        toNumber(
          getField(row, [
            "Rate",
            "RATE",
            "SOL Rate",
            "SOL RATE",
            "USD Rate",
            "USD RATE"
          ])
        ),

      usd:
        toNumber(
          getField(row, [
            "$",
            "USD",
            "USD Amount",
            "USD AMOUNT",
            "Dollar",
            "Dollars"
          ])
        ),

      peso:
        toNumber(
          getField(row, [
            "In Peso",
            "IN PESO",
            "Peso",
            "PESO",
            "PHP",
            "PHP Amount",
            "PHP AMOUNT"
          ])
        )

    }))
    .filter(row =>
      row.date ||
      row.sol !== 0 ||
      row.usd !== 0 ||
      row.peso !== 0
    );
}


function renderRedeemed() {

  const table =
    $("redeemedTable");

  const empty =
    $("redeemedEmpty");

  const wrap =
    $("redeemedWrap");

  if (
    !table ||
    !empty ||
    !wrap
  ) {
    return;
  }

  const rows =
    state.redeemed;

  const totalSOL =
    rows.reduce(
      (sum, row) =>
        sum + row.sol,
      0
    );

  const totalPeso =
    rows.reduce(
      (sum, row) =>
        sum + row.peso,
      0
    );

  if ($("redeemedCount")) {

    $("redeemedCount").textContent =
      `${rows.length} ${
        rows.length === 1
          ? "record"
          : "records"
      }`;
  }

  if (!rows.length) {

    empty.classList.remove(
      "hidden"
    );

    wrap.classList.add(
      "hidden"
    );

    empty.innerHTML = `
      <div class="empty-icon">—</div>

      <strong>
        No Creator Rewards redeemed yet.
      </strong>

      <p>
        When a reward is sold,
        the transaction will be recorded here.
      </p>
    `;

  } else {

    empty.classList.add(
      "hidden"
    );

    wrap.classList.remove(
      "hidden"
    );

    table.innerHTML =
      rows.map(row => `
        <tr>

          <td>
            ${escapeHTML(row.date)}
          </td>

          <td class="num">
            ${formatSOL(row.sol)}
          </td>

          <td class="num">
            ${formatRate(row.rate)}
          </td>

          <td class="num">
            ${formatUSD(row.usd)}
          </td>

          <td class="num">
            ${formatPeso(row.peso)}
          </td>

        </tr>
      `).join("");
  }

  if ($("redeemedTotal")) {

    $("redeemedTotal").textContent =
      formatSOL(totalSOL);
  }

  if ($("proceedsTotal")) {

    $("proceedsTotal").textContent =
      formatPeso(totalPeso);
  }

  if ($("totalRedeemed")) {

    $("totalRedeemed").textContent =
      formatSOL(totalSOL);
  }

  if ($("totalProceeds")) {

    $("totalProceeds").textContent =
      formatPeso(totalPeso);
  }
}


/* =========================================
   EXPENSES
   ========================================= */

function normalizeExpenses(rows) {

  return (rows || [])
    .map(row => ({

      date:
        getDate(row),

      description:
        getDescription(row),

      amount:
        toNumber(
          getField(row, [
            "Amount",
            "AMOUNT",
            "Expense",
            "EXPENSE",
            "PHP",
            "PHP Amount",
            "PHP AMOUNT",
            "Cost",
            "COST"
          ])
        ),

      remarks:
        getRemarks(row)

    }))
    .filter(row =>
      row.date ||
      row.description ||
      row.amount !== 0 ||
      row.remarks
    );
}


function renderExpenses() {

  const table =
    $("expensesTable");

  if (!table) return;

  const rows =
    state.expenses;

  const total =
    rows.reduce(
      (sum, row) =>
        sum + row.amount,
      0
    );

  if ($("expenseCount")) {

    $("expenseCount").textContent =
      `${rows.length} ${
        rows.length === 1
          ? "record"
          : "records"
      }`;
  }

  if (!rows.length) {

    table.innerHTML = `
      <tr>
        <td colspan="4">
          No expenses recorded yet.
        </td>
      </tr>
    `;

  } else {

    table.innerHTML =
      rows.map(row => `
        <tr>

          <td>
            ${escapeHTML(row.date)}
          </td>

          <td>
            ${escapeHTML(row.description)}
          </td>

          <td class="num">
            ${formatPeso(row.amount)}
          </td>

          <td>
            ${escapeHTML(row.remarks)}
          </td>

        </tr>
      `).join("");
  }

  if ($("expensesTotal")) {

    $("expensesTotal").textContent =
      formatPeso(total);
  }

  if ($("totalExpenses")) {

    $("totalExpenses").textContent =
      formatPeso(total);
  }
}


/* =========================================
   ALLOCATION
   ========================================= */

function normalizeAllocation(rows) {

  return (rows || [])
    .map(row => ({

      date:
        getDate(row),

      fund:
        normalizeKey(
          getField(row, [
            "Fund",
            "FUND",
            "Allocation",
            "ALLOCATION",
            "Category",
            "CATEGORY",
            "Account",
            "ACCOUNT"
          ])
        ),

      remarks:
        getRemarks(row),

      in:
        toNumber(
          getField(row, [
            "IN",
            "In",
            "Amount In",
            "AMOUNT IN",
            "Incoming",
            "INCOMING"
          ])
        ),

      out:
        toNumber(
          getField(row, [
            "OUT",
            "Out",
            "Amount Out",
            "AMOUNT OUT",
            "Outgoing",
            "OUTGOING"
          ])
        )

    }))
    .filter(row =>
      row.date ||
      row.fund ||
      row.in !== 0 ||
      row.out !== 0 ||
      row.remarks
    );
}


function resolveAllocationFund(fund) {

  const value =
    normalizeKey(fund);

  if (
    value.includes("leam")
  ) {
    return "leam";
  }

  if (
    value === "cp" ||
    value.includes("cp kid") ||
    value.includes("cp kids") ||
    value.includes("cerebral palsy")
  ) {
    return "cp";
  }

  if (
    value.includes("project") ||
    value.includes("gentle warrior")
  ) {
    return "project";
  }

  return null;
}


function renderAllocationCard(key) {

  const rows =
    state.allocation[key] || [];

  const prefix =
    key;

  const inTotal =
    rows.reduce(
      (sum, row) =>
        sum + row.in,
      0
    );

  const outTotal =
    rows.reduce(
      (sum, row) =>
        sum + row.out,
      0
    );

  const balance =
    inTotal - outTotal;

  const records =
    $(`${prefix}Records`);

  const noRecords =
    $(`${prefix}NoRecords`);

  if (
    !records ||
    !noRecords
  ) {
    return;
  }

  if ($(`${prefix}In`)) {

    $(`${prefix}In`).textContent =
      formatPeso(inTotal);
  }

  if ($(`${prefix}Out`)) {

    $(`${prefix}Out`).textContent =
      formatPeso(outTotal);
  }

  if ($(`${prefix}Balance`)) {

    $(`${prefix}Balance`).textContent =
      formatPeso(balance);
  }

  if (!rows.length) {

    records.innerHTML = "";

    noRecords.style.display =
      "block";

    return;
  }

  noRecords.style.display =
    "none";

  records.innerHTML =
    rows.map(row => `
      <div class="allocation-record">

        <span>
          ${escapeHTML(row.date)}
        </span>

        <span>
          ${escapeHTML(row.remarks)}
        </span>

        <strong>
          ${
            row.in
              ? formatPeso(row.in)
              : "—"
          }
        </strong>

        <strong>
          ${
            row.out
              ? formatPeso(row.out)
              : "—"
          }
        </strong>

      </div>
    `).join("");
}


function renderAllocation() {

  renderAllocationCard("leam");
  renderAllocationCard("cp");
  renderAllocationCard("project");

  const percentages = {

    leam: 30,

    cp: 30,

    project: 40

  };

  if ($("leamPercentage")) {

    $("leamPercentage").textContent =
      `${percentages.leam}%`;
  }

  if ($("cpPercentage")) {

    $("cpPercentage").textContent =
      `${percentages.cp}%`;
  }

  if ($("projectPercentage")) {

    $("projectPercentage").textContent =
      `${percentages.project}%`;
  }

  if ($("allocationTotalPercentage")) {

    $("allocationTotalPercentage").textContent =
      `${
        percentages.leam +
        percentages.cp +
        percentages.project
      }%`;
  }

  if ($("allocationNote")) {

    $("allocationNote").textContent =
      state.note ||
      "Creator Reward funds are allocated across direct support, cerebral palsy support, and Gentle Warrior projects.";
  }
}


function processAllocation(rows) {

  const normalized =
    normalizeAllocation(rows);

  state.allocation.leam = [];
  state.allocation.cp = [];
  state.allocation.project = [];

  normalized.forEach(row => {

    const key =
      resolveAllocationFund(
        row.fund
      );

    if (!key) return;

    state.allocation[key].push(
      row
    );
  });
}


/* =========================================
   TOTALS
   ========================================= */

function updateOverviewTotals() {

  const claimedTotal =
    state.claimed.reduce(
      (sum, row) =>
        sum + row.sol,
      0
    );

  const redeemedTotal =
    state.redeemed.reduce(
      (sum, row) =>
        sum + row.sol,
      0
    );

  const proceedsTotal =
    state.redeemed.reduce(
      (sum, row) =>
        sum + row.peso,
      0
    );

  const expenseTotal =
    state.expenses.reduce(
      (sum, row) =>
        sum + row.amount,
      0
    );

  if ($("totalClaimed")) {

    $("totalClaimed").textContent =
      formatSOL(claimedTotal);
  }

  if ($("totalRedeemed")) {

    $("totalRedeemed").textContent =
      formatSOL(redeemedTotal);
  }

  if ($("totalProceeds")) {

    $("totalProceeds").textContent =
      formatPeso(proceedsTotal);
  }

  if ($("totalExpenses")) {

    $("totalExpenses").textContent =
      formatPeso(expenseTotal);
  }
}


/* =========================================
   RENDER ALL
   ========================================= */

function renderAll() {

  renderClaimed();

  renderRedeemed();

  renderExpenses();

  renderAllocation();

  updateOverviewTotals();
}


/* =========================================
   STATUS
   ========================================= */

function setStatus(text) {

  const element =
    $("dataStatus");

  if (!element) return;

  element.textContent =
    text;

  if (
    text === "Data unavailable"
  ) {

    element.classList.add(
      "data-error"
    );

  } else {

    element.classList.remove(
      "data-error"
    );
  }
}


/* =========================================
   ERROR DISPLAY
   ========================================= */

function showDataError() {

  /*
   * IMPORTANT:
   * Do NOT erase already-loaded data.
   */

  if (
    state.claimed.length ||
    state.redeemed.length ||
    state.expenses.length ||
    state.allocation.leam.length ||
    state.allocation.cp.length ||
    state.allocation.project.length
  ) {

    return;
  }

  if ($("claimsTable")) {

    $("claimsTable").innerHTML = `
      <tr>
        <td colspan="2" class="data-error">
          Unable to load transparency data.
        </td>
      </tr>
    `;
  }

  if ($("expensesTable")) {

    $("expensesTable").innerHTML = `
      <tr>
        <td colspan="4" class="data-error">
          Unable to load transparency data.
        </td>
      </tr>
    `;
  }

  if ($("redeemedEmpty")) {

    $("redeemedEmpty").classList.remove(
      "hidden"
    );

    $("redeemedEmpty").innerHTML = `
      <div class="empty-icon">!</div>

      <strong>
        Unable to load reward sales.
      </strong>

      <p>
        Please check the live data source.
      </p>
    `;
  }
}


/* =========================================
   LATEST ENTRY
   ========================================= */

function parseFlexibleDate(value) {

  if (!value) {
    return null;
  }

  const text =
    String(value).trim();

  /*
   * Standard JS date.
   */

  let date =
    new Date(text);

  if (
    !Number.isNaN(
      date.getTime()
    )
  ) {

    return date;
  }

  /*
   * Handle:
   * Aug 8, 2026
   * Aug 08 2026
   */

  const match =
    text.match(
      /^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/
    );

  if (match) {

    date =
      new Date(
        `${match[1]} ${match[2]}, ${match[3]}`
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      return date;
    }
  }

  return null;
}


function updateLatestEntry() {

  const element =
    $("latestEntry");

  if (!element) return;

  const dates = [

    ...state.claimed.map(
      row => row.date
    ),

    ...state.redeemed.map(
      row => row.date
    ),

    ...state.expenses.map(
      row => row.date
    ),

    ...state.allocation.leam.map(
      row => row.date
    ),

    ...state.allocation.cp.map(
      row => row.date
    ),

    ...state.allocation.project.map(
      row => row.date
    )

  ].filter(Boolean);

  if (!dates.length) {

    element.textContent =
      "No records available yet.";

    return;
  }

  const parsedDates =
    dates
      .map(parseFlexibleDate)
      .filter(Boolean);

  if (!parsedDates.length) {

    element.textContent =
      "Latest transparency records available.";

    return;
  }

  const latest =
    new Date(
      Math.max(
        ...parsedDates.map(
          date =>
            date.getTime()
        )
      )
    );

  element.textContent =
    `Latest recorded activity: ${latest.toLocaleDateString(
      "en-PH",
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    )}`;
}


/* =========================================
   MOBILE ACCORDION
   ========================================= */

function setupAccordion() {

  const sections =
    document.querySelectorAll(
      "[data-accordion]"
    );

  sections.forEach(section => {

    const heading =
      section.querySelector(
        ".section-heading"
      );

    if (!heading) return;

    function toggle() {

      const isOpen =
        section.classList.contains(
          "open"
        );

      section.classList.toggle(
        "open",
        !isOpen
      );

      heading.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );
    }

    heading.addEventListener(
      "click",
      toggle
    );

    heading.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          toggle();
        }
      }
    );

  });
}


/* =========================================
   NAVIGATION
   ========================================= */

function setupNavigation() {

  const pills =
    document.querySelectorAll(
      ".pill-nav .pill"
    );

  pills.forEach(pill => {

    pill.addEventListener(
      "click",
      () => {

        pills.forEach(item =>
          item.classList.remove(
            "active"
          )
        );

        pill.classList.add(
          "active"
        );

        const targetId =
          pill.getAttribute(
            "href"
          );

        if (!targetId) return;

        const section =
          document.querySelector(
            targetId
          );

        if (
          section &&
          window.innerWidth <= 600
        ) {

          section.classList.add(
            "open"
          );

          const heading =
            section.querySelector(
              ".section-heading"
            );

          if (heading) {

            heading.setAttribute(
              "aria-expanded",
              "true"
            );
          }
        }
      }
    );
  });
}


/* =========================================
   DESKTOP / MOBILE
   ========================================= */

function syncAccordionState() {

  const sections =
    document.querySelectorAll(
      "[data-accordion]"
    );

  if (
    window.innerWidth > 600
  ) {

    sections.forEach(section => {

      section.classList.remove(
        "open"
      );

      const heading =
        section.querySelector(
          ".section-heading"
        );

      if (heading) {

        heading.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    });
  }
}


/* =========================================
   LOAD ONE SOURCE SAFELY
   ========================================= */

async function loadSource(
  sheetName
) {

  try {

    return await fetchSheet(
      sheetName
    );

  } catch (error) {

    console.error(
      `[Transparency] ${sheetName}:`,
      error
    );

    state.sourceErrors.push({
      sheet: sheetName,
      error: error.message
    });

    return [];
  }
}


/* =========================================
   DATA LOADING
   ========================================= */

async function loadData() {

  setStatus("Loading...");

  state.sourceErrors = [];

  try {

    /*
     * IMPORTANT:
     *
     * Promise.allSettled-style loading.
     *
     * One broken sheet no longer
     * destroys all the other data.
     */

    const [
      claimed,
      redeemed,
      expenses,
      allocation
    ] = await Promise.all([

      loadSource(
        SHEET_NAMES.claimed
      ),

      loadSource(
        SHEET_NAMES.redeemed
      ),

      loadSource(
        SHEET_NAMES.expenses
      ),

      loadSource(
        SHEET_NAMES.allocation
      )

    ]);


    /*
     * Normalize each source independently.
     */

    state.claimed =
      normalizeClaimed(
        claimed
      );

    state.redeemed =
      normalizeRedeemed(
        redeemed
      );

    state.expenses =
      normalizeExpenses(
        expenses
      );

    processAllocation(
      allocation
    );


    /*
     * Render whatever successfully
     * loaded.
     */

    renderAll();

    state.loaded = true;

    updateLatestEntry();


    /*
     * Status:
     *
     * All sources loaded:
     * Live
     *
     * Some sources loaded:
     * Partial data
     *
     * Nothing loaded:
     * Data unavailable
     */

    const totalRecords =
      state.claimed.length +
      state.redeemed.length +
      state.expenses.length +
      state.allocation.leam.length +
      state.allocation.cp.length +
      state.allocation.project.length;

    if (
      state.sourceErrors.length === 0
    ) {

      setStatus("Live");

    } else if (
      totalRecords > 0
    ) {

      setStatus("Live");

      console.warn(
        "[Transparency] Some sources failed:",
        state.sourceErrors
      );

    } else {

      setStatus(
        "Data unavailable"
      );

      showDataError();

      console.error(
        "[Transparency] All data sources failed:",
        state.sourceErrors
      );
    }

  } catch (error) {

    console.error(
      "Creator Reward Transparency:",
      error
    );

    setStatus(
      "Data unavailable"
    );

    showDataError();
  }
}


/* =========================================
   INITIALIZATION
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupAccordion();

    setupNavigation();

    syncAccordionState();

    loadData();

  }
);


/* =========================================
   RESIZE
   ========================================= */

let resizeTimer;

window.addEventListener(
  "resize",
  () => {

    clearTimeout(
      resizeTimer
    );

    resizeTimer =
      setTimeout(
        syncAccordionState,
        100
      );

  }
);


/* =========================================
   OPTIONAL REFRESH
   ========================================= */

window.GWTransparency = {

  reload: loadData,

  getState: () => ({
    ...state,
    allocation: {
      leam: [
        ...state.allocation.leam
      ],
      cp: [
        ...state.allocation.cp
      ],
      project: [
        ...state.allocation.project
      ]
    }
  })

};
