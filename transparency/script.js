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

async function fetchSheet(
  sheetName
) {

  const url =
    getTransparencySheetUrl(
      sheetName
    );


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
   ========================================= */

function parseRewardSheet(
  rows
) {

  transparencyData.claims = [];

  transparencyData.redeemed = [];

  transparencyData.expenses = [];


  /*
   * =======================================
   * CLAIMS
   *
   * A = DATE
   * B = SOL CLAIMED
   *
   * Rows 3–14
   * =======================================
   */

  for (
    let row = 2;
    row <= 13;
    row++
  ) {

    const date =
      rows[row]?.[0];

    const sol =
      toNumber(
        rows[row]?.[1]
      );


    if (
      date &&
      sol !== null
    ) {

      transparencyData.claims.push({

        date:
          parseSheetDate(date),

        sol:
          sol

      });

    }

  }


  /*
   * =======================================
   * REDEEMED / SOLD
   *
   * D = DATE
   * E = SOLD SOL
   * F = RATE
   * G = $
   * H = IN PESO
   *
   * Rows 3–14
   * =======================================
   */

  for (
    let row = 2;
    row <= 13;
    row++
  ) {

    const date =
      rows[row]?.[3];

    const soldSOL =
      toNumber(
        rows[row]?.[4]
      );


    /*
     * Only create a sale record when
     * SOLD SOL actually exists.
     */

    if (
      date &&
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
            rows[row]?.[5]
          ),

        usd:
          toNumber(
            rows[row]?.[6]
          ),

        php:
          toNumber(
            rows[row]?.[7]
          )

      });

    }

  }


  /*
   * =======================================
   * EXPENSES
   *
   * J = DATE
   * K = DESCRIPTION
   * L = AMOUNT
   * M = REMARKS
   *
   * Rows 3–14
   * =======================================
   */

  for (
    let row = 2;
    row <= 13;
    row++
  ) {

    const date =
      rows[row]?.[9];

    const description =
      rows[row]?.[10];

    const amount =
      toNumber(
        rows[row]?.[11]
      );

    const remarks =
      rows[row]?.[12];


    if (
      date &&
      description &&
      amount !== null
    ) {

      transparencyData.expenses.push({

        date:
          parseSheetDate(date),

        description:
          String(description),

        amount:
          amount,

        remarks:
          remarks
            ? String(remarks)
            : ""

      });

    }

  }

}


/* =========================================
   ALLOCATION SHEET
   ========================================= */

function parseAllocationSheet(
  rows
) {

  /*
   * Exact Excel structure:
   *
   * LEAM
   * A = label
   * C = IN
   * D = OUT
   *
   * CP KIDS
   * F = label
   * H = IN
   * I = OUT
   *
   * PROJECT
   * K = label
   * M = IN
   * N = OUT
   */


  transparencyData.allocation.leam = {

    percentage:
      toNumber(
        rows[4]?.[0]
      ) || 30,

    in:
      toNumber(
        rows[4]?.[2]
      ) || 0,

    out:
      toNumber(
        rows[4]?.[3]
      ) || 0

  };


  transparencyData.allocation.cpKids = {

    percentage:
      toNumber(
        rows[4]?.[5]
      ) || 30,

    in:
      toNumber(
        rows[4]?.[7]
      ) || 0,

    out:
      toNumber(
        rows[4]?.[8]
      ) || 0

  };


  transparencyData.allocation.project = {

    percentage:
      toNumber(
        rows[4]?.[10]
      ) || 40,

    in:
      toNumber(
        rows[4]?.[12]
      ) || 0,

    out:
      toNumber(
        rows[4]?.[13]
      ) || 0

  };


  /*
   * Allocation note
   *
   * A2 in the actual Excel file.
   */

  transparencyData.note =
    rows[1]?.[0]
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

  /*
   * Use the actual sheet totals.
   * These are also recalculated from the
   * records for safety.
   */

  const claimed =
    transparencyData.claims.reduce(
      (sum, item) =>
        sum + item.sol,
      0
    );


  const redeemed =
    transparencyData.redeemed.reduce(
      (sum, item) =>
        sum + item.sol,
      0
    );


  const proceeds =
    transparencyData.redeemed.reduce(
      (sum, item) =>
        sum + (
          item.php || 0
        ),
      0
    );


  const expenses =
    transparencyData.expenses.reduce(
      (sum, item) =>
        sum + item.amount,
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


  if (!tbody) return;


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
          ${formatSolNumber(item.sol)}
        </td>

      `;


      tbody.appendChild(tr);

    }
  );


  const total =
    transparencyData.claims.reduce(
      (sum, item) =>
        sum + item.sol,
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


  if (!tbody) return;


  tbody.innerHTML = "";


  const records =
    transparencyData.redeemed;


  /*
   * Current Excel data has zero redeemed.
   */

  if (
    records.length === 0
  ) {

    if (table) {
      table.style.display =
        "none";
    }


    if (empty) {
      empty.classList.remove(
        "hidden"
      );
    }

  } else {

    if (table) {
      table.style.display =
        "";
    }


    if (empty) {
      empty.classList.add(
        "hidden"
      );
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
        sum + item.sol,
      0
    );


  const totalPHP =
    records.reduce(
      (sum, item) =>
        sum + (
          item.php || 0
        ),
      0
    );


  setText(
    "redeemedTotal",
    formatSolNumber(
      totalSOL
    )
  );


  setText(
    "proceedsTotal",
    formatPHP(
      totalPHP
    )
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


  if (!tbody) return;


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
        sum + item.amount,
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
   * Show the actual note from Excel.
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

  const balance =
    Number(data.in || 0) -
    Number(data.out || 0);


  setText(
    `${prefix}In`,
    formatPHP(data.in)
  );


  setText(
    `${prefix}Out`,
    formatPHP(data.out)
  );


  setText(
    `${prefix}Balance`,
    formatPHP(balance)
  );


  /*
   * Update percentage in the card
   * if the HTML has a matching element.
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


  const latest =
    new Date(
      Math.max(
        ...dates.map(
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


  if (!element) return;


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


  const number =
    Number(
      String(value)
        .replace(/₱/g, "")
        .replace(/\$/g, "")
        .replace(/,/g, "")
        .trim()
    );


  return Number.isFinite(number)
    ? number
    : null;

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


  if (!value) {
    return null;
  }


  /*
   * Google GViz normally returns dates
   * as strings such as:
   *
   * Date(2026,7,8)
   *
   * Month is zero-based.
   */

  const match =
    String(value).match(
      /Date\((\d+),(\d+),(\d+)\)/
    );


  if (match) {

    return new Date(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    );

  }


  const date =
    new Date(value);


  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;

}


/* =========================================
   FORMAT DATE
   ========================================= */

function formatDate(
  value
) {

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

function formatSol(
  value
) {

  return (
    formatSolNumber(value) +
    " SOL"
  );

}


function formatSolNumber(
  value
) {

  return (
    Number(value || 0)
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
   FORMAT PHP
   ========================================= */

function formatPHP(
  value
) {

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

function formatUSD(
  value
) {

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

function formatRate(
  value
) {

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

function escapeHTML(
  value
) {

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
