/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT.JS
   TARGETED FIX VERSION
   ========================================= */

"use strict";


/* =========================================
   CONFIG
   ========================================= */

const CONFIG = window.GWAR_CONFIG || {};

const SHEET_ID =
  CONFIG.sheetId || "";

const REWARD_SHEET =
  CONFIG.rewardSheet || "REWARD";

const ALLOCATION_SHEET =
  CONFIG.allocationSheet || "ALLOCATION";


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

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (typeof value === "number") {

    return Number.isFinite(value)
      ? value
      : 0;
  }

  let cleaned =
    String(value).trim();

  if (!cleaned) {
    return 0;
  }

  if (
    /^#(VALUE|REF|DIV\/0|N\/A|NAME|NUM|NULL|ERROR)!?$/i.test(cleaned)
  ) {
    return 0;
  }

  cleaned =
    cleaned
      .replace(/₱/g, "")
      .replace(/\$/g, "")
      .replace(/SOL/gi, "")
      .replace(/,/g, "")
      .replace(/%/g, "")
      .trim();

  const number =
    parseFloat(cleaned);

  return Number.isFinite(number)
    ? number
    : 0;
}


/* =========================================
   FORMATTERS
   ========================================= */

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

  return toNumber(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
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


/* =========================================
   DATE HELPERS
   ========================================= */

function parseDate(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (value instanceof Date) {

    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  const text =
    String(value).trim();

  if (!text) {
    return null;
  }

  /*
    Standard Google Sheets formats.
  */

  let match =
    text.match(
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/
    );

  if (match) {

    const first =
      Number(match[1]);

    const second =
      Number(match[2]);

    let year =
      Number(match[3]);

    if (year < 100) {
      year += 2000;
    }

    /*
      Primary assumption:
      MM/DD/YYYY
    */

    let date =
      new Date(
        year,
        first - 1,
        second
      );

    if (
      date.getFullYear() === year &&
      date.getMonth() === first - 1 &&
      date.getDate() === second
    ) {

      return date;
    }

    /*
      Fallback:
      DD/MM/YYYY
    */

    date =
      new Date(
        year,
        second - 1,
        first
      );

    if (
      date.getFullYear() === year &&
      date.getMonth() === second - 1 &&
      date.getDate() === first
    ) {

      return date;
    }
  }


  /*
    Google Visualization style:
    Date(2026,7,8)
  */

  match =
    text.match(
      /^Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)$/i
    );

  if (match) {

    const date =
      new Date(
        Number(match[1]),
        Number(match[2]),
        Number(match[3])
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date;
    }
  }


  /*
    Natural dates:
    Aug 8, 2026
    August 8, 2026
  */

  const parsed =
    new Date(text);

  if (
    !Number.isNaN(
      parsed.getTime()
    )
  ) {

    return parsed;
  }

  return null;
}


function formatDate(value) {

  const date =
    parseDate(value);

  if (!date) {

    return escapeHTML(
      value || ""
    );
  }

  /*
    Explicit formatting.

    This prevents the year from
    disappearing or depending on
    browser locale behavior.
  */

  const month =
    date.toLocaleString(
      "en-US",
      {
        month: "short"
      }
    );

  const day =
    date.getDate();

  const year =
    date.getFullYear();

  return `${month} ${day}, ${year}`;
}


/* =========================================
   CSV PARSER
   ========================================= */

function parseCSV(text) {

  const rows = [];

  let row = [];
  let cell = "";

  let insideQuotes =
    false;

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
      (char === "\n" ||
       char === "\r") &&
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

      rows.push(row);

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

    rows.push(row);
  }

  return rows;
}


/* =========================================
   GOOGLE SHEETS FETCH
   ========================================= */

async function fetchGoogleSheet(
  sheetName
) {

  if (!SHEET_ID) {

    throw new Error(
      "Google Sheet ID is missing from config.js."
    );
  }

  const url =
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
      SHEET_ID
    )}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      sheetName
    )}&_=${Date.now()}`;

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      12000
    );

  try {

    const response =
      await fetch(
        url,
        {
          method: "GET",
          cache: "no-store",
          signal: controller.signal
        }
      );

    if (!response.ok) {

      throw new Error(
        `Google Sheets returned ${response.status}.`
      );
    }

    const text =
      await response.text();

    if (
      !text ||
      !text.trim()
    ) {

      throw new Error(
        `${sheetName} returned empty data.`
      );
    }

    if (
      text.includes("<html") ||
      text.includes("<!DOCTYPE")
    ) {

      throw new Error(
        `${sheetName} is not publicly accessible.`
      );
    }

    return parseCSV(text);

  } finally {

    clearTimeout(timeout);
  }
}


/* =========================================
   REWARD SHEET
   ========================================= */

function processRewardSheet(rows) {

  const claimed = [];
  const redeemed = [];
  const expenses = [];

  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {

    return {
      claimed,
      redeemed,
      expenses
    };
  }

  for (
    let i = 2;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];


    /* CLAIMED */

    const claimedDate =
      row[0];

    const claimedSOL =
      toNumber(row[1]);

    if (
      claimedDate &&
      claimedSOL !== 0
    ) {

      claimed.push({
        date: claimedDate,
        sol: claimedSOL
      });
    }


    /* REDEEMED */

    const soldDate =
      row[3];

    const soldSOL =
      toNumber(row[4]);

    const soldRate =
      toNumber(row[5]);

    const soldUSD =
      toNumber(row[6]);

    const soldPeso =
      toNumber(row[7]);

    if (
      soldDate ||
      soldSOL !== 0 ||
      soldRate !== 0 ||
      soldUSD !== 0 ||
      soldPeso !== 0
    ) {

      redeemed.push({

        date: soldDate,

        sol: soldSOL,

        rate: soldRate,

        usd: soldUSD,

        peso: soldPeso

      });
    }


    /* EXPENSES */

    const expenseDate =
      row[9];

    const expenseDescription =
      row[10];

    const expenseAmount =
      toNumber(row[11]);

    const expenseRemarks =
      row[12];

    if (
      expenseDate ||
      expenseDescription ||
      expenseAmount !== 0 ||
      expenseRemarks
    ) {

      expenses.push({

        date:
          expenseDate,

        description:
          expenseDescription,

        amount:
          expenseAmount,

        remarks:
          expenseRemarks

      });
    }
  }

  return {
    claimed,
    redeemed,
    expenses
  };
}


/* =========================================
   ALLOCATION BLOCK READER
   ========================================= */

function findAllocationHeaderRow(
  rows,
  startColumn
) {

  if (!Array.isArray(rows)) {
    return -1;
  }

  for (
    let i = 0;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];

    const date =
      String(
        row[startColumn] ?? ""
      )
      .trim()
      .toUpperCase();

    const remarks =
      String(
        row[startColumn + 1] ?? ""
      )
      .trim()
      .toUpperCase();

    const incoming =
      String(
        row[startColumn + 2] ?? ""
      )
      .trim()
      .toUpperCase();

    const outgoing =
      String(
        row[startColumn + 3] ?? ""
      )
      .trim()
      .toUpperCase();

    if (
      date === "DATE" &&
      remarks === "REMARKS" &&
      incoming === "IN" &&
      outgoing === "OUT"
    ) {

      return i;
    }
  }

  return -1;
}


function readAllocationBlock(
  rows,
  startColumn
) {

  const result = [];

  const headerRow =
    findAllocationHeaderRow(
      rows,
      startColumn
    );

  if (headerRow === -1) {
    return result;
  }

  for (
    let i = headerRow + 1;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];

    const date =
      row[startColumn];

    const remarks =
      row[startColumn + 1];

    const inValue =
      toNumber(
        row[startColumn + 2]
      );

    const outValue =
      toNumber(
        row[startColumn + 3]
      );


    /*
      Skip completely empty rows.
    */

    if (
      !date &&
      !remarks &&
      inValue === 0 &&
      outValue === 0
    ) {
      continue;
    }


    /*
      Skip known non-transaction rows.
    */

    const dateText =
      String(
        date ?? ""
      )
      .trim()
      .toUpperCase();

    if (
      dateText === "DATE" ||
      dateText === "BALANCE" ||
      dateText === "TOTAL"
    ) {
      continue;
    }


    /*
      REAL TRANSACTION:
      date must be a valid date.

      This prevents percentage,
      balance and header rows from
      becoming transactions.
    */

    if (
      date &&
      parseDate(date)
    ) {

      result.push({

        date:
          date,

        remarks:
          remarks,

        in:
          inValue,

        out:
          outValue

      });
    }
  }

  return result;
}


/* =========================================
   TRANSPARENCY NOTE FINDER
   ========================================= */

function findTransparencyNote(rows) {

  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    return "";
  }


  /*
    First look for an obvious
    transparency-related cell.
  */

  for (
    let r = 0;
    r < Math.min(rows.length, 10);
    r++
  ) {

    const row =
      rows[r] || [];

    for (
      let c = 0;
      c < row.length;
      c++
    ) {

      const value =
        String(
          row[c] ?? ""
        ).trim();

      if (!value) {
        continue;
      }

      if (
        /transparency/i.test(value) &&
        value.length > 35
      ) {

        return value;
      }
    }
  }


  /*
    Common layout:
    A2 = note

    Also supports merged/shifted
    Google Sheets output.
  */

  for (
    let r = 0;
    r < Math.min(rows.length, 6);
    r++
  ) {

    const row =
      rows[r] || [];

    for (
      let c = 0;
      c < row.length;
      c++
    ) {

      const value =
        String(
          row[c] ?? ""
        ).trim();

      if (
        value &&
        value.length > 45 &&
        !/^DATE$/i.test(value)
      ) {

        return value;
      }
    }
  }


  return "";
}


/* =========================================
   ALLOCATION SHEET
   ========================================= */

function processAllocationSheet(rows) {

  const result = {

    leam: [],

    cp: [],

    project: [],

    note: ""

  };

  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    return result;
  }


  /*
    IMPORTANT:

    Read each block independently.

    LEAM  = A:D
    CP    = F:I
    PROJECT = K:N
  */

  result.leam =
    readAllocationBlock(
      rows,
      0
    );

  result.cp =
    readAllocationBlock(
      rows,
      5
    );

  result.project =
    readAllocationBlock(
      rows,
      10
    );


  result.note =
    findTransparencyNote(
      rows
    );


  return result;
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
   RENDER CLAIMED
   ========================================= */

function renderClaimed() {

  const table =
    $("claimsTable");

  if (!table) {
    return;
  }

  const rows =
    state.claimed;

  const count =
    $("claimedCount");

  const totalElement =
    $("claimsTotal");

  const summaryElement =
    $("totalClaimed");


  if (count) {

    count.textContent =
      `${rows.length} ${
        rows.length === 1
          ? "record"
          : "records"
      }`;
  }


  if (!rows.length) {

    table.innerHTML = `
      <tr>
        <td colspan="2">
          No Creator Reward claims recorded yet.
        </td>
      </tr>
    `;

    if (totalElement) {
      totalElement.textContent =
        formatSOL(0);
    }

    if (summaryElement) {
      summaryElement.textContent =
        formatSOL(0);
    }

    return;
  }


  table.innerHTML =
    rows.map(row => `
      <tr>

        <td>
          ${formatDate(row.date)}
        </td>

        <td class="num">
          ${formatSOL(row.sol)}
        </td>

      </tr>
    `).join("");


  const total =
    rows.reduce(
      (sum, row) =>
        sum + toNumber(row.sol),
      0
    );


  if (totalElement) {

    totalElement.textContent =
      formatSOL(total);
  }

  if (summaryElement) {

    summaryElement.textContent =
      formatSOL(total);
  }
}


/* =========================================
   RENDER REDEEMED
   ========================================= */

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

  const count =
    $("redeemedCount");

  if (count) {

    count.textContent =
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

    if ($("redeemedTotal")) {
      $("redeemedTotal").textContent =
        formatSOL(0);
    }

    if ($("proceedsTotal")) {
      $("proceedsTotal").textContent =
        formatPeso(0);
    }

    if ($("totalRedeemed")) {
      $("totalRedeemed").textContent =
        formatSOL(0);
    }

    if ($("totalProceeds")) {
      $("totalProceeds").textContent =
        formatPeso(0);
    }

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
          ${formatDate(row.date)}
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


  const totalSOL =
    rows.reduce(
      (sum, row) =>
        sum + toNumber(row.sol),
      0
    );

  const totalPeso =
    rows.reduce(
      (sum, row) =>
        sum + toNumber(row.peso),
      0
    );


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
   RENDER EXPENSES
   ========================================= */

function renderExpenses() {

  const table =
    $("expensesTable");

  if (!table) {
    return;
  }

  const rows =
    state.expenses;

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

    if ($("expensesTotal")) {
      $("expensesTotal").textContent =
        formatPeso(0);
    }

    if ($("totalExpenses")) {
      $("totalExpenses").textContent =
        formatPeso(0);
    }

    return;
  }


  table.innerHTML =
    rows.map(row => `
      <tr>

        <td>
          ${formatDate(row.date)}
        </td>

        <td>
          ${escapeHTML(
            row.description || ""
          )}
        </td>

        <td class="num">
          ${formatPeso(row.amount)}
        </td>

        <td>
          ${escapeHTML(
            row.remarks || ""
          )}
        </td>

      </tr>
    `).join("");


  const total =
    rows.reduce(
      (sum, row) =>
        sum + toNumber(row.amount),
      0
    );


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
   RENDER ALLOCATION CARD
   ========================================= */

function renderAllocationCard(key) {

  const rows =
    state.allocation[key] || [];

  const prefix =
    key;


  const inTotal =
    rows.reduce(
      (sum, row) =>
        sum + toNumber(row.in),
      0
    );

  const outTotal =
    rows.reduce(
      (sum, row) =>
        sum + toNumber(row.out),
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


  const inElement =
    $(`${prefix}In`);

  const outElement =
    $(`${prefix}Out`);

  const balanceElement =
    $(`${prefix}Balance`);


  if (inElement) {

    inElement.textContent =
      formatPeso(inTotal);
  }

  if (outElement) {

    outElement.textContent =
      formatPeso(outTotal);
  }

  if (balanceElement) {

    balanceElement.textContent =
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
          ${formatDate(row.date)}
        </span>

        <span>
          ${escapeHTML(
            row.remarks || ""
          )}
        </span>

        <strong>
          ${
            toNumber(row.in) !== 0
              ? formatPeso(row.in)
              : "—"
          }
        </strong>

        <strong>
          ${
            toNumber(row.out) !== 0
              ? formatPeso(row.out)
              : "—"
          }
        </strong>

      </div>
    `).join("");
}


/* =========================================
   ALLOCATION PERCENTAGES
   ========================================= */

function getAllocationPercentages(
  rows
) {

  const defaults = {

    leam: 30,

    cp: 30,

    project: 40

  };


  if (
    !Array.isArray(rows)
  ) {
    return defaults;
  }


  /*
    Find the percentage row dynamically.

    Looks for the first row containing
    usable values in A, F and K.
  */

  let percentageRow =
    null;


  for (
    let i = 0;
    i < Math.min(rows.length, 10);
    i++
  ) {

    const row =
      rows[i] || [];

    const leam =
      toNumber(row[0]);

    const cp =
      toNumber(row[5]);

    const project =
      toNumber(row[10]);


    if (
      leam > 0 &&
      cp > 0 &&
      project > 0
    ) {

      percentageRow =
        row;

      break;
    }
  }


  if (!percentageRow) {
    return defaults;
  }


  let leam =
    toNumber(
      percentageRow[0]
    );

  let cp =
    toNumber(
      percentageRow[5]
    );

  let project =
    toNumber(
      percentageRow[10]
    );


  if (
    leam > 0 &&
    leam <= 1
  ) {
    leam *= 100;
  }

  if (
    cp > 0 &&
    cp <= 1
  ) {
    cp *= 100;
  }

  if (
    project > 0 &&
    project <= 1
  ) {
    project *= 100;
  }


  if (
    leam <= 0 ||
    !Number.isFinite(leam)
  ) {
    leam =
      defaults.leam;
  }

  if (
    cp <= 0 ||
    !Number.isFinite(cp)
  ) {
    cp =
      defaults.cp;
  }

  if (
    project <= 0 ||
    !Number.isFinite(project)
  ) {
    project =
      defaults.project;
  }


  return {

    leam,

    cp,

    project

  };
}


/* =========================================
   TRANSPARENCY NOTE
   ========================================= */

function renderTransparencyNote() {

  const fallback =
    "Creator Reward funds are allocated across direct support, cerebral palsy support, and Gentle Warrior projects.";

  const note =
    state.note ||
    fallback;


  /*
    Existing IDs.
  */

  const targets = [

    $("allocationNote"),

    $("transparencyNote"),

    $("statementNote")

  ].filter(Boolean);


  targets.forEach(
    element => {

      element.textContent =
        note;

      element.classList.remove(
        "hidden"
      );

      element.style.display =
        "";
    }
  );


  /*
    If the existing HTML does not have
    a transparency-note element, create
    one automatically inside the
    Fund Allocation section.

    This prevents the note from
    disappearing because of a missing ID.
  */

  if (!targets.length) {

    const allocationSection =
      document.querySelector(
        '[data-accordion]:has(#leamRecords)'
      ) ||
      document.querySelector(
        '[data-accordion]'
      );


    if (allocationSection) {

      const heading =
        allocationSection.querySelector(
          ".section-heading"
        );


      const noteElement =
        document.createElement(
          "div"
        );

      noteElement.className =
        "transparency-note";

      noteElement.textContent =
        note;


      if (heading) {

        heading.insertAdjacentElement(
          "afterend",
          noteElement
        );

      } else {

        allocationSection.prepend(
          noteElement
        );
      }
    }
  }
}


/* =========================================
   RENDER ALLOCATION
   ========================================= */

function renderAllocation(
  allocationRows
) {

  renderAllocationCard(
    "leam"
  );

  renderAllocationCard(
    "cp"
  );

  renderAllocationCard(
    "project"
  );


  const percentages =
    getAllocationPercentages(
      allocationRows
    );


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


  const totalPercentage =
    percentages.leam +
    percentages.cp +
    percentages.project;


  if ($("allocationTotalPercentage")) {

    $("allocationTotalPercentage").textContent =
      `${totalPercentage}%`;
  }


  renderTransparencyNote();
}


/* =========================================
   RENDER ALL
   ========================================= */

function renderAll(
  allocationRows
) {

  renderClaimed();

  renderRedeemed();

  renderExpenses();

  renderAllocation(
    allocationRows
  );
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


  const parsed =
    dates
      .map(parseDate)
      .filter(Boolean);


  if (!parsed.length) {

    element.textContent =
      "Latest transparency records available.";

    return;
  }


  const latest =
    new Date(
      Math.max(
        ...parsed.map(
          date =>
            date.getTime()
        )
      )
    );


  element.textContent =
    `Latest recorded activity: ${formatDate(
      latest
    )}`;
}


/* =========================================
   STATUS
   ========================================= */

function setStatus(text) {

  const element =
    $("dataStatus");

  if (!element) {
    return;
  }


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
   DATA ERROR
   ========================================= */

function showDataError(
  error
) {

  console.error(
    "Creator Reward Transparency:",
    error
  );


  if ($("latestEntry")) {

    $("latestEntry").textContent =
      "Unable to load live transparency records.";
  }


  if ($("claimsTable")) {

    $("claimsTable").innerHTML = `
      <tr>
        <td
          colspan="2"
          class="data-error"
        >
          Unable to load Creator Reward data.
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
          Unable to load expense data.
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
        Please check the Google Sheet connection.
      </p>
    `;
  }


  if ($("redeemedWrap")) {

    $("redeemedWrap").classList.add(
      "hidden"
    );
  }
}


/* =========================================
   TABLE HORIZONTAL SCROLL
   ========================================= */

function setupTableScroll() {

  const tables =
    document.querySelectorAll(
      "table"
    );


  tables.forEach(
    table => {

      /*
        Do not wrap the same table twice.
      */

      if (
        table.parentElement &&
        table.parentElement.classList.contains(
          "table-scroll"
        )
      ) {
        return;
      }


      const wrapper =
        document.createElement(
          "div"
        );

      wrapper.className =
        "table-scroll";


      table.parentNode.insertBefore(
        wrapper,
        table
      );

      wrapper.appendChild(
        table
      );
    }
  );
}


/* =========================================
   MOBILE ACCORDION
   ========================================= */

function setupAccordion() {

  const sections =
    document.querySelectorAll(
      "[data-accordion]"
    );


  sections.forEach(
    section => {

      const heading =
        section.querySelector(
          ".section-heading"
        );


      if (!heading) {
        return;
      }


      heading.setAttribute(
        "role",
        "button"
      );

      heading.setAttribute(
        "tabindex",
        "0"
      );


      function updateIcon() {

        const isOpen =
          section.classList.contains(
            "open"
          );

        heading.setAttribute(
          "aria-expanded",
          String(isOpen)
        );

        /*
          CSS uses this value for
          the visible + / − indicator.
        */

        heading.setAttribute(
          "data-accordion-icon",
          isOpen
            ? "−"
            : "+"
        );
      }


      function toggle() {

        const isOpen =
          section.classList.contains(
            "open"
          );


        section.classList.toggle(
          "open",
          !isOpen
        );


        updateIcon();
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


      updateIcon();

    }
  );
}


/* =========================================
   NAVIGATION
   ========================================= */

function setupNavigation() {

  const pills =
    document.querySelectorAll(
      ".pill-nav .pill"
    );


  pills.forEach(
    pill => {

      pill.addEventListener(
        "click",
        () => {

          pills.forEach(
            item =>
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

              heading.setAttribute(
                "data-accordion-icon",
                "−"
              );
            }
          }
        }
      );
    }
  );
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

    sections.forEach(
      section => {

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

          heading.setAttribute(
            "data-accordion-icon",
            ""
          );
        }
      }
    );

  } else {

    sections.forEach(
      section => {

        const heading =
          section.querySelector(
            ".section-heading"
          );


        if (!heading) {
          return;
        }


        const isOpen =
          section.classList.contains(
            "open"
          );


        heading.setAttribute(
          "aria-expanded",
          String(isOpen)
        );

        heading.setAttribute(
          "data-accordion-icon",
          isOpen
            ? "−"
            : "+"
        );
      }
    );
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

    setupTableScroll();

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
   LOAD DATA
   ========================================= */

async function loadData() {

  setStatus(
    "Loading..."
  );


  try {

    if (!SHEET_ID) {

      throw new Error(
        "Missing sheetId in config.js."
      );
    }


    const [
      rewardRows,
      allocationRows
    ] =
      await Promise.all([

        fetchGoogleSheet(
          REWARD_SHEET
        ),

        fetchGoogleSheet(
          ALLOCATION_SHEET
        )

      ]);


    const rewardData =
      processRewardSheet(
        rewardRows
      );


    state.claimed =
      rewardData.claimed;

    state.redeemed =
      rewardData.redeemed;

    state.expenses =
      rewardData.expenses;


    const allocationData =
      processAllocationSheet(
        allocationRows
      );


    state.allocation.leam =
      allocationData.leam;

    state.allocation.cp =
      allocationData.cp;

    state.allocation.project =
      allocationData.project;

    state.note =
      allocationData.note;


    renderAll(
      allocationRows
    );


    state.loaded =
      true;


    setStatus(
      "● Live Google Sheet data"
    );


    updateLatestEntry();


    console.log(
      "Creator Reward Transparency loaded:",
      {

        claimed:
          state.claimed.length,

        redeemed:
          state.redeemed.length,

        expenses:
          state.expenses.length,

        leam:
          state.allocation.leam.length,

        cp:
          state.allocation.cp.length,

        project:
          state.allocation.project.length,

        transparencyNote:
          state.note

      }
    );


  } catch (error) {

    state.loaded =
      false;


    setStatus(
      "Data unavailable"
    );


    showDataError(
      error
    );
  }
         }
