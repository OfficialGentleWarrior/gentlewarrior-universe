/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT.JS
   FIXED VERSION
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


  /*
    Ignore Google Sheets errors.
  */

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


/*
  IMPORTANT:

  USD amount intentionally has NO $
  because this column represents
  the USD amount used for conversion.

  Example:
  62.50

  NOT:
  $62.50
*/

function formatUSD(value) {

  return toNumber(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}


/*
  SOL/USD rate keeps the $ sign.

  Example:
  $105.00
*/

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
    Supports:

    8/8/2026
    08/08/2026
    2026-08-08
    Aug 8, 2026
    Aug 8

    IMPORTANT:
    Google Sheets may export a date
    using the cell's display format.

    Example:

    Aug 30

    JavaScript can interpret
    "Aug 30" as August 30, 2001.

    FIX:
    If the year is missing,
    explicitly use the current year.
  */


  /* -------------------------------------
     MM/DD/YYYY
     MM-DD-YYYY
  ------------------------------------- */

  let match =
    text.match(
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
    );


  if (match) {

    const month =
      Number(match[1]) - 1;

    const day =
      Number(match[2]);

    const year =
      Number(match[3]);


    const date =
      new Date(
        year,
        month,
        day
      );


    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {

      return date;
    }
  }


  /* -------------------------------------
     YYYY-MM-DD
  ------------------------------------- */

  match =
    text.match(
      /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/
    );


  if (match) {

    const year =
      Number(match[1]);

    const month =
      Number(match[2]) - 1;

    const day =
      Number(match[3]);


    const date =
      new Date(
        year,
        month,
        day
      );


    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {

      return date;
    }
  }


  /* -------------------------------------
     MONTH DAY, YEAR
     Example:

     Aug 30, 2026
  ------------------------------------- */

  match =
    text.match(
      /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/
    );


  if (match) {

    const monthName =
      match[1];

    const day =
      Number(match[2]);

    const year =
      Number(match[3]);


    const date =
      new Date(
        `${monthName} ${day}, ${year}`
      );


    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      return date;
    }
  }


  /* -------------------------------------
     MONTH DAY WITHOUT YEAR
     
     Example:
     Aug 30

     FIX:
     Force current year.
  ------------------------------------- */

  match =
    text.match(
      /^([A-Za-z]+)\s+(\d{1,2})$/
    );


  if (match) {

    const monthName =
      match[1];

    const day =
      Number(match[2]);

    const currentYear =
      new Date().getFullYear();


    const date =
      new Date(
        `${monthName} ${day}, ${currentYear}`
      );


    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      return date;
    }
  }


  /* -------------------------------------
     FINAL FALLBACK
  ------------------------------------- */

  const date =
    new Date(text);


  if (
    !Number.isNaN(
      date.getTime()
    )
  ) {

    return date;
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


  return date.toLocaleDateString(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );
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
   =========================================

   REWARD:

   A:B = CLAIMED
   D:H = REDEEMED
   J:M = EXPENSES

   Row 1 = totals
   Row 2 = headers
   Row 3+ = records
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


    /* -------------------------------------
       CLAIMED
       A = DATE
       B = SOL CLAIMED
    ------------------------------------- */

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


    /* -------------------------------------
       REDEEMED
       D = DATE
       E = SOLD SOL
       F = RATE
       G = USD
       H = PHP
    ------------------------------------- */

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


    /*
      A redeemed row exists if ANY
      redeemed field contains data.
    */

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


    /* -------------------------------------
       EXPENSES
       J = DATE
       K = DESCRIPTION
       L = AMOUNT
       M = REMARKS
    ------------------------------------- */

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

        date: expenseDate,

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
   ALLOCATION SHEET
   =========================================

   ALLOCATION:

   A:D  = LEAM
   F:I  = CP KIDS
   K:N  = PROJECT

   A2 = TRANSPARENCY NOTE

   Row 5 = percentages
   Row 7+ = transactions
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


  /* -------------------------------------
     TRANSPARENCY NOTE
     A2
  ------------------------------------- */

  if (
    rows[1] &&
    rows[1][0] !== undefined &&
    rows[1][0] !== null
  ) {

    const note =
      String(rows[1][0]).trim();


    if (
      note &&
      !/^#(VALUE|REF|DIV\/0|N\/A|NAME|NUM|NULL|ERROR)!?$/i.test(note)
    ) {

      result.note =
        note;
    }
  }


  /* -------------------------------------
     TRANSACTIONS
     
     Row 7 = index 6
     
     LEAM:
     A = DATE
     B = REMARKS
     C = IN
     D = OUT

     CP:
     F = DATE
     G = REMARKS
     H = IN
     I = OUT

     PROJECT:
     K = DATE
     L = REMARKS
     M = IN
     N = OUT
  ------------------------------------- */

  for (
    let i = 6;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];


    /* -------------------------------------
       LEAM
    ------------------------------------- */

    const leamDate =
      row[0];

    const leamRemarks =
      row[1];

    const leamIn =
      toNumber(row[2]);

    const leamOut =
      toNumber(row[3]);


    /*
      IMPORTANT FIX:

      Do not depend only on truthiness.

      Google Sheets can return empty
      cells as undefined / empty strings.

      A row is considered a transaction
      if any relevant field has content.
    */

    const hasLeamDate =
      String(
        leamDate ?? ""
      ).trim() !== "";

    const hasLeamRemarks =
      String(
        leamRemarks ?? ""
      ).trim() !== "";


    if (
      hasLeamDate ||
      hasLeamRemarks ||
      leamIn !== 0 ||
      leamOut !== 0
    ) {

      result.leam.push({

        date:
          leamDate,

        remarks:
          leamRemarks,

        in:
          leamIn,

        out:
          leamOut

      });
    }


    /* -------------------------------------
       CP KIDS
    ------------------------------------- */

    const cpDate =
      row[5];

    const cpRemarks =
      row[6];

    const cpIn =
      toNumber(row[7]);

    const cpOut =
      toNumber(row[8]);


    const hasCPDate =
      String(
        cpDate ?? ""
      ).trim() !== "";

    const hasCPRemarks =
      String(
        cpRemarks ?? ""
      ).trim() !== "";


    if (
      hasCPDate ||
      hasCPRemarks ||
      cpIn !== 0 ||
      cpOut !== 0
    ) {

      result.cp.push({

        date:
          cpDate,

        remarks:
          cpRemarks,

        in:
          cpIn,

        out:
          cpOut

      });
    }


    /* -------------------------------------
       PROJECT
    ------------------------------------- */

    const projectDate =
      row[10];

    const projectRemarks =
      row[11];

    const projectIn =
      toNumber(row[12]);

    const projectOut =
      toNumber(row[13]);


    const hasProjectDate =
      String(
        projectDate ?? ""
      ).trim() !== "";

    const hasProjectRemarks =
      String(
        projectRemarks ?? ""
      ).trim() !== "";


    if (
      hasProjectDate ||
      hasProjectRemarks ||
      projectIn !== 0 ||
      projectOut !== 0
    ) {

      result.project.push({

        date:
          projectDate,

        remarks:
          projectRemarks,

        in:
          projectIn,

        out:
          projectOut

      });
    }

  }


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


  /* =====================================
     NO REDEEMED RECORDS
     ===================================== */

  if (!rows.length) {

    /*
      Force empty state visible.
    */

    empty.classList.remove(
      "hidden"
    );

    empty.style.display =
      "flex";


    /*
      Force table hidden.
    */

    wrap.classList.add(
      "hidden"
    );

    wrap.style.display =
      "none";


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


  /* =====================================
     HAS REDEEMED RECORDS
     ===================================== */

  /*
    IMPORTANT:

    When a redeemed record exists,
    completely hide the empty state.
  */

  empty.classList.add(
    "hidden"
  );

  empty.style.display =
    "none";


  /*
    Show the redeemed table.
  */

  wrap.classList.remove(
    "hidden"
  );

  wrap.style.display =
    "block";


  /* =====================================
     RENDER TABLE
     ===================================== */

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


  /* =====================================
     TOTALS
     ===================================== */

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
    !Array.isArray(rows) ||
    !rows[4]
  ) {

    return defaults;
  }


  let leam =
    toNumber(rows[4][0]);

  let cp =
    toNumber(rows[4][5]);

  let project =
    toNumber(rows[4][10]);


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

  const note =
    state.note ||
    "Creator Reward funds are allocated across direct support, cerebral palsy support, and Gentle Warrior projects.";


  /*
    Main allocation note.
  */

  const allocationNote =
    $("allocationNote");


  if (allocationNote) {

    allocationNote.textContent =
      note;
  }


  /*
    Transparency statement note.

    This supports the actual transparency
    statement section if the HTML uses:

    id="transparencyNote"
  */

  const transparencyNote =
    $("transparencyNote");


  if (transparencyNote) {

    transparencyNote.textContent =
      note;
  }


  /*
    Additional compatibility IDs
    in case the HTML uses another
    transparency-note element.
  */

  const statementNote =
    $("statementNote");


  if (statementNote) {

    statementNote.textContent =
      note;
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


  /*
    Render transparency note
    separately.
  */

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

    $("redeemedEmpty").style.display =
      "flex";


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

    $("redeemedWrap").style.display =
      "none";
  }

}


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


    /*
      ONLY TWO SHEETS:

      REWARD
      ALLOCATION
    */

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


    /* -------------------------------------
       PROCESS REWARD
    ------------------------------------- */

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


    /* -------------------------------------
       PROCESS ALLOCATION
    ------------------------------------- */

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


    /* -------------------------------------
       RENDER
    ------------------------------------- */

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
        }

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
