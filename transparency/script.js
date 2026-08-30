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
    getTransparencySheetUrl(sheetName);


  if (!url) {

    throw new Error(
      `No Google Sheet URL configured for ${sheetName}.`
    );

  }


  const response =
    await fetch(url, {
      cache: "no-store"
    });


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
            cell.f ??
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

function parseRewardSheet(rows) {

  transparencyData.claims = [];

  transparencyData.redeemed = [];

  transparencyData.expenses = [];


  /* =======================================
     CLAIMS

     A = DATE
     B = SOL CLAIMED

     Starts at Sheet Row 3
     ======================================= */

  for (
    let row = 2;
    row < rows.length;
    row++
  ) {

    const date =
      rows[row]?.[0];

    const sol =
      toNumber(
        rows[row]?.[1]
      );


    if (
      date !== "" &&
      sol !== null
    ) {

      const parsedDate =
        parseSheetDate(date);


      if (parsedDate) {

        transparencyData.claims.push({

          date:
            parsedDate,

          sol:
            sol

        });

      }

    }

  }


  /* =======================================
     REDEEMED / SOLD

     D = DATE
     E = SOLD SOL
     F = RATE
     G = $
     H = IN PESO

     Starts at Sheet Row 3
     ======================================= */

  for (
    let row = 2;
    row < rows.length;
    row++
  ) {

    const date =
      rows[row]?.[3];

    const soldSOL =
      toNumber(
        rows[row]?.[4]
      );


    if (
      date !== "" &&
      soldSOL !== null &&
      soldSOL > 0
    ) {

      const parsedDate =
        parseSheetDate(date);


      if (parsedDate) {

        transparencyData.redeemed.push({

          date:
            parsedDate,

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

  }


  /* =======================================
     EXPENSES

     J = DATE
     K = DESCRIPTION
     L = AMOUNT
     M = REMARKS

     Starts at Sheet Row 3
     ======================================= */

  for (
    let row = 2;
    row < rows.length;
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
      date !== "" &&
      description !== "" &&
      amount !== null
    ) {

      const parsedDate =
        parseSheetDate(date);


      if (parsedDate) {

        transparencyData.expenses.push({

          date:
            parsedDate,

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

}


/* =========================================
   ALLOCATION SHEET
   ========================================= */

/*
 * ACTUAL GOOGLE SHEET STRUCTURE
 *
 * DATA IS ON SHEET ROW 6
 *
 * LEAM
 * A6 = DATE
 * B6 = REMARKS
 * C6 = IN
 * D6 = OUT
 *
 * CP KIDS
 * F6 = DATE
 * G6 = REMARKS
 * H6 = IN
 * I6 = OUT
 *
 * PROJECT
 * K6 = DATE
 * L6 = REMARKS
 * M6 = IN
 * N6 = OUT
 *
 * PERCENTAGES ARE DISPLAY LABELS ONLY:
 *
 * LEAM     = 30%
 * CP KIDS  = 30%
 * PROJECT  = 40%
 *
 * IMPORTANT:
 * rows[5] = Sheet Row 6
 */

function parseAllocationSheet(rows) {

  /*
   * FIX:
   *
   * Previous version used rows[4]
   * which points to Sheet Row 5.
   *
   * Actual allocation data is on
   * Sheet Row 6, therefore rows[5].
   */

  const allocationRow =
    rows[5] || [];


  /* =======================================
     LEAM
     ======================================= */

  transparencyData.allocation.leam = {

    percentage: 30,

    in:
      getNumberOrDefault(
        allocationRow[2],
        0
      ),

    out:
      getNumberOrDefault(
        allocationRow[3],
        0
      )

  };


  /* =======================================
     CP KIDS
     ======================================= */

  transparencyData.allocation.cpKids = {

    percentage: 30,

    in:
      getNumberOrDefault(
        allocationRow[7],
        0
      ),

    out:
      getNumberOrDefault(
        allocationRow[8],
        0
      )

  };


  /* =======================================
     PROJECT
     ======================================= */

  transparencyData.allocation.project = {

    percentage: 40,

    in:
      getNumberOrDefault(
        allocationRow[12],
        0
      ),

    out:
      getNumberOrDefault(
        allocationRow[13],
        0
      )

  };


  /*
   * Keep transparency note support.
   *
   * If A2 contains the note, use it.
   * Otherwise leave it blank.
   */

  transparencyData.note =
    rows[1]?.[0]
      ? String(rows[1][0])
      : "";

}


/* =========================================
   NUMBER WITH DEFAULT
   ========================================= */

function getNumberOrDefault(
  value,
  fallback
) {

  const number =
    toNumber(value);


  return number === null
    ? fallback
    : number;

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

  optimizeTablesForMobile();

}


/* =========================================
   SUMMARY
   ========================================= */

function renderSummary() {

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
          Number(item.php) || 0
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

  }


  else {

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
            ${formatSolNumber(item.sol)}
          </td>

          <td class="num">
            ${formatRate(item.rate)}
          </td>

          <td class="num">
            ${formatUSD(item.usd)}
          </td>

          <td class="num">
            ${formatPHP(item.php)}
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
          Number(item.php) || 0
        ),
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
          ${formatPHP(item.amount)}
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


  setText(
    "allocationNote",
    transparencyData.note
  );


  /*
   * Percentages are DISPLAY LABELS.
   *
   * They remain:
   * LEAM = 30%
   * CP KIDS = 30%
   * PROJECT = 40%
   */

  updateAllocationPercentage(
    "leam",
    30
  );


  updateAllocationPercentage(
    "cp",
    30
  );


  updateAllocationPercentage(
    "project",
    40
  );

}


/* =========================================
   ALLOCATION CARD
   ========================================= */

function renderAllocationCard(
  prefix,
  data
) {

  const input =
    Number(data.in);


  const output =
    Number(data.out);


  const safeIn =
    Number.isFinite(input)
      ? input
      : 0;


  const safeOut =
    Number.isFinite(output)
      ? output
      : 0;


  const balance =
    safeIn -
    safeOut;


  setText(
    `${prefix}In`,
    formatPHP(safeIn)
  );


  setText(
    `${prefix}Out`,
    formatPHP(safeOut)
  );


  setText(
    `${prefix}Balance`,
    formatPHP(balance)
  );

}


/* =========================================
   ALLOCATION PERCENTAGE
   ========================================= */

function updateAllocationPercentage(
  prefix,
  percentage
) {

  const value =
    Number(percentage);


  const safePercentage =
    Number.isFinite(value)
      ? value
      : 0;


  const dataElement =
    document.querySelector(
      `[data-allocation="${prefix}"]`
    );


  if (dataElement) {

    dataElement.textContent =
      `${safePercentage}%`;

  }


  setText(
    `${prefix}Percentage`,
    `${safePercentage}%`
  );

}


/* =========================================
   MOBILE TABLE OPTIMIZATION
   ========================================= */

function optimizeTablesForMobile() {

  document
    .querySelectorAll(".table-scroll")
    .forEach(
      element => {

        element.classList.add(
          "table-responsive"
        );

      }
    );

}


/* =========================================
   LATEST UPDATE
   ========================================= */

function renderLatestUpdate() {

  const dates = [];


  transparencyData.claims.forEach(
    item => {

      if (item.date) {

        dates.push(
          item.date
        );

      }

    }
  );


  transparencyData.redeemed.forEach(
    item => {

      if (item.date) {

        dates.push(
          item.date
        );

      }

    }
  );


  transparencyData.expenses.forEach(
    item => {

      if (item.date) {

        dates.push(
          item.date
        );

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


  const latestTime =
    Math.max(
      ...dates.map(
        date =>
          date.getTime()
      )
    );


  const latest =
    new Date(
      latestTime
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


  let stringValue =
    String(value)
      .trim();


  if (!stringValue) {

    return null;

  }


  stringValue =
    stringValue
      .replace(/₱/g, "")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .trim();


  if (
    stringValue.endsWith("%")
  ) {

    stringValue =
      stringValue.slice(
        0,
        -1
      );

  }


  const number =
    Number(
      stringValue
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


  const stringValue =
    String(value)
      .trim();


  const match =
    stringValue.match(
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
    new Date(
      stringValue
    );


  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;

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

  const number =
    Number(value);


  return (
    Number.isFinite(number)
      ? number
      : 0
  )
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

  const number =
    Number(value);


  return (
    "₱" +
    (
      Number.isFinite(number)
        ? number
        : 0
    )
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


  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {

    return "—";

  }


  return (
    "$" +
    number.toLocaleString(
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


  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {

    return "—";

  }


  return (
    "₱" +
    number.toLocaleString(
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
    document.getElementById(
      id
    );


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
