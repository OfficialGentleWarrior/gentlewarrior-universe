/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   UPDATED DATA LOADER
   ========================================= */

"use strict";


/* =========================================
   CONFIG
   ========================================= */

const CONFIG =
  window.GW_CONFIG ||
  window.CONFIG ||
  {};

const SHEET_URL =
  CONFIG.sheetUrl ||
  CONFIG.SHEET_URL ||
  "";

const SHEET_ID =
  CONFIG.sheetId ||
  CONFIG.SHEET_ID ||
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
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  const cleaned =
    String(value)
      .replace(/₱/g, "")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/SOL/gi, "")
      .replace(/PHP/gi, "")
      .trim();

  const number =
    parseFloat(cleaned);

  return Number.isFinite(number)
    ? number
    : 0;
}


function formatSOL(value) {
  return `${toNumber(value).toFixed(2)} SOL`;
}


function formatPeso(value) {
  return `₱${toNumber(value).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )}`;
}


function formatUSD(value) {
  return `$${toNumber(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )}`;
}


function formatRate(value) {

  const number =
    toNumber(value);

  if (!number) {
    return "—";
  }

  return `$${number.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )}`;
}


function normalizeKey(value) {

  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[_-]/g, " ");
}


function getField(row, names) {

  const keys =
    Object.keys(row || {});

  for (const name of names) {

    const target =
      normalizeKey(name);

    const key =
      keys.find(
        key =>
          normalizeKey(key) === target
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
    "DATE"
  ]);
}


function getDescription(row) {

  return getField(row, [
    "Description",
    "description",
    "DESCRIPTION",
    "Item",
    "Purpose"
  ]);
}


function getRemarks(row) {

  return getField(row, [
    "Remarks",
    "remarks",
    "REMARKS",
    "Remark",
    "Notes",
    "Note"
  ]);
}


/* =========================================
   DATA STATE
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

  loaded: false

};


/* =========================================
   CSV PARSER
   ========================================= */

function parseCSV(text) {

  const rows = [];

  let row = [];
  let cell = "";

  let insideQuotes = false;

  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const char =
      text[i];

    const next =
      text[i + 1];


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

      insideQuotes =
        !insideQuotes;

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
            String(value)
              .trim() !== ""
        )
      ) {

        rows.push(row);
      }


      row = [];

      continue;
    }


    cell += char;
  }


  if (
    cell !== "" ||
    row.length
  ) {

    row.push(cell);

    if (
      row.length > 1 ||
      row.some(
        value =>
          String(value)
            .trim() !== ""
      )
    ) {

      rows.push(row);
    }
  }


  return rows;
}


/* =========================================
   ROWS TO OBJECTS
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
        String(header || "")
          .trim()
    );


  return rows
    .slice(1)

    .filter(row =>
      row.some(
        value =>
          String(value ?? "")
            .trim() !== ""
      )
    )

    .map(row => {

      const object = {};

      headers.forEach(
        (header, index) => {

          if (!header) {
            return;
          }

          object[header] =
            row[index] ?? "";

        }
      );

      return object;

    });
}


/* =========================================
   DETECT GOOGLE SHEETS URL
   ========================================= */

function extractSpreadsheetId(url) {

  if (!url) {
    return "";
  }


  const match =
    String(url).match(
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
    );


  return match
    ? match[1]
    : "";
}


/* =========================================
   DIRECT GOOGLE SHEETS CSV
   ========================================= */

async function fetchGoogleSheetByName(
  sheetName
) {

  const spreadsheetId =
    SHEET_ID ||
    extractSpreadsheetId(
      SHEET_URL
    );


  if (!spreadsheetId) {

    throw new Error(
      "Google Spreadsheet ID not found."
    );
  }


  /*
     If a GID is supplied in CONFIG,
     use the faster CSV export.
  */

  const gid =
    SHEET_GIDS[sheetName] ??
    SHEET_GIDS[
      sheetName.toLowerCase()
    ];


  if (
    gid !== undefined &&
    gid !== null &&
    String(gid).trim() !== ""
  ) {

    const url =
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${encodeURIComponent(gid)}`;


    const response =
      await fetch(
        url,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `Unable to load ${sheetName} from Google Sheets.`
      );
    }


    const text =
      await response.text();


    const rows =
      parseCSV(text);


    const objects =
      rowsToObjects(rows);


    if (objects.length) {
      return objects;
    }
  }


  /*
     Fallback:
     Google Visualization endpoint.
     This loads by SHEET NAME, so a GID
     is not required.
  */

  const queryUrl =
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;


  const response =
    await fetch(
      queryUrl,
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `Unable to load ${sheetName}.`
    );
  }


  const text =
    await response.text();


  const objects =
    rowsToObjects(
      parseCSV(text)
    );


  return objects;
}


/* =========================================
   CONFIGURED ENDPOINT
   ========================================= */

async function fetchConfiguredSheet(
  sheetName
) {

  if (!SHEET_URL) {

    throw new Error(
      "Google Sheet URL is not configured."
    );
  }


  const separator =
    SHEET_URL.includes("?")
      ? "&"
      : "?";


  const url =
    `${SHEET_URL}${separator}sheet=${encodeURIComponent(sheetName)}`;


  const response =
    await fetch(
      url,
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `Unable to load ${sheetName}.`
    );
  }


  const text =
    await response.text();


  /*
     Some endpoints return JSON
     instead of CSV.
  */

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";


  if (
    contentType.includes(
      "application/json"
    )
  ) {

    try {

      const json =
        JSON.parse(text);


      if (Array.isArray(json)) {
        return json;
      }


      if (
        Array.isArray(json.data)
      ) {
        return json.data;
      }


      if (
        Array.isArray(json.rows)
      ) {
        return json.rows;
      }

    } catch (error) {

      console.warn(
        "JSON parsing failed:",
        error
      );
    }
  }


  return rowsToObjects(
    parseCSV(text)
  );
}


/* =========================================
   UNIVERSAL SHEET FETCH
   ========================================= */

async function fetchSheet(
  sheetName
) {

  /*
     If SHEET_URL points directly to
     a Google Spreadsheet, use Google
     Sheets directly.

     This avoids relying on:
     ?sheet=Claimed
  */

  const spreadsheetId =
    SHEET_ID ||
    extractSpreadsheetId(
      SHEET_URL
    );


  if (spreadsheetId) {

    try {

      const rows =
        await fetchGoogleSheetByName(
          sheetName
        );


      if (rows.length) {

        console.log(
          `[GW] ${sheetName}: ${rows.length} records`
        );

        return rows;
      }

    } catch (error) {

      console.warn(
        `[GW] Direct Google Sheet load failed for ${sheetName}:`,
        error
      );

    }
  }


  /*
     Fallback to the existing
     configured endpoint.
  */

  try {

    const rows =
      await fetchConfiguredSheet(
        sheetName
      );


    console.log(
      `[GW] Endpoint ${sheetName}: ${rows.length} records`
    );


    return rows;

  } catch (error) {

    console.error(
      `[GW] Failed to load ${sheetName}:`,
      error
    );


    throw error;
  }
}


/* =========================================
   CLAIMED
   ========================================= */

function normalizeClaimed(rows) {

  return rows.map(row => ({

    date:
      getDate(row),

    sol:
      toNumber(
        getField(row, [
          "SOL Claimed",
          "SOL CLAIMED",
          "SOL",
          "Claimed",
          "Amount"
        ])
      )

  }));
}


function renderClaimed() {

  const table =
    $("claimsTable");


  if (!table) {
    return;
  }


  const rows =
    state.claimed;


  if (!rows.length) {

    table.innerHTML = `
      <tr>
        <td colspan="2">
          No Creator Reward claims recorded yet.
        </td>
      </tr>
    `;


    $("claimsTotal").textContent =
      formatSOL(0);


    $("claimedCount").textContent =
      "0 records";


    $("totalClaimed").textContent =
      formatSOL(0);


    return;
  }


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


  const total =
    rows.reduce(
      (sum, row) =>
        sum + row.sol,
      0
    );


  $("claimsTotal").textContent =
    formatSOL(total);


  $("totalClaimed").textContent =
    formatSOL(total);


  $("claimedCount").textContent =
    `${rows.length} ${
      rows.length === 1
        ? "record"
        : "records"
    }`;
}


/* =========================================
   REDEEMED
   ========================================= */

function normalizeRedeemed(rows) {

  return rows.map(row => ({

    date:
      getDate(row),

    sol:
      toNumber(
        getField(row, [
          "Sold SOL",
          "SOL Sold",
          "SOLD SOL",
          "Sold",
          "SOL"
        ])
      ),

    rate:
      toNumber(
        getField(row, [
          "Rate",
          "RATE",
          "SOL Rate",
          "USD Rate"
        ])
      ),

    usd:
      toNumber(
        getField(row, [
          "$",
          "USD",
          "USD Amount",
          "Dollar"
        ])
      ),

    peso:
      toNumber(
        getField(row, [
          "In Peso",
          "IN PESO",
          "Peso",
          "PHP",
          "PHP Amount"
        ])
      )

  }));
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


  $("redeemedCount").textContent =
    `${rows.length} ${
      rows.length === 1
        ? "record"
        : "records"
    }`;


  if (!rows.length) {

    empty.classList.remove(
      "hidden"
    );

    wrap.classList.add(
      "hidden"
    );


    $("redeemedTotal").textContent =
      formatSOL(0);


    $("proceedsTotal").textContent =
      formatPeso(0);


    $("totalRedeemed").textContent =
      formatSOL(0);


    $("totalProceeds").textContent =
      formatPeso(0);


    return;
  }


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
          ${row.sol.toFixed(2)} SOL
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


  $("redeemedTotal").textContent =
    formatSOL(totalSOL);


  $("proceedsTotal").textContent =
    formatPeso(totalPeso);


  $("totalRedeemed").textContent =
    formatSOL(totalSOL);


  $("totalProceeds").textContent =
    formatPeso(totalPeso);
}


/* =========================================
   EXPENSES
   ========================================= */

function normalizeExpenses(rows) {

  return rows.map(row => ({

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
          "PHP",
          "Cost"
        ])
      ),

    remarks:
      getRemarks(row)

  }));
}


function renderExpenses() {

  const table =
    $("expensesTable");


  if (!table) {
    return;
  }


  const rows =
    state.expenses;


  $("expenseCount").textContent =
    `${rows.length} ${
      rows.length === 1
        ? "record"
        : "records"
    }`;


  if (!rows.length) {

    table.innerHTML = `
      <tr>
        <td colspan="4">
          No expenses recorded yet.
        </td>
      </tr>
    `;


    $("expensesTotal").textContent =
      formatPeso(0);


    $("totalExpenses").textContent =
      formatPeso(0);


    return;
  }


  table.innerHTML =
    rows.map(row => `

      <tr>

        <td>
          ${escapeHTML(row.date)}
        </td>

        <td>
          ${escapeHTML(
            row.description
          )}
        </td>

        <td class="num">
          ${formatPeso(
            row.amount
          )}
        </td>

        <td>
          ${escapeHTML(
            row.remarks
          )}
        </td>

      </tr>

    `).join("");


  const total =
    rows.reduce(
      (sum, row) =>
        sum + row.amount,
      0
    );


  $("expensesTotal").textContent =
    formatPeso(total);


  $("totalExpenses").textContent =
    formatPeso(total);
}


/* =========================================
   ALLOCATION
   ========================================= */

function normalizeAllocation(rows) {

  return rows.map(row => ({

    date:
      getDate(row),

    fund:
      normalizeKey(
        getField(row, [
          "Fund",
          "FUND",
          "Allocation",
          "Category",
          "Account"
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
          "Incoming"
        ])
      ),

    out:
      toNumber(
        getField(row, [
          "OUT",
          "Out",
          "Amount Out",
          "Outgoing"
        ])
      )

  }));
}


function resolveAllocationFund(
  fund
) {

  const value =
    normalizeKey(fund);


  if (
    value.includes("leam")
  ) {
    return "leam";
  }


  if (
    value.includes("cp") ||
    value.includes("cerebral") ||
    value.includes("palsy")
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


function renderAllocationCard(
  key
) {

  const rows =
    state.allocation[key] ||
    [];


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


  $(`${prefix}In`).textContent =
    formatPeso(inTotal);


  $(`${prefix}Out`).textContent =
    formatPeso(outTotal);


  $(`${prefix}Balance`).textContent =
    formatPeso(balance);


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

  renderAllocationCard(
    "leam"
  );

  renderAllocationCard(
    "cp"
  );

  renderAllocationCard(
    "project"
  );


  const percentages = {

    leam: 30,

    cp: 30,

    project: 40

  };


  $("leamPercentage").textContent =
    `${percentages.leam}%`;


  $("cpPercentage").textContent =
    `${percentages.cp}%`;


  $("projectPercentage").textContent =
    `${percentages.project}%`;


  $("allocationTotalPercentage").textContent =
    `${
      percentages.leam +
      percentages.cp +
      percentages.project
    }%`;


  if ($("allocationNote")) {

    $("allocationNote").textContent =
      state.note ||
      "Creator Reward funds are allocated across direct support, cerebral palsy support, and Gentle Warrior projects.";

  }
}


/* =========================================
   ALLOCATION SOURCE
   ========================================= */

function processAllocation(
  rows
) {

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


    if (!key) {
      return;
    }


    state.allocation[key].push(
      row
    );

  });
}


/* =========================================
   DATA LOADING
   ========================================= */

async function loadData() {

  setStatus(
    "Loading..."
  );


  try {

    /*
       Load every sheet independently.

       This is intentional.

       If one sheet has an issue,
       the other valid sheets are
       still allowed to load.
    */

    const results =
      await Promise.allSettled([

        fetchSheet(
          SHEET_NAMES.claimed
        ),

        fetchSheet(
          SHEET_NAMES.redeemed
        ),

        fetchSheet(
          SHEET_NAMES.expenses
        ),

        fetchSheet(
          SHEET_NAMES.allocation
        )

      ]);


    const [
      claimedResult,
      redeemedResult,
      expensesResult,
      allocationResult
    ] = results;


    /*
       CLAIMED
    */

    if (
      claimedResult.status ===
      "fulfilled"
    ) {

      console.log(
        "[GW] Claimed loaded:",
        claimedResult.value
      );


      state.claimed =
        normalizeClaimed(
          claimedResult.value
        );

    } else {

      console.error(
        "[GW] Claimed failed:",
        claimedResult.reason
      );

      state.claimed = [];

    }


    /*
       REDEEMED
    */

    if (
      redeemedResult.status ===
      "fulfilled"
    ) {

      console.log(
        "[GW] Redeemed loaded:",
        redeemedResult.value
      );


      state.redeemed =
        normalizeRedeemed(
          redeemedResult.value
        );

    } else {

      console.error(
        "[GW] Redeemed failed:",
        redeemedResult.reason
      );

      state.redeemed = [];

    }


    /*
       EXPENSES
    */

    if (
      expensesResult.status ===
      "fulfilled"
    ) {

      console.log(
        "[GW] Expenses loaded:",
        expensesResult.value
      );


      state.expenses =
        normalizeExpenses(
          expensesResult.value
        );

    } else {

      console.error(
        "[GW] Expenses failed:",
        expensesResult.reason
      );

      state.expenses = [];

    }


    /*
       ALLOCATION
    */

    if (
      allocationResult.status ===
      "fulfilled"
    ) {

      console.log(
        "[GW] Allocation loaded:",
        allocationResult.value
      );


      processAllocation(
        allocationResult.value
      );

    } else {

      console.error(
        "[GW] Allocation failed:",
        allocationResult.reason
      );

      processAllocation([]);

    }


    renderAll();


    /*
       Check whether at least one
       source successfully returned data.
    */

    const successful =
      results.filter(
        result =>
          result.status ===
          "fulfilled"
      );


    const hasData =
      state.claimed.length ||
      state.redeemed.length ||
      state.expenses.length ||
      state.allocation.leam.length ||
      state.allocation.cp.length ||
      state.allocation.project.length;


    state.loaded = true;


    if (hasData) {

      setStatus("Live");

    } else if (
      successful.length > 0
    ) {

      setStatus(
        "No records"
      );

    } else {

      setStatus(
        "Data unavailable"
      );

      showDataError();

    }


    updateLatestEntry();


    console.log(
      "[GW] Final state:",
      state
    );

  } catch (error) {

    console.error(
      "Creator Reward Transparency:",
      error
    );


    state.loaded = false;

    setStatus(
      "Data unavailable"
    );

    showDataError();

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

}


/* =========================================
   STATUS
   ========================================= */

function setStatus(
  text
) {

  const element =
    $("dataStatus");


  if (!element) {
    return;
  }


  element.textContent =
    text;


  if (
    text ===
    "Data unavailable"
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
   DATA ERROR
   ========================================= */

function showDataError() {

  const message =
    "Unable to load transparency data.";


  if ($("claimsTable")) {

    $("claimsTable").innerHTML = `

      <tr>

        <td
          colspan="2"
          class="data-error"
        >
          ${message}
        </td>

      </tr>

    `;

  }


  if ($("expensesTable")) {

    $("expensesTable").innerHTML = `

      <tr>

        <td
          colspan="4"
          class="data-error"
        >
          ${message}
        </td>

      </tr>

    `;

  }


  if ($("redeemedEmpty")) {

    $("redeemedEmpty")
      .classList
      .remove("hidden");


    $("redeemedEmpty").innerHTML = `

      <div class="empty-icon">
        !
      </div>

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

function updateLatestEntry() {

  const element =
    $("latestEntry");


  if (!element) {
    return;
  }


  const dates = [

    ...state.claimed
      .map(row => row.date),

    ...state.redeemed
      .map(row => row.date),

    ...state.expenses
      .map(row => row.date),

    ...state.allocation.leam
      .map(row => row.date),

    ...state.allocation.cp
      .map(row => row.date),

    ...state.allocation.project
      .map(row => row.date)

  ].filter(Boolean);


  if (!dates.length) {

    element.textContent =
      "No records available yet.";

    return;
  }


  const parsedDates =
    dates

      .map(date => {

        /*
           Handle Google Sheets date
           values more safely.
        */

        const parsed =
          new Date(date);

        return parsed;

      })

      .filter(date =>
        !Number.isNaN(
          date.getTime()
        )
      );


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
    `Latest recorded activity: ${
      latest.toLocaleDateString(
        "en-PH",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      )
    }`;
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


    if (!heading) {
      return;
    }


    heading.setAttribute(
      "tabindex",
      "0"
    );


    heading.setAttribute(
      "role",
      "button"
    );


    heading.setAttribute(
      "aria-expanded",
      "false"
    );


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


        if (!targetId) {
          return;
        }


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
   DESKTOP / MOBILE STATE
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
