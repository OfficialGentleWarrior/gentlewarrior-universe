/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT.JS
   FIXED LIVE GOOGLE SHEET CONNECTION
   ========================================= */

"use strict";


/* =========================================
   CONFIG
   ========================================= */

const CONFIG = {
  sheetId: "1pXMbQ3QScwSNvreeMO-1xEjr7yRhKw9T",

  rewardSheet: "REWARD",
  allocationSheet: "ALLOCATION"
};


/* =========================================
   DOM
   ========================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================
   FORMATTING
   ========================================= */

function numberValue(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  let text = String(value)
    .trim()
    .replace(/₱/g, "")
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "");

  if (!text) {
    return null;
  }

  if (text.endsWith("%")) {
    text = text.slice(0, -1);
  }

  const valueNumber = Number(text);

  return Number.isFinite(valueNumber)
    ? valueNumber
    : null;
}


function money(value) {

  const n = Number(value) || 0;

  return (
    "₱" +
    n.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  );
}


function sol(value) {

  const n = Number(value) || 0;

  return (
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) +
    " SOL"
  );
}


function usd(value) {

  const n = Number(value) || 0;

  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  );
}


function num(value) {

  const n = Number(value) || 0;

  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


/* =========================================
   TEXT
   ========================================= */

function normalizeText(value) {

  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[._-]+/g, " ")
    .trim();
}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================
   DATE
   ========================================= */

function cleanDate(value) {

  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const text = String(value).trim();

  const match = text.match(
    /Date\((\d+),(\d+),(\d+)/
  );

  if (match) {

    return new Date(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    );
  }

  const date = new Date(text);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}


function dateText(value) {

  const date = cleanDate(value);

  if (!date) {
    return "—";
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
   GOOGLE SHEETS GVIZ
   ========================================= */

async function fetchSheet(sheetName) {

  if (!CONFIG.sheetId) {
    throw new Error(
      "Google Sheet ID is missing."
    );
  }

  const url =
    "https://docs.google.com/spreadsheets/d/" +
    CONFIG.sheetId +
    "/gviz/tq" +
    "?tqx=out:json" +
    "&sheet=" +
    encodeURIComponent(sheetName) +
    "&cachebust=" +
    Date.now();

  console.log(
    "[GWAR] Fetching:",
    sheetName,
    url
  );

  const response = await fetch(
    url,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {

    throw new Error(
      "Google Sheet request failed: " +
      response.status
    );
  }

  const text =
    await response.text();

  return parseGViz(text);
}


/* =========================================
   GVIZ PARSER
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

  if (
    !json.table
  ) {
    throw new Error(
      "No Google Sheets table returned."
    );
  }

  const rows =
    json.table.rows || [];

  return rows.map(row => {

    const cells =
      row.c || [];

    const result = [];

    /*
      Keep enough columns for:
      REWARD:
      A:N

      ALLOCATION:
      A:N
    */

    for (
      let i = 0;
      i < 14;
      i++
    ) {

      const cell =
        cells[i];

      if (!cell) {

        result.push("");

        continue;
      }

      if (
        cell.f !== undefined &&
        cell.f !== null
      ) {

        result.push(cell.f);

      } else if (
        cell.v !== undefined &&
        cell.v !== null
      ) {

        result.push(cell.v);

      } else {

        result.push("");
      }
    }

    return result;
  });
}


/* =========================================
   HEADER HELPERS
   ========================================= */

function isDateHeader(value) {

  return (
    normalizeText(value) ===
    "DATE"
  );
}


function isRemarkHeader(value) {

  const text =
    normalizeText(value);

  return (
    text === "REMARK" ||
    text === "REMARKS"
  );
}


function isInHeader(value) {

  return (
    normalizeText(value) ===
    "IN"
  );
}


function isOutHeader(value) {

  return (
    normalizeText(value) ===
    "OUT"
  );
}


function findRowWithHeaders(
  rows,
  headers
) {

  const wanted =
    headers.map(normalizeText);

  for (
    let r = 0;
    r < rows.length;
    r++
  ) {

    const row =
      rows[r] || [];

    const normalized =
      row.map(normalizeText);

    const found =
      wanted.every(
        item =>
          normalized.includes(item)
      );

    if (found) {
      return r;
    }
  }

  return -1;
}


function findColumn(
  row,
  matcher
) {

  for (
    let i = 0;
    i < row.length;
    i++
  ) {

    if (
      matcher(row[i])
    ) {
      return i;
    }
  }

  return -1;
}


function findSequence(
  row,
  matchers
) {

  for (
    let start = 0;
    start <=
      row.length -
      matchers.length;
    start++
  ) {

    let found = true;

    for (
      let i = 0;
      i < matchers.length;
      i++
    ) {

      if (
        !matchers[i](
          row[start + i]
        )
      ) {

        found = false;

        break;
      }
    }

    if (found) {
      return start;
    }
  }

  return -1;
}


/* =========================================
   REWARD PARSER
   ========================================= */

function parseReward(rows) {

  const claims = [];
  const redeemed = [];
  const expenses = [];


  /* =======================================
     CLAIMED
     ======================================= */

  let claimHeaderRow =
    findRowWithHeaders(
      rows,
      [
        "DATE",
        "SOL CLAIMED"
      ]
    );

  if (
    claimHeaderRow === -1
  ) {
    claimHeaderRow = 1;
  }


  const claimHeader =
    rows[claimHeaderRow] || [];


  let claimDateCol =
    findColumn(
      claimHeader,
      isDateHeader
    );


  let claimSolCol =
    findColumn(
      claimHeader,
      value =>
        normalizeText(value) ===
        "SOL CLAIMED"
    );


  /*
    Original layout:
    A = DATE
    B = SOL CLAIMED
  */

  if (
    claimDateCol === -1
  ) {
    claimDateCol = 0;
  }

  if (
    claimSolCol === -1
  ) {
    claimSolCol = 1;
  }


  for (
    let i =
      claimHeaderRow + 1;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];

    const dateValue =
      row[claimDateCol];

    const solValue =
      numberValue(
        row[claimSolCol]
      );

    if (
      dateValue !== "" &&
      solValue !== null
    ) {

      const date =
        cleanDate(
          dateValue
        );

      if (date) {

        claims.push([
          date,
          solValue
        ]);
      }
    }
  }


  /* =======================================
     REDEEMED / SOLD
     ======================================= */

  let redeemedHeaderRow =
    findRowWithHeaders(
      rows,
      [
        "DATE",
        "SOLD SOL"
      ]
    );

  if (
    redeemedHeaderRow === -1
  ) {
    redeemedHeaderRow = 1;
  }


  const redeemedHeader =
    rows[redeemedHeaderRow] || [];


  let redeemedDateCol =
    findColumn(
      redeemedHeader,
      isDateHeader
    );


  let soldSolCol =
    findColumn(
      redeemedHeader,
      value =>
        normalizeText(value) ===
        "SOLD SOL"
    );


  let rateCol =
    findColumn(
      redeemedHeader,
      value =>
        normalizeText(value) ===
        "RATE"
    );


  let usdCol =
    findColumn(
      redeemedHeader,
      value => {

        const text =
          normalizeText(value);

        return (
          text === "$" ||
          text === "USD"
        );
      }
    );


  let pesoCol =
    findColumn(
      redeemedHeader,
      value =>
        normalizeText(value) ===
        "IN PESO"
    );


  /*
    Original layout:

    D = DATE
    E = SOLD SOL
    F = RATE
    G = $
    H = IN PESO
  */

  if (
    redeemedDateCol === -1
  ) {
    redeemedDateCol = 3;
  }

  if (
    soldSolCol === -1
  ) {
    soldSolCol = 4;
  }

  if (
    rateCol === -1
  ) {
    rateCol = 5;
  }

  if (
    usdCol === -1
  ) {
    usdCol = 6;
  }

  if (
    pesoCol === -1
  ) {
    pesoCol = 7;
  }


  for (
    let i =
      redeemedHeaderRow + 1;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];

    const dateValue =
      row[redeemedDateCol];

    const soldSol =
      numberValue(
        row[soldSolCol]
      );

    if (
      dateValue !== "" &&
      soldSol !== null &&
      soldSol > 0
    ) {

      const date =
        cleanDate(
          dateValue
        );

      if (date) {

        redeemed.push([
          date,
          soldSol,
          numberValue(
            row[rateCol]
          ),
          numberValue(
            row[usdCol]
          ),
          numberValue(
            row[pesoCol]
          ) || 0
        ]);
      }
    }
  }


  /* =======================================
     EXPENSES
     ======================================= */

  let expenseHeaderRow =
    findRowWithHeaders(
      rows,
      [
        "DATE",
        "DESCRIPTION",
        "AMOUNT"
      ]
    );

  if (
    expenseHeaderRow === -1
  ) {
    expenseHeaderRow = 1;
  }


  const expenseHeader =
    rows[expenseHeaderRow] || [];


  let expenseDateCol =
    findColumn(
      expenseHeader,
      isDateHeader
    );


  let descriptionCol =
    findColumn(
      expenseHeader,
      value =>
        normalizeText(value) ===
        "DESCRIPTION"
    );


  let amountCol =
    findColumn(
      expenseHeader,
      value =>
        normalizeText(value) ===
        "AMOUNT"
    );


  let remarksCol =
    findColumn(
      expenseHeader,
      isRemarkHeader
    );


  /*
    Original layout:

    J = DATE
    K = DESCRIPTION
    L = AMOUNT
    M = REMARKS
  */

  if (
    expenseDateCol === -1
  ) {
    expenseDateCol = 9;
  }

  if (
    descriptionCol === -1
  ) {
    descriptionCol = 10;
  }

  if (
    amountCol === -1
  ) {
    amountCol = 11;
  }

  if (
    remarksCol === -1
  ) {
    remarksCol = 12;
  }


  for (
    let i =
      expenseHeaderRow + 1;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];

    const dateValue =
      row[expenseDateCol];

    const description =
      row[descriptionCol];

    const amount =
      numberValue(
        row[amountCol]
      );

    const remarks =
      row[remarksCol];


    if (
      dateValue !== "" &&
      description !== "" &&
      amount !== null
    ) {

      const date =
        cleanDate(
          dateValue
        );

      if (date) {

        expenses.push([
          date,
          String(description),
          amount,
          String(
            remarks || ""
          )
        ]);
      }
    }
  }


  return {
    claims,
    redeemed,
    expenses
  };
}


/* =========================================
   ALLOCATION PARSER
   ========================================= */

function parseAllocation(rows) {

  let note =
    rows[1]?.[0] ||
    "";


  /*
    Find:

    DATE | REMARK | IN | OUT
  */

  let headerRowIndex = -1;

  for (
    let r = 0;
    r < rows.length;
    r++
  ) {

    const row =
      rows[r] || [];

    if (
      findSequence(
        row,
        [
          isDateHeader,
          isRemarkHeader,
          isInHeader,
          isOutHeader
        ]
      ) !== -1
    ) {

      headerRowIndex = r;

      break;
    }
  }


  /*
    Original layout:
    Header = row 6
  */

  if (
    headerRowIndex === -1
  ) {
    headerRowIndex = 5;
  }


  const header =
    rows[headerRowIndex] || [];


  /*
    Blocks:

    LEAM
    A B C D

    CP KIDS
    F G H I

    PROJECT
    K L M N
  */

  const blocks = [];

  let searchFrom = 0;


  while (
    searchFrom <
    header.length
  ) {

    const relative =
      findSequence(
        header.slice(
          searchFrom
        ),
        [
          isDateHeader,
          isRemarkHeader,
          isInHeader,
          isOutHeader
        ]
      );


    if (
      relative === -1
    ) {
      break;
    }


    const start =
      searchFrom +
      relative;


    blocks.push(start);


    searchFrom =
      start + 4;
  }


  const starts =
    blocks.length >= 3
      ? blocks.slice(0, 3)
      : [0, 5, 10];


  const names = [
    "leam",
    "cp",
    "project"
  ];


  const percentages = {
    leam: 30,
    cp: 30,
    project: 40
  };


  const result = {

    note: String(note || ""),

    leam: {
      pct: 30,
      in: 0,
      out: 0,
      records: []
    },

    cp: {
      pct: 30,
      in: 0,
      out: 0,
      records: []
    },

    project: {
      pct: 40,
      in: 0,
      out: 0,
      records: []
    }
  };


  /*
    Find percentage labels
    above each block.
  */

  for (
    let b = 0;
    b < 3;
    b++
  ) {

    const start =
      starts[b];

    const name =
      names[b];


    for (
      let r =
        headerRowIndex - 1;
      r >= 0;
      r--
    ) {

      const value =
        rows[r]?.[start];

      const parsed =
        numberValue(value);


      if (
        parsed !== null &&
        String(value).includes("%")
      ) {

        percentages[name] =
          parsed;

        break;
      }
    }


    result[name].pct =
      percentages[name];
  }


  /*
    Read transactions.
  */

  for (
    let rowIndex =
      headerRowIndex + 1;
    rowIndex < rows.length;
    rowIndex++
  ) {

    const row =
      rows[rowIndex] || [];


    for (
      let b = 0;
      b < 3;
      b++
    ) {

      const start =
        starts[b];

      const name =
        names[b];


      const dateValue =
        row[start];

      const remarksValue =
        row[start + 1];

      const inValue =
        numberValue(
          row[start + 2]
        );

      const outValue =
        numberValue(
          row[start + 3]
        );


      const hasData =
        dateValue !== "" ||
        remarksValue !== "" ||
        inValue !== null ||
        outValue !== null;


      if (!hasData) {
        continue;
      }


      const date =
        cleanDate(
          dateValue
        );


      const incoming =
        inValue === null
          ? 0
          : inValue;


      const outgoing =
        outValue === null
          ? 0
          : outValue;


      result[name].in +=
        incoming;


      result[name].out +=
        outgoing;


      if (
        date ||
        remarksValue !== "" ||
        inValue !== null ||
        outValue !== null
      ) {

        result[name].records.push({
          date,
          remarks:
            String(
              remarksValue || ""
            ),
          in: incoming,
          out: outgoing
        });
      }
    }
  }


  return result;
}


/* =========================================
   SET TEXT
   ========================================= */

function setText(
  id,
  value
) {

  const element =
    $(id);

  if (element) {
    element.textContent =
      value;
  }
}


/* =========================================
   ALLOCATION RENDER
   ========================================= */

function renderAllocation(
  prefix,
  data
) {

  if (!data) {
    return;
  }


  const incoming =
    Number(data.in) || 0;

  const outgoing =
    Number(data.out) || 0;

  const balance =
    incoming - outgoing;


  setText(
    prefix + "In",
    money(incoming)
  );

  setText(
    prefix + "Out",
    money(outgoing)
  );

  setText(
    prefix + "Balance",
    money(balance)
  );


  setText(
    prefix + "Percentage",
    `${data.pct}%`
  );


  const percentage =
    document.querySelector(
      `[data-allocation="${prefix}"]`
    );


  if (percentage) {

    percentage.textContent =
      `${data.pct}%`;
  }


  const records =
    $(
      prefix +
      "Records"
    );

  const noRecords =
    $(
      prefix +
      "NoRecords"
    );


  if (
    !records ||
    !noRecords
  ) {
    return;
  }


  if (
    !data.records ||
    !data.records.length
  ) {

    records.innerHTML =
      "";

    noRecords.style.display =
      "block";

    return;
  }


  noRecords.style.display =
    "none";


  records.innerHTML =
    data.records
      .map(record => {

        return `
          <div class="allocation-record">

            <span>
              ${escapeHTML(
                dateText(
                  record.date
                )
              )}
            </span>

            <span>
              ${escapeHTML(
                record.remarks
              )}
            </span>

            <strong>
              ${
                record.in
                  ? money(record.in)
                  : "—"
              }
            </strong>

            <strong>
              ${
                record.out
                  ? money(record.out)
                  : "—"
              }
            </strong>

          </div>
        `;
      })
      .join("");
}


/* =========================================
   RENDER PAGE
   ========================================= */

function renderPage(
  reward,
  allocation
) {

  const totalClaimed =
    reward.claims.reduce(
      (sum, row) =>
        sum +
        Number(row[1] || 0),
      0
    );


  const totalRedeemed =
    reward.redeemed.reduce(
      (sum, row) =>
        sum +
        Number(row[1] || 0),
      0
    );


  const totalProceeds =
    reward.redeemed.reduce(
      (sum, row) =>
        sum +
        Number(row[4] || 0),
      0
    );


  const totalExpenses =
    reward.expenses.reduce(
      (sum, row) =>
        sum +
        Number(row[2] || 0),
      0
    );


  /* =====================================
     SUMMARY
     ===================================== */

  setText(
    "totalClaimed",
    sol(totalClaimed)
  );

  setText(
    "totalRedeemed",
    sol(totalRedeemed)
  );

  setText(
    "totalProceeds",
    money(totalProceeds)
  );

  setText(
    "totalExpenses",
    money(totalExpenses)
  );


  setText(
    "claimsTotal",
    sol(totalClaimed)
  );

  setText(
    "redeemedTotal",
    sol(totalRedeemed)
  );

  setText(
    "proceedsTotal",
    money(totalProceeds)
  );

  setText(
    "expensesTotal",
    money(totalExpenses)
  );


  /* =====================================
     COUNTS
     ===================================== */

  setText(
    "claimedCount",
    `${reward.claims.length} ${
      reward.claims.length === 1
        ? "record"
        : "records"
    }`
  );


  setText(
    "redeemedCount",
    `${reward.redeemed.length} ${
      reward.redeemed.length === 1
        ? "record"
        : "records"
    }`
  );


  setText(
    "expenseCount",
    `${reward.expenses.length} ${
      reward.expenses.length === 1
        ? "record"
        : "records"
    }`
  );


  /* =====================================
     CLAIMED TABLE
     ===================================== */

  const claimsTable =
    $("claimsTable");


  if (claimsTable) {

    claimsTable.innerHTML =
      reward.claims
        .map(row => {

          return `
            <tr>

              <td>
                ${escapeHTML(
                  dateText(row[0])
                )}
              </td>

              <td class="num">
                ${num(row[1])} SOL
              </td>

            </tr>
          `;
        })
        .join("");
  }


  /* =====================================
     REDEEMED TABLE
     ===================================== */

  const redeemedTable =
    $("redeemedTable");


  if (redeemedTable) {

    redeemedTable.innerHTML =
      reward.redeemed
        .map(row => {

          return `
            <tr>

              <td>
                ${escapeHTML(
                  dateText(row[0])
                )}
              </td>

              <td class="num">
                ${num(row[1])} SOL
              </td>

              <td class="num">
                ${
                  row[2] === null
                    ? "—"
                    : usd(row[2])
                }
              </td>

              <td class="num">
                ${
                  row[3] === null
                    ? "—"
                    : usd(row[3])
                }
              </td>

              <td class="num">
                ${money(row[4])}
              </td>

            </tr>
          `;
        })
        .join("");
  }


  /* =====================================
     REDEEMED EMPTY STATE
     ===================================== */

  const redeemedEmpty =
    $("redeemedEmpty");

  const redeemedWrap =
    $("redeemedWrap");


  if (
    reward.redeemed.length === 0
  ) {

    if (redeemedEmpty) {
      redeemedEmpty.classList.remove(
        "hidden"
      );
    }

    if (redeemedWrap) {
      redeemedWrap.classList.add(
        "hidden"
      );
    }

  } else {

    if (redeemedEmpty) {
      redeemedEmpty.classList.add(
        "hidden"
      );
    }

    if (redeemedWrap) {
      redeemedWrap.classList.remove(
        "hidden"
      );
    }
  }


  /* =====================================
     EXPENSES
     ===================================== */

  const expensesTable =
    $("expensesTable");


  if (expensesTable) {

    expensesTable.innerHTML =
      reward.expenses
        .map(row => {

          return `
            <tr>

              <td>
                ${escapeHTML(
                  dateText(row[0])
                )}
              </td>

              <td>
                ${escapeHTML(
                  row[1]
                )}
              </td>

              <td class="num">
                ${money(row[2])}
              </td>

              <td>
                ${escapeHTML(
                  row[3]
                )}
              </td>

            </tr>
          `;
        })
        .join("");
  }


  /* =====================================
     ALLOCATION
     ===================================== */

  renderAllocation(
    "leam",
    allocation.leam
  );

  renderAllocation(
    "cp",
    allocation.cp
  );

  renderAllocation(
    "project",
    allocation.project
  );


  setText(
    "allocationNote",
    allocation.note ||
    "Creator Reward funds are allocated across direct support, cerebral palsy support, and Gentle Warrior projects."
  );


  /* =====================================
     ALLOCATION TOTAL
     ===================================== */

  const totalPercentage =
    Number(
      allocation.leam.pct
    ) +
    Number(
      allocation.cp.pct
    ) +
    Number(
      allocation.project.pct
    );


  setText(
    "allocationTotalPercentage",
    `${totalPercentage}%`
  );


  /* =====================================
     LATEST ACTIVITY
     ===================================== */

  const dates = [

    ...reward.claims.map(
      row => row[0]
    ),

    ...reward.redeemed.map(
      row => row[0]
    ),

    ...reward.expenses.map(
      row => row[0]
    ),

    ...allocation.leam.records.map(
      row => row.date
    ),

    ...allocation.cp.records.map(
      row => row.date
    ),

    ...allocation.project.records.map(
      row => row.date
    )

  ]
    .filter(Boolean)
    .map(cleanDate)
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.getTime() -
        b.getTime()
    );


  if (dates.length) {

    setText(
      "latestEntry",
      "Latest recorded activity: " +
      dateText(
        dates[
          dates.length - 1
        ]
      )
    );

  } else {

    setText(
      "latestEntry",
      "No records available yet."
    );
  }


  /* =====================================
     STATUS
     ===================================== */

  const status =
    $("dataStatus");


  if (status) {

    status.className =
      "status live";

    status.textContent =
      "● Live Google Sheet data";
  }
}


/* =========================================
   ERROR
   ========================================= */

function showError(error) {

  console.error(
    "[GWAR] Transparency error:",
    error
  );


  const status =
    $("dataStatus");


  if (status) {

    status.className =
      "status fallback";

    status.textContent =
      "Data unavailable";
  }


  setText(
    "latestEntry",
    "Unable to load live transparency data."
  );
}


/* =========================================
   LOAD
   ========================================= */

async function loadData() {

  const status =
    $("dataStatus");


  if (status) {

    status.className =
      "status";

    status.textContent =
      "Loading...";
  }


  try {

    console.log(
      "[GWAR] Loading REWARD..."
    );


    console.log(
      "[GWAR] Loading ALLOCATION..."
    );


    const [
      rewardRows,
      allocationRows
    ] = await Promise.all([

      fetchSheet(
        CONFIG.rewardSheet
      ),

      fetchSheet(
        CONFIG.allocationSheet
      )

    ]);


    console.log(
      "[GWAR] Reward rows:",
      rewardRows
    );


    console.log(
      "[GWAR] Allocation rows:",
      allocationRows
    );


    const reward =
      parseReward(
        rewardRows
      );


    const allocation =
      parseAllocation(
        allocationRows
      );


    console.log(
      "[GWAR] Parsed reward:",
      reward
    );


    console.log(
      "[GWAR] Parsed allocation:",
      allocation
    );


    renderPage(
      reward,
      allocation
    );


  } catch (error) {

    showError(error);
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


  sections.forEach(section => {

    const heading =
      section.querySelector(
        ".section-heading"
      );


    if (!heading) {
      return;
    }


    function toggle() {

      const open =
        section.classList.contains(
          "open"
        );


      section.classList.toggle(
        "open",
        !open
      );


      heading.setAttribute(
        "aria-expanded",
        String(!open)
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

        pills.forEach(item => {

          item.classList.remove(
            "active"
          );
        });


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
   ACCORDION STATE
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
   INITIALIZE
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
