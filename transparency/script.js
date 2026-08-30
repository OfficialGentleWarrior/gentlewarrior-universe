/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT.JS
   ========================================= */

"use strict";


/* =========================================
   GLOBAL DATA
   ========================================= */

const transparencyData = {

  claims: [],

  redeemed: [],

  expenses: [],

  allocation: {

    leam: {
      percentage: 30,
      in: 0,
      out: 0
    },

    cpKids: {
      percentage: 30,
      in: 0,
      out: 0
    },

    project: {
      percentage: 40,
      in: 0,
      out: 0
    }

  },

  note: ""

};


/* =========================================
   INITIALIZE
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  initTransparency
);


async function initTransparency() {

  setDataStatus("Loading...");

  try {

    const reward =
      await fetchSheet("reward");

    const allocation =
      await fetchSheet("allocation");


    parseRewardSheet(reward);

    parseAllocationSheet(allocation);

    renderPage();

    setDataStatus("Live");

  } catch (error) {

    console.error(
      "Transparency error:",
      error
    );

    setDataStatus(
      "Unable to load data",
      true
    );

  }

}


/* =========================================
   FETCH GOOGLE SHEET
   ========================================= */

async function fetchSheet(sheetName) {

  const url =
    getTransparencySheetUrl(
      sheetName
    );


  if (!url) {

    throw new Error(
      `No Google Sheet URL configured for ${sheetName}.`
    );

  }


  const response =
    await fetch(url);


  if (!response.ok) {

    throw new Error(
      `Failed to load ${sheetName}.`
    );

  }


  const text =
    await response.text();


  return parseGViz(text);

}


/* =========================================
   GOOGLE GVIZ
   ========================================= */

function parseGViz(text) {

  const start =
    text.indexOf("{");

  const end =
    text.lastIndexOf("}");


  if (
    start === -1 ||
    end === -1
  ) {

    throw new Error(
      "Invalid Google Sheets response."
    );

  }


  const json =
    JSON.parse(
      text.substring(
        start,
        end + 1
      )
    );


  const table =
    json.table;


  if (!table) {

    throw new Error(
      "No table data returned."
    );

  }


  const rows =
    table.rows || [];


  return rows.map(
    row => {

      const cells =
        row.c || [];


      return cells.map(
        cell => {

          if (!cell) {
            return "";
          }


          return (
            cell.v ??
            ""
          );

        }
      );

    }
  );

}


/* =========================================
   REWARD SHEET
   =========================================

   ACTUAL SHEET STRUCTURE:

   A = DATE
   B = SOL CLAIMED

   D = DATE SOLD
   E = SOLD SOL
   F = RATE
   G = USD
   H = PHP

   J = DATE
   K = DESCRIPTION
   L = AMOUNT
   M = REMARKS
   ========================================= */

function parseRewardSheet(rows) {

  transparencyData.claims = [];

  transparencyData.redeemed = [];

  transparencyData.expenses = [];


  if (!Array.isArray(rows)) {
    return;
  }


  /*
   * =======================================
   * CLAIMS
   * =======================================
   */

  rows.forEach(
    (row, index) => {

      /*
       * Skip header row.
       */

      if (index < 2) {
        return;
      }


      const date =
        row?.[0];

      const sol =
        toNumber(
          row?.[1]
        );


      if (
        hasValue(date) &&
        sol !== null &&
        sol > 0
      ) {

        const parsedDate =
          parseSheetDate(date);


        transparencyData.claims.push({

          date:
            parsedDate,

          sol:
            sol

        });

      }

    }
  );


  /*
   * =======================================
   * REDEEMED / SOLD
   * =======================================
   */

  rows.forEach(
    (row, index) => {

      if (index < 2) {
        return;
      }


      const date =
        row?.[3];

      const soldSOL =
        toNumber(
          row?.[4]
        );


      if (
        hasValue(date) &&
        soldSOL !== null &&
        soldSOL > 0
      ) {

        transparencyData.redeemed.push({

          date:
            parseSheetDate(date),

          sol:
            soldSOL,

          rate:
            toNumber(
              row?.[5]
            ),

          usd:
            toNumber(
              row?.[6]
            ),

          php:
            toNumber(
              row?.[7]
            )

        });

      }

    }
  );


  /*
   * =======================================
   * EXPENSES
   * =======================================
   */

  rows.forEach(
    (row, index) => {

      if (index < 2) {
        return;
      }


      const date =
        row?.[9];

      const description =
        row?.[10];

      const amount =
        toNumber(
          row?.[11]
        );

      const remarks =
        row?.[12];


      if (
        hasValue(date) &&
        hasValue(description) &&
        amount !== null &&
        amount > 0
      ) {

        transparencyData.expenses.push({

          date:
            parseSheetDate(date),

          description:
            String(description),

          amount:
            amount,

          remarks:
            hasValue(remarks)
              ? String(remarks)
              : ""

        });

      }

    }
  );


  /*
   * Sort oldest → newest
   */

  transparencyData.claims.sort(
    sortByDate
  );

  transparencyData.redeemed.sort(
    sortByDate
  );

  transparencyData.expenses.sort(
    sortByDate
  );

}


/* =========================================
   ALLOCATION SHEET
   =========================================

   ACTUAL SHEET STRUCTURE:

   LEAM
   A = percentage
   C = IN
   D = OUT

   CP KIDS
   F = percentage
   H = IN
   I = OUT

   PROJECT
   K = percentage
   M = IN
   N = OUT

   NOTE
   A2
   ========================================= */

function parseAllocationSheet(rows) {

  /*
   * ---------------------------------------
   * LEAM
   * ---------------------------------------
   */

  const leamPercentage =
    toNumber(
      rows[4]?.[0]
    );


  const leamIn =
    toNumber(
      rows[4]?.[2]
    );


  const leamOut =
    toNumber(
      rows[4]?.[3]
    );


  transparencyData.allocation.leam = {

    percentage:
      leamPercentage !== null
        ? leamPercentage
        : 30,

    in:
      leamIn !== null
        ? leamIn
        : 0,

    out:
      leamOut !== null
        ? leamOut
        : 0

  };


  /*
   * ---------------------------------------
   * CP KIDS
   * ---------------------------------------
   */

  const cpPercentage =
    toNumber(
      rows[4]?.[5]
    );


  const cpIn =
    toNumber(
      rows[4]?.[7]
    );


  const cpOut =
    toNumber(
      rows[4]?.[8]
    );


  transparencyData.allocation.cpKids = {

    percentage:
      cpPercentage !== null
        ? cpPercentage
        : 30,

    in:
      cpIn !== null
        ? cpIn
        : 0,

    out:
      cpOut !== null
        ? cpOut
        : 0

  };


  /*
   * ---------------------------------------
   * PROJECT
   * ---------------------------------------
   */

  const projectPercentage =
    toNumber(
      rows[4]?.[10]
    );


  const projectIn =
    toNumber(
      rows[4]?.[12]
    );


  const projectOut =
    toNumber(
      rows[4]?.[13]
    );


  transparencyData.allocation.project = {

    percentage:
      projectPercentage !== null
        ? projectPercentage
        : 40,

    in:
      projectIn !== null
        ? projectIn
        : 0,

    out:
      projectOut !== null
        ? projectOut
        : 0

  };


  /*
   * ---------------------------------------
   * TRANSPARENCY NOTE
   *
   * A2
   * ---------------------------------------
   */

  transparencyData.note =
    hasValue(
      rows[1]?.[0]
    )
      ? String(rows[1][0])
      : "";

}


/* =========================================
   RENDER PAGE
   ========================================= */

function renderPage() {

  renderSummary();

  renderClaims();

  renderRedeemed();

  renderExpenses();

  renderAllocation();

  renderLatestUpdate();

}


/* =========================================
   SUMMARY
   ========================================= */

function renderSummary() {

  const claimed =
    transparencyData.claims.reduce(
      (sum, item) =>
        sum + Number(item.sol || 0),
      0
    );


  const redeemed =
    transparencyData.redeemed.reduce(
      (sum, item) =>
        sum + Number(item.sol || 0),
      0
    );


  const proceeds =
    transparencyData.redeemed.reduce(
      (sum, item) =>
        sum + Number(item.php || 0),
      0
    );


  const expenses =
    transparencyData.expenses.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );


  setText(
    "totalClaimed",
    formatSol(claimed)
  );


  setText(
    "totalRedeemed",
    formatSol(redeemed)
  );


  setText(
    "totalProceeds",
    formatPHP(proceeds)
  );


  setText(
    "totalExpenses",
    formatPHP(expenses)
  );

}


/* =========================================
   CLAIMS TABLE
   ========================================= */

function renderClaims() {

  const tbody =
    document.getElementById(
      "claimsTable"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  transparencyData.claims.forEach(
    item => {

      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <td>
          ${escapeHTML(
            formatDate(item.date)
          )}
        </td>

        <td class="num">
          ${formatSolNumber(
            item.sol
          )}
        </td>

      `;


      tbody.appendChild(tr);

    }
  );


  const total =
    transparencyData.claims.reduce(
      (sum, item) =>
        sum + Number(item.sol || 0),
      0
    );


  setText(
    "claimsTotal",
    formatSolNumber(total)
  );


  setText(
    "claimedCount",
    `${transparencyData.claims.length} records`
  );

}


/* =========================================
   REDEEMED TABLE
   ========================================= */

function renderRedeemed() {

  const tbody =
    document.getElementById(
      "redeemedTable"
    );


  const table =
    document.getElementById(
      "redeemedWrap"
    );


  const empty =
    document.getElementById(
      "redeemedEmpty"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  const records =
    transparencyData.redeemed;


  /*
   * ---------------------------------------
   * NO SALES
   * ---------------------------------------
   */

  if (records.length === 0) {

    if (table) {
      table.style.display = "none";
    }


    if (empty) {
      empty.classList.remove("hidden");
    }

  }


  /*
   * ---------------------------------------
   * HAS SALES
   * ---------------------------------------
   */

  else {

    if (table) {
      table.style.display = "";
    }


    if (empty) {
      empty.classList.add("hidden");
    }


    records.forEach(
      item => {

        const tr =
          document.createElement(
            "tr"
          );


        tr.innerHTML = `

          <td>
            ${escapeHTML(
              formatDate(item.date)
            )}
          </td>

          <td class="num">
            ${formatSolNumber(
              item.sol
            )}
          </td>

          <td class="num">
            ${formatRate(
              item.rate
            )}
          </td>

          <td class="num">
            ${formatUSD(
              item.usd
            )}
          </td>

          <td class="num">
            ${formatPHP(
              item.php
            )}
          </td>

        `;


        tbody.appendChild(tr);

      }
    );

  }


  const totalSOL =
    records.reduce(
      (sum, item) =>
        sum + Number(item.sol || 0),
      0
    );


  const totalPHP =
    records.reduce(
      (sum, item) =>
        sum + Number(item.php || 0),
      0
    );


  setText(
    "redeemedTotal",
    formatSolNumber(totalSOL)
  );


  setText(
    "proceedsTotal",
    formatPHP(totalPHP)
  );


  setText(
    "redeemedCount",
    `${records.length} records`
  );

}


/* =========================================
   EXPENSE TABLE
   ========================================= */

function renderExpenses() {

  const tbody =
    document.getElementById(
      "expensesTable"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  transparencyData.expenses.forEach(
    item => {

      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <td>
          ${escapeHTML(
            formatDate(item.date)
          )}
        </td>

        <td>
          ${escapeHTML(
            item.description
          )}
        </td>

        <td class="num">
          ${formatPHP(
            item.amount
          )}
        </td>

        <td>
          ${escapeHTML(
            item.remarks
          )}
        </td>

      `;


      tbody.appendChild(tr);

    }
  );


  const total =
    transparencyData.expenses.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );


  setText(
    "expensesTotal",
    formatPHP(total)
  );


  setText(
    "expenseCount",
    `${transparencyData.expenses.length} records`
  );

}


/* =========================================
   ALLOCATION
   ========================================= */

function renderAllocation() {

  const a =
    transparencyData.allocation;


  renderAllocationCard(
    "leam",
    a.leam
  );


  renderAllocationCard(
    "cp",
    a.cpKids
  );


  renderAllocationCard(
    "project",
    a.project
  );


  /*
   * Actual note from A2.
   */

  setText(
    "allocationNote",
    transparencyData.note
  );

}


/* =========================================
   ALLOCATION CARD
   ========================================= */

function renderAllocationCard(
  prefix,
  data
) {

  if (!data) {
    return;
  }


  const input =
    Number(data.in || 0);


  const output =
    Number(data.out || 0);


  const balance =
    input - output;


  setText(
    `${prefix}In`,
    formatPHP(input)
  );


  setText(
    `${prefix}Out`,
    formatPHP(output)
  );


  setText(
    `${prefix}Balance`,
    formatPHP(balance)
  );


  /*
   * Optional percentage element.
   */

  const percentage =
    document.querySelector(
      `[data-allocation="${prefix}"]`
    );


  if (percentage) {

    percentage.textContent =
      `${data.percentage}%`;

  }

}


/* =========================================
   LATEST UPDATE
   ========================================= */

function renderLatestUpdate() {

  const dates = [];


  transparencyData.claims.forEach(
    item => {

      if (item.date) {
        dates.push(item.date);
      }

    }
  );


  transparencyData.redeemed.forEach(
    item => {

      if (item.date) {
        dates.push(item.date);
      }

    }
  );


  transparencyData.expenses.forEach(
    item => {

      if (item.date) {
        dates.push(item.date);
      }

    }
  );


  if (!dates.length) {

    setText(
      "latestEntry",
      ""
    );

    return;

  }


  const validDates =
    dates.filter(
      date =>
        date instanceof Date &&
        !Number.isNaN(
          date.getTime()
        )
    );


  if (!validDates.length) {
    return;
  }


  const latest =
    new Date(
      Math.max(
        ...validDates.map(
          date =>
            date.getTime()
        )
      )
    );


  setText(
    "latestEntry",
    `Latest recorded activity: ${formatDate(latest)}`
  );

}


/* =========================================
   DATA STATUS
   ========================================= */

function setDataStatus(
  message,
  error = false
) {

  const element =
    document.getElementById(
      "dataStatus"
    );


  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.classList.toggle(
    "data-error",
    error
  );

}


/* =========================================
   NUMBER
   ========================================= */

function toNumber(value) {

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {

    return value;

  }


  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return null;

  }


  let cleaned =
    String(value)
      .trim()
      .replace(/₱/g, "")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/SOL/gi, "")
      .trim();


  if (cleaned === "") {
    return null;
  }


  const number =
    Number(cleaned);


  return Number.isFinite(number)
    ? number
    : null;

}


/* =========================================
   CHECK VALUE
   ========================================= */

function hasValue(value) {

  return !(
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  );

}


/* =========================================
   SHEET DATE
   ========================================= */

function parseSheetDate(value) {

  if (
    value instanceof Date
  ) {

    return value;

  }


  if (!hasValue(value)) {
    return null;
  }


  const stringValue =
    String(value).trim();


  /*
   * GViz format:
   *
   * Date(2026,7,8)
   *
   * Month is zero-based.
   */

  const match =
    stringValue.match(
      /Date\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/
    );


  if (match) {

    return new Date(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    );

  }


  /*
   * Normal date string.
   */

  const date =
    new Date(stringValue);


  if (
    !Number.isNaN(
      date.getTime()
    )
  ) {

    return date;

  }


  return null;

}


/* =========================================
   SORT BY DATE
   ========================================= */

function sortByDate(a, b) {

  const aTime =
    a.date instanceof Date
      ? a.date.getTime()
      : 0;


  const bTime =
    b.date instanceof Date
      ? b.date.getTime()
      : 0;


  return aTime - bTime;

}


/* =========================================
   FORMAT DATE
   ========================================= */

function formatDate(value) {

  if (!value) {
    return "—";
  }


  const date =
    value instanceof Date
      ? value
      : new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }


  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );

}


/* =========================================
   FORMAT SOL
   ========================================= */

function formatSol(value) {

  return (
    formatSolNumber(value) +
    " SOL"
  );

}


function formatSolNumber(value) {

  return Number(value || 0)
    .toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

}


/* =========================================
   FORMAT PHP
   ========================================= */

function formatPHP(value) {

  return (
    "₱" +
    Number(value || 0)
      .toLocaleString(
        "en-PH",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      )
  );

}


/* =========================================
   FORMAT USD
   ========================================= */

function formatUSD(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "—";

  }


  return (
    "$" +
    Number(value)
      .toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      )
  );

}


/* =========================================
   FORMAT RATE
   ========================================= */

function formatRate(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "—";

  }


  return (
    "₱" +
    Number(value)
      .toLocaleString(
        "en-PH",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      )
  );

}


/* =========================================
   DOM
   ========================================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  }

}


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}
