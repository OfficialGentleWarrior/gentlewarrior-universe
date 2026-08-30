/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT.JS
   ========================================= */

"use strict";


/* =========================================
   CONFIG
   ========================================= */

const C = GWAR_CONFIG;


/* =========================================
   DOM
   ========================================= */

const $ = (id) =>
  document.getElementById(id);


/* =========================================
   NUMBER FORMATTING
   ========================================= */

function money(value) {

  const n = Number(value) || 0;

  return (
    "₱" +
    n.toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )
  );

}


function sol(value) {

  const n = Number(value) || 0;

  return (
    n.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ) +
    " SOL"
  );

}


function num(value) {

  const n = Number(value) || 0;

  return n.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );

}


/* =========================================
   SAFE NUMBER PARSER
   ========================================= */

function toNumber(value) {

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


  let text =
    String(value)
      .trim();


  if (!text) {
    return null;
  }


  /*
   * Remove currency symbols,
   * commas and spaces.
   */

  text =
    text
      .replace(/₱/g, "")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/\s/g, "")
      .trim();


  /*
   * Percentage values:
   *
   * 30% -> 30
   */

  if (text.endsWith("%")) {

    text =
      text.slice(
        0,
        -1
      );

  }


  /*
   * Support accounting-style negatives:
   *
   * (1000) -> -1000
   */

  let negative = false;

  if (
    text.startsWith("(") &&
    text.endsWith(")")
  ) {

    negative = true;

    text =
      text.slice(
        1,
        -1
      );

  }


  const n =
    Number(text);


  if (!Number.isFinite(n)) {
    return null;
  }


  return negative
    ? -n
    : n;

}


/* =========================================
   DATE
   ========================================= */

function cleanDate(value) {

  if (!value) {
    return "";
  }


  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime()
    )
      ? ""
      : value;
  }


  const text =
    String(value)
      .trim();


  if (!text) {
    return "";
  }


  /*
   * Google Visualization date:
   *
   * Date(2026,7,8)
   *
   * Month is zero based.
   */

  const match =
    text.match(
      /Date\((\d+),(\d+),(\d+)\)/
    );


  if (match) {

    const date =
      new Date(
        Number(match[1]),
        Number(match[2]),
        Number(match[3])
      );


    return Number.isNaN(
      date.getTime()
    )
      ? ""
      : date;

  }


  /*
   * Some Google Sheets values may
   * arrive as timestamps.
   */

  if (
    /^\d+$/.test(text)
  ) {

    const timestamp =
      Number(text);


    if (
      timestamp > 1000000000
    ) {

      const date =
        new Date(timestamp);


      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {

        return date;

      }

    }

  }


  const date =
    new Date(text);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }


  return date;

}


function dateText(value) {

  const date =
    cleanDate(value);


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
   GOOGLE GVIZ PARSER
   ========================================= */

function parseGviz(text) {

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
    json.status &&
    json.status !== "ok"
  ) {

    throw new Error(
      json.errors?.[0]?.detailed_message ||
      json.errors?.[0]?.message ||
      "Google Sheets returned an error."
    );

  }


  const table =
    json.table;


  if (!table) {

    throw new Error(
      "No Google Sheets table returned."
    );

  }


  const rows =
    table.rows || [];


  /*
   * IMPORTANT
   *
   * fetchSheet() requests:
   *
   * headers=0
   *
   * Therefore GViz does NOT consume
   * spreadsheet Row 1 as a header.
   *
   * rows[0] = spreadsheet Row 1
   * rows[1] = spreadsheet Row 2
   * rows[2] = spreadsheet Row 3
   * etc.
   *
   * This keeps the sheet indexes used
   * below aligned with the actual sheet.
   */


  return rows.map(
    row => {

      const cells =
        row.c || [];


      const result =
        [];


      /*
       * Allocation uses A:N
       * = 14 columns.
       *
       * Reward also fits within
       * the first 14 columns.
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


        /*
         * IMPORTANT:
         *
         * Keep formatted values when
         * available because dates and
         * currency may be formatted
         * by Google Sheets.
         */

        result.push(
          cell.f ??
          cell.v ??
          ""
        );

      }


      return result;

    }
  );

}


/* =========================================
   FETCH GOOGLE SHEET
   ========================================= */

async function fetchSheet(
  sheetName
) {

  /*
   * IMPORTANT FIX:
   *
   * headers=0
   *
   * This prevents Google GViz from
   * treating the first spreadsheet row
   * as the query header.
   *
   * That means our JavaScript indexes
   * match the actual spreadsheet rows.
   */

  const url =
    `https://docs.google.com/spreadsheets/d/${C.sheetId}/gviz/tq?tqx=out:json&headers=0&sheet=${encodeURIComponent(sheetName)}`;


  const response =
    await fetch(
      url,
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `Google Sheet request failed: ${response.status}`
    );

  }


  const text =
    await response.text();


  return parseGviz(text);

}


/* =========================================
   REWARD SHEET
   ========================================= */

function parseReward(rows) {

  const claims = [];

  const redeemed = [];

  const expenses = [];


  /*
   * REWARD SHEET
   *
   * Row 1:
   *
   * A = CLAIMED
   * D = REDEEMED
   * J = EXPENSES
   *
   * Row 2:
   *
   * A = DATE
   * B = SOL CLAIMED
   *
   * D = DATE
   * E = SOLD SOL
   * F = RATE
   * G = $
   * H = IN PESO
   *
   * J = DATE
   * K = DESCRIPTION
   * L = AMOUNT
   * M = REMARKS
   *
   * Data starts Row 3.
   *
   * Because headers=0:
   *
   * Spreadsheet Row 3 = rows[2]
   */


  for (
    let i = 2;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];


    /* =====================================
       CLAIMED
       A = DATE
       B = SOL CLAIMED
       ===================================== */

    const claimDate =
      row[0];


    const claimSOL =
      toNumber(
        row[1]
      );


    if (
      claimDate !== "" &&
      claimSOL !== null
    ) {

      const date =
        cleanDate(
          claimDate
        );


      if (date) {

        claims.push(
          [
            date,
            claimSOL
          ]
        );

      }

    }


    /* =====================================
       REDEEMED / SOLD
       D = DATE
       E = SOLD SOL
       F = RATE
       G = $
       H = IN PESO
       ===================================== */

    const soldDate =
      row[3];


    const soldSOL =
      toNumber(
        row[4]
      );


    if (
      soldDate !== "" &&
      soldSOL !== null
    ) {

      const date =
        cleanDate(
          soldDate
        );


      if (date) {

        const rate =
          toNumber(
            row[5]
          );


        const usd =
          toNumber(
            row[6]
          );


        const php =
          toNumber(
            row[7]
          );


        redeemed.push(
          [
            date,
            soldSOL,
            rate,
            usd,
            php
          ]
        );

      }

    }


    /* =====================================
       EXPENSES
       J = DATE
       K = DESCRIPTION
       L = AMOUNT
       M = REMARKS
       ===================================== */

    const expenseDate =
      row[9];


    const description =
      row[10];


    const amount =
      toNumber(
        row[11]
      );


    const remarks =
      row[12];


    if (
      expenseDate !== "" &&
      description !== "" &&
      amount !== null
    ) {

      const date =
        cleanDate(
          expenseDate
        );


      if (date) {

        expenses.push(
          [
            date,
            String(description),
            amount,
            String(
              remarks || ""
            )
          ]
        );

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
   ALLOCATION SHEET
   ========================================= */

function parseAllocation(rows) {

  /*
   * EXACT ALLOCATION STRUCTURE
   *
   * =======================================
   *
   * LEAM
   *
   * A5 = percentage
   *
   * A6 = DATE
   * B6 = REMARK
   * C6 = IN
   * D6 = OUT
   *
   * Data starts Row 7.
   *
   * =======================================
   *
   * CP KIDS
   *
   * F5 = percentage
   *
   * F6 = DATE
   * G6 = REMARK
   * H6 = IN
   * I6 = OUT
   *
   * Data starts Row 7.
   *
   * =======================================
   *
   * PROJECT
   *
   * K5 = percentage
   *
   * K6 = DATE
   * L6 = REMARK
   * M6 = IN
   * N6 = OUT
   *
   * Data starts Row 7.
   *
   * =======================================
   *
   * A2 = transparency note
   *
   * Because headers=0:
   *
   * Spreadsheet Row 2 = rows[1]
   * Spreadsheet Row 5 = rows[4]
   * Spreadsheet Row 7 = rows[6]
   */


  const fallback =
    C.fallback?.allocation || {};


  /* =====================================
     NOTE
     ===================================== */

  let note =
    rows[1]?.[0] ||
    fallback.note ||
    "";


  note =
    String(note);


  /* =====================================
     PERCENTAGES
     ===================================== */

  const leamPercentage =
    toNumber(
      rows[4]?.[0]
    );


  const cpPercentage =
    toNumber(
      rows[4]?.[5]
    );


  const projectPercentage =
    toNumber(
      rows[4]?.[10]
    );


  /*
   * Use sheet percentages when available.
   * Otherwise use locked defaults.
   */

  const leamPct =
    leamPercentage !== null
      ? leamPercentage
      : 30;


  const cpPct =
    cpPercentage !== null
      ? cpPercentage
      : 30;


  const projectPct =
    projectPercentage !== null
      ? projectPercentage
      : 40;


  /* =====================================
     TOTALS
     ===================================== */

  let leamIn = 0;

  let leamOut = 0;


  let cpIn = 0;

  let cpOut = 0;


  let projectIn = 0;

  let projectOut = 0;


  /* =====================================
     RECORDS
     ===================================== */

  const leamRecords = [];

  const cpRecords = [];

  const projectRecords = [];


  /*
   * Spreadsheet Row 7
   * = array index 6
   */

  for (
    let rowIndex = 6;
    rowIndex < rows.length;
    rowIndex++
  ) {

    const row =
      rows[rowIndex] || [];


    /* ===================================
       LEAM
       A = DATE
       B = REMARK
       C = IN
       D = OUT
       =================================== */

    const leamDate =
      row[0];


    const leamRemarks =
      row[1];


    const leamInValue =
      toNumber(
        row[2]
      );


    const leamOutValue =
      toNumber(
        row[3]
      );


    const hasLeamData =
      leamDate !== "" ||
      leamRemarks !== "" ||
      leamInValue !== null ||
      leamOutValue !== null;


    if (hasLeamData) {

      const date =
        cleanDate(
          leamDate
        );


      const safeIn =
        leamInValue === null
          ? 0
          : leamInValue;


      const safeOut =
        leamOutValue === null
          ? 0
          : leamOutValue;


      leamIn +=
        safeIn;


      leamOut +=
        safeOut;


      leamRecords.push(
        {
          date,
          remarks:
            String(
              leamRemarks || ""
            ),
          in:
            safeIn,
          out:
            safeOut
        }
      );

    }


    /* ===================================
       CP KIDS
       F = DATE
       G = REMARK
       H = IN
       I = OUT
       =================================== */

    const cpDate =
      row[5];


    const cpRemarks =
      row[6];


    const cpInValue =
      toNumber(
        row[7]
      );


    const cpOutValue =
      toNumber(
        row[8]
      );


    const hasCPData =
      cpDate !== "" ||
      cpRemarks !== "" ||
      cpInValue !== null ||
      cpOutValue !== null;


    if (hasCPData) {

      const date =
        cleanDate(
          cpDate
        );


      const safeIn =
        cpInValue === null
          ? 0
          : cpInValue;


      const safeOut =
        cpOutValue === null
          ? 0
          : cpOutValue;


      cpIn +=
        safeIn;


      cpOut +=
        safeOut;


      cpRecords.push(
        {
          date,
          remarks:
            String(
              cpRemarks || ""
            ),
          in:
            safeIn,
          out:
            safeOut
        }
      );

    }


    /* ===================================
       PROJECT
       K = DATE
       L = REMARK
       M = IN
       N = OUT
       =================================== */

    const projectDate =
      row[10];


    const projectRemarks =
      row[11];


    const projectInValue =
      toNumber(
        row[12]
      );


    const projectOutValue =
      toNumber(
        row[13]
      );


    const hasProjectData =
      projectDate !== "" ||
      projectRemarks !== "" ||
      projectInValue !== null ||
      projectOutValue !== null;


    if (hasProjectData) {

      const date =
        cleanDate(
          projectDate
        );


      const safeIn =
        projectInValue === null
          ? 0
          : projectInValue;


      const safeOut =
        projectOutValue === null
          ? 0
          : projectOutValue;


      projectIn +=
        safeIn;


      projectOut +=
        safeOut;


      projectRecords.push(
        {
          date,
          remarks:
            String(
              projectRemarks || ""
            ),
          in:
            safeIn,
          out:
            safeOut
        }
      );

    }

  }


  return {

    note,

    leam: {
      pct:
        leamPct,
      in:
        leamIn,
      out:
        leamOut,
      records:
        leamRecords
    },

    cp: {
      pct:
        cpPct,
      in:
        cpIn,
      out:
        cpOut,
      records:
        cpRecords
    },

    project: {
      pct:
        projectPct,
      in:
        projectIn,
      out:
        projectOut,
      records:
        projectRecords
    }

  };

}


/* =========================================
   RENDER
   ========================================= */

function render(
  data,
  source
) {

  /* =====================================
     SUMMARY TOTALS
     ===================================== */

  const totalClaimed =
    data.claims.reduce(
      (
        total,
        row
      ) =>
        total +
        Number(
          row[1] || 0
        ),
      0
    );


  const totalRedeemed =
    data.redeemed.reduce(
      (
        total,
        row
      ) =>
        total +
        Number(
          row[1] || 0
        ),
      0
    );


  const totalProceeds =
    data.redeemed.reduce(
      (
        total,
        row
      ) =>
        total +
        Number(
          row[4] || 0
        ),
      0
    );


  const totalExpenses =
    data.expenses.reduce(
      (
        total,
        row
      ) =>
        total +
        Number(
          row[2] || 0
        ),
      0
    );


  /* =====================================
     SUMMARY CARDS
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


  /* =====================================
     TABLE TOTALS
     ===================================== */

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
    `${data.claims.length} records`
  );


  setText(
    "redeemedCount",
    `${data.redeemed.length} records`
  );


  setText(
    "expenseCount",
    `${data.expenses.length} records`
  );


  /* =====================================
     CLAIMS TABLE
     ===================================== */

  const claimsTable =
    $("claimsTable");


  if (claimsTable) {

    claimsTable.innerHTML =
      data.claims
        .map(
          row => `
            <tr>

              <td>
                ${escapeHtml(
                  dateText(row[0])
                )}
              </td>

              <td class="num">
                ${num(row[1])} SOL
              </td>

            </tr>
          `
        )
        .join("");

  }


  /* =====================================
     REDEEMED TABLE
     ===================================== */

  const redeemedTable =
    $("redeemedTable");


  if (redeemedTable) {

    redeemedTable.innerHTML =
      data.redeemed
        .map(
          row => `
            <tr>

              <td>
                ${escapeHtml(
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
                    : money(row[2])
                }
              </td>

              <td class="num">
                ${
                  row[3] === null
                    ? "—"
                    : "$" + num(row[3])
                }
              </td>

              <td class="num">
                ${money(row[4])}
              </td>

            </tr>
          `
        )
        .join("");

  }


  /* =====================================
     EXPENSES TABLE
     ===================================== */

  const expensesTable =
    $("expensesTable");


  if (expensesTable) {

    expensesTable.innerHTML =
      data.expenses
        .map(
          row => `
            <tr>

              <td>
                ${escapeHtml(
                  dateText(row[0])
                )}
              </td>

              <td>
                ${escapeHtml(
                  row[1]
                )}
              </td>

              <td class="num">
                ${money(row[2])}
              </td>

              <td>
                ${escapeHtml(
                  row[3]
                )}
              </td>

            </tr>
          `
        )
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
    data.redeemed.length === 0
  ) {

    if (redeemedEmpty) {

      redeemedEmpty
        .classList
        .remove(
          "hidden"
        );

    }


    if (redeemedWrap) {

      redeemedWrap
        .classList
        .add(
          "hidden"
        );

    }

  } else {

    if (redeemedEmpty) {

      redeemedEmpty
        .classList
        .add(
          "hidden"
        );

    }


    if (redeemedWrap) {

      redeemedWrap
        .classList
        .remove(
          "hidden"
        );

    }

  }


  /* =====================================
     ALLOCATION
     ===================================== */

  const allocation =
    data.allocation;


  setAllocation(
    "leam",
    allocation.leam
  );


  setAllocation(
    "cp",
    allocation.cp
  );


  setAllocation(
    "project",
    allocation.project
  );


  setText(
    "allocationNote",
    allocation.note
  );


  /* =====================================
     PERCENTAGE LABELS
     ===================================== */

  setAllocationPercentage(
    "leam",
    allocation.leam.pct
  );


  setAllocationPercentage(
    "cp",
    allocation.cp.pct
  );


  setAllocationPercentage(
    "project",
    allocation.project.pct
  );


  /* =====================================
     ALLOCATION TRANSACTION TABLES
     ===================================== */

  renderAllocationRecords(
    "leam",
    allocation.leam.records
  );


  renderAllocationRecords(
    "cp",
    allocation.cp.records
  );


  renderAllocationRecords(
    "project",
    allocation.project.records
  );


  /* =====================================
     LATEST ENTRY
     ===================================== */

  const dates = [

    ...data.claims
      .map(
        row => row[0]
      ),

    ...data.redeemed
      .map(
        row => row[0]
      ),

    ...data.expenses
      .map(
        row => row[0]
      ),

    ...allocation.leam.records
      .map(
        row => row.date
      ),

    ...allocation.cp.records
      .map(
        row => row.date
      ),

    ...allocation.project.records
      .map(
        row => row.date
      )

  ]
    .filter(Boolean)
    .map(
      value =>
        cleanDate(value)
    )
    .filter(Boolean)
    .sort(
      (
        a,
        b
      ) =>
        a.getTime() -
        b.getTime()
    );


  if (dates.length) {

    setText(
      "latestEntry",
      `Latest recorded activity: ${dateText(
        dates[dates.length - 1]
      )}`
    );

  } else {

    setText(
      "latestEntry",
      ""
    );

  }


  /* =====================================
     STATUS
     ===================================== */

  const status =
    $("dataStatus");


  if (status) {

    status.className =
      `status ${
        source === "live"
          ? "live"
          : "fallback"
      }`;


    status.textContent =
      source === "live"
        ? "● Live Google Sheet data"
        : "● Snapshot data";

  }

}


/* =========================================
   ALLOCATION CARD
   ========================================= */

function setAllocation(
  prefix,
  allocation
) {

  const input =
    Number(
      allocation?.in || 0
    );


  const output =
    Number(
      allocation?.out || 0
    );


  const balance =
    input -
    output;


  setText(
    prefix + "In",
    money(input)
  );


  setText(
    prefix + "Out",
    money(output)
  );


  setText(
    prefix + "Balance",
    money(balance)
  );

}


/* =========================================
   ALLOCATION PERCENTAGE
   ========================================= */

function setAllocationPercentage(
  prefix,
  percentage
) {

  const value =
    Number(
      percentage
    );


  const safe =
    Number.isFinite(value)
      ? value
      : 0;


  /*
   * Supports:
   *
   * data-allocation="leam"
   * data-allocation="cp"
   * data-allocation="project"
   */

  const element =
    document.querySelector(
      `[data-allocation="${prefix}"]`
    );


  if (element) {

    element.textContent =
      `${safe}%`;

  }


  /*
   * Also supports:
   *
   * leamPercentage
   * cpPercentage
   * projectPercentage
   */

  setText(
    prefix + "Percentage",
    `${safe}%`
  );

}


/* =========================================
   ALLOCATION RECORDS
   ========================================= */

function renderAllocationRecords(
  prefix,
  records
) {

  /*
   * Preferred existing IDs.
   *
   * If the HTML already has these,
   * we simply fill them.
   */

  const possibleIds = [

    prefix + "Records",

    prefix + "RecordsTable",

    prefix + "AllocationRecords",

    prefix + "Transactions"

  ];


  let container = null;


  for (
    const id of possibleIds
  ) {

    const element =
      $(id);


    if (element) {

      container =
        element;

      break;

    }

  }


  /*
   * If no allocation record container
   * exists in the current HTML, do not
   * destroy the existing allocation card.
   *
   * The totals above will still update.
   */

  if (!container) {
    return;
  }


  if (
    !records ||
    records.length === 0
  ) {

    container.innerHTML = `
      <div class="allocation-empty">
        No transactions recorded yet.
      </div>
    `;

    return;

  }


  container.innerHTML = `

    <div class="allocation-records">

      <div class="allocation-record-header">

        <div>Date</div>

        <div>Remark</div>

        <div>In</div>

        <div>Out</div>

      </div>


      ${records
        .map(
          record => `

            <div class="allocation-record-row">

              <div>
                ${escapeHtml(
                  dateText(
                    record.date
                  )
                )}
              </div>

              <div>
                ${escapeHtml(
                  record.remarks
                )}
              </div>

              <div class="num">
                ${money(
                  record.in
                )}
              </div>

              <div class="num">
                ${money(
                  record.out
                )}
              </div>

            </div>

          `
        )
        .join("")
      }

    </div>

  `;

}


/* =========================================
   DOM SETTER
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
   ESCAPE HTML
   ========================================= */

function escapeHtml(
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


/* =========================================
   LOAD DATA
   ========================================= */

async function load() {

  try {

    const [
      rewardRows,
      allocationRows
    ] =
      await Promise.all(
        [

          fetchSheet(
            C.rewardSheet
          ),

          fetchSheet(
            C.allocationSheet
          )

        ]
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
      "GWAR LIVE REWARD ROWS:",
      rewardRows
    );


    console.log(
      "GWAR PARSED REWARD:",
      reward
    );


    console.log(
      "GWAR LIVE ALLOCATION ROWS:",
      allocationRows
    );


    console.log(
      "GWAR PARSED ALLOCATION:",
      allocation
    );


    render(
      {

        claims:
          reward.claims,

        redeemed:
          reward.redeemed,

        expenses:
          reward.expenses,

        allocation:
          allocation

      },
      "live"
    );


  } catch (error) {

    console.error(
      "Live Google Sheet error:",
      error
    );


    /*
     * If Google Sheets cannot be loaded,
     * use the last known snapshot.
     */

    const fallback =
      C.fallback;


    render(
      {

        claims:
          fallback.claims || [],

        redeemed:
          fallback.redeemed || [],

        expenses:
          fallback.expenses || [],

        allocation:
          normalizeFallbackAllocation(
            fallback.allocation
          )

      },
      "fallback"
    );

  }

}


/* =========================================
   FALLBACK ALLOCATION
   ========================================= */

function normalizeFallbackAllocation(
  allocation
) {

  allocation =
    allocation || {};


  return {

    note:
      String(
        allocation.note || ""
      ),


    leam: {

      pct:
        Number(
          allocation.leam?.pct ??
          30
        ),

      in:
        Number(
          allocation.leam?.in ||
          0
        ),

      out:
        Number(
          allocation.leam?.out ||
          0
        ),

      records:
        []

    },


    cp: {

      pct:
        Number(
          allocation.cp?.pct ??
          30
        ),

      in:
        Number(
          allocation.cp?.in ||
          0
        ),

      out:
        Number(
          allocation.cp?.out ||
          0
        ),

      records:
        []

    },


    project: {

      pct:
        Number(
          allocation.project?.pct ??
          40
        ),

      in:
        Number(
          allocation.project?.in ||
          0
        ),

      out:
        Number(
          allocation.project?.out ||
          0
        ),

      records:
        []

    }

  };

}


/* =========================================
   START
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  load
);
