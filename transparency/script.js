/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT.JS
   STABLE FIXED VERSION
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


function isSheetError(value) {

  return /^#(VALUE|REF|DIV\/0|N\/A|NAME|NUM|NULL|ERROR)!?$/i
    .test(String(value ?? "").trim());
}


function hasValue(value) {

  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  );
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


  if (!cleaned || isSheetError(cleaned)) {
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
   =========================================

   IMPORTANT:

   Google Sheets CSV may return dates as:

   8/8/2026
   08/08/2026
   2026-08-08
   Aug 8, 2026
   August 8, 2026

   We NEVER interpret a plain number as
   a JavaScript date.

   This prevents dates such as 2001 from
   appearing because of browser date parsing.
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


  if (
    !text ||
    isSheetError(text)
  ) {
    return null;
  }


  /* -------------------------------------
     MM/DD/YYYY or MM-DD-YYYY
  ------------------------------------- */

  let match =
    text.match(
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
    );


  if (match) {

    const month =
      Number(match[1]);

    const day =
      Number(match[2]);

    const year =
      Number(match[3]);


    if (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31 &&
      year >= 1900 &&
      year <= 2100
    ) {

      const date =
        new Date(
          year,
          month - 1,
          day
        );


      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {

        return date;
      }
    }


    return null;
  }


  /* -------------------------------------
     YYYY-MM-DD
  ------------------------------------- */

  match =
    text.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    );


  if (match) {

    const year =
      Number(match[1]);

    const month =
      Number(match[2]);

    const day =
      Number(match[3]);


    if (
      year >= 1900 &&
      year <= 2100 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {

      const date =
        new Date(
          year,
          month - 1,
          day
        );


      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {

        return date;
      }
    }


    return null;
  }


  /* -------------------------------------
     Month-name dates

     Aug 8, 2026
     August 8, 2026
  ------------------------------------- */

  match =
    text.match(
      /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})$/i
    );


  if (match) {

    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec"
    ];


    const monthText =
      match[1].substring(0, 3).toLowerCase();


    const month =
      monthNames.indexOf(
        monthText
      );


    const day =
      Number(match[2]);

    const year =
      Number(match[3]);


    if (
      month >= 0 &&
      day >= 1 &&
      day <= 31 &&
      year >= 1900 &&
      year <= 2100
    ) {

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


    return null;
  }


  /*
    Do NOT use new Date(text) for arbitrary
    numeric/unknown strings.

    This is intentional to prevent incorrect
    dates such as 2001.
  */

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
    ------------------------------------- */

    const claimedDate =
      row[0];

    const claimedSOL =
      toNumber(row[1]);


    if (
      hasValue(claimedDate) &&
      claimedSOL !== 0
    ) {

      claimed.push({
        date: claimedDate,
        sol: claimedSOL
      });
    }


    /* -------------------------------------
       REDEEMED
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
      A redeemed record exists when the row
      contains actual redeemed information.

      Date alone is also accepted because
      a transaction should still appear even
      if another calculated field is blank.
    */

    if (
      hasValue(soldDate) ||
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
      hasValue(expenseDate) ||
      hasValue(expenseDescription) ||
      expenseAmount !== 0 ||
      hasValue(expenseRemarks)
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
   ALLOCATION HELPERS
   ========================================= */


/*
  Normalize a cell for header comparison.
*/

function normalizeCell(value) {

  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}


/*
  Detect a block header.

  Expected:

  DATE | REMARKS | IN | OUT
*/

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
      normalizeCell(
        row[startColumn]
      );

    const remarks =
      normalizeCell(
        row[startColumn + 1]
      );

    const incoming =
      normalizeCell(
        row[startColumn + 2]
      );

    const outgoing =
      normalizeCell(
        row[startColumn + 3]
      );


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


/*
  Read transactions below a detected
  allocation header.

  We stop capturing a row as a transaction
  unless the DATE cell is a real date.

  This prevents:
  - BALANCE rows
  - percentage rows
  - labels
  - totals
  - random numeric cells

  from becoming transactions.
*/

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
      A transaction requires a valid date.

      This is important because allocation
      sheets can contain balance/percentage
      rows in the same columns.
    */

    if (
      !hasValue(date) ||
      !parseDate(date)
    ) {

      continue;
    }


    result.push({

      date: date,

      remarks:
        remarks || "",

      in:
        inValue,

      out:
        outValue

    });
  }


  return result;
}


/* =========================================
   ALLOCATION NOTE FINDER
   =========================================

   The note may not always remain exactly
   at A2 after sheet edits.

   We therefore search the first several
   rows for a transparency-note label and
   retrieve the nearby text.

   If A2 itself contains the actual note,
   that is also accepted.
   ========================================= */

function findTransparencyNote(rows) {

  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {

    return "";
  }


  /*
    First: preserve the known A2 behavior.
  */

  if (
    rows[1] &&
    hasValue(rows[1][0]) &&
    !isSheetError(rows[1][0])
  ) {

    const a2 =
      String(rows[1][0]).trim();


    /*
      Do not accidentally treat a title such
      as ALLOCATION as the note.
    */

    const upper =
      a2.toUpperCase();


    if (
      upper !== "ALLOCATION" &&
      upper !== "TRANSPARENCY NOTE" &&
      upper !== "FUND ALLOCATION"
    ) {

      return a2;
    }
  }


  /*
    Search for an explicit note label.
  */

  for (
    let i = 0;
    i < Math.min(rows.length, 12);
    i++
  ) {

    const row =
      rows[i] || [];


    for (
      let c = 0;
      c < Math.min(row.length, 14);
      c++
    ) {

      const cell =
        normalizeCell(row[c]);


      if (
        cell === "TRANSPARENCY NOTE" ||
        cell === "NOTE"
      ) {

        /*
          Look to the right first.
        */

        for (
          let next = c + 1;
          next < Math.min(row.length, 14);
          next++
        ) {

          if (
            hasValue(row[next]) &&
            !isSheetError(row[next])
          ) {

            return String(
              row[next]
            ).trim();
          }
        }


        /*
          Then look at the next row.
        */

        if (
          rows[i + 1]
        ) {

          for (
            let next = 0;
            next < Math.min(
              rows[i + 1].length,
              14
            );
            next++
          ) {

            if (
              hasValue(
                rows[i + 1][next]
              ) &&
              !isSheetError(
                rows[i + 1][next]
              )
            ) {

              return String(
                rows[i + 1][next]
              ).trim();
            }
          }
        }
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
    Transparency note.
  */

  result.note =
    findTransparencyNote(rows);


  /*
    Read each block dynamically.

    LEAM:
    A:D

    CP KIDS:
    F:I

    PROJECT:
    K:N
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


  /* -------------------------------------
     NO RECORDS
  ------------------------------------- */

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


  /* -------------------------------------
     HAS RECORDS

     IMPORTANT:

     Empty message is explicitly hidden
     whenever at least one transaction
     exists.
  ------------------------------------- */

  empty.classList.add(
    "hidden"
  );


  wrap.classList.remove(
    "hidden"
  );


  /* -------------------------------------
     TABLE
  ------------------------------------- */

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


  /* -------------------------------------
     TOTALS
  ------------------------------------- */

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


  /* -------------------------------------
     NO TRANSACTIONS
  ------------------------------------- */

  if (!rows.length) {

    records.innerHTML = "";

    noRecords.classList.remove(
      "hidden"
    );

    noRecords.style.display =
      "block";

    return;
  }


  /* -------------------------------------
     HAS TRANSACTIONS
  ------------------------------------- */

  noRecords.classList.add(
    "hidden"
  );

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


  /*
    Preserve the current working 30/30/40
    unless row 5 contains valid percentage
    values.
  */

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


  const allocationNote =
    $("allocationNote");


  if (allocationNote) {

    allocationNote.textContent =
      note;
  }


  /*
    Compatibility IDs if they are added
    later or already exist in another version.
  */

  const transparencyNote =
    $("transparencyNote");


  if (transparencyNote) {

    transparencyNote.textContent =
      note;
  }


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


    /* -------------------------------------
       REWARD
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
       ALLOCATION
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
