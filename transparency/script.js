/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT.JS
   ========================================= */

"use strict";


/* =========================================
   CONFIG
   ========================================= */

const C = window.GWAR_CONFIG;


/* =========================================
   DOM HELPER
   ========================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================
   NUMBER FORMATTING
   ========================================= */

function money(value) {

  const n = Number(value);

  if (!Number.isFinite(n)) {
    return "₱0.00";
  }

  return (
    "₱" +
    n.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  );
}


function sol(value) {

  const n = Number(value);

  if (!Number.isFinite(n)) {
    return "0.00 SOL";
  }

  return (
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) +
    " SOL"
  );
}


function num(value) {

  const n = Number(value);

  if (!Number.isFinite(n)) {
    return "0.00";
  }

  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


/* =========================================
   SAFE NUMBER PARSER
   ========================================= */

function toNumber(value) {

  if (
    value === null ||
    value === undefined
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
    String(value).trim();

  if (!text) {
    return null;
  }


  /*
   * Remove common currency symbols.
   */

  text =
    text
      .replace(/₱/g, "")
      .replace(/\$/g, "")
      .replace(/PHP/gi, "")
      .replace(/SOL/gi, "")
      .replace(/,/g, "")
      .trim();


  /*
   * Percentage:
   *
   * 30% -> 30
   */

  if (text.endsWith("%")) {

    text =
      text.slice(0, -1).trim();

  }


  /*
   * Handle accounting negatives:
   *
   * (1000) -> -1000
   */

  if (
    text.startsWith("(") &&
    text.endsWith(")")
  ) {

    text =
      "-" +
      text.slice(1, -1);

  }


  const n =
    Number(text);


  return Number.isFinite(n)
    ? n
    : null;
}


/* =========================================
   DATE PARSER
   ========================================= */

function cleanDate(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }


  if (
    value instanceof Date &&
    !Number.isNaN(value.getTime())
  ) {
    return value;
  }


  const text =
    String(value).trim();


  if (!text) {
    return null;
  }


  /*
   * Google Visualization format:
   *
   * Date(2026,7,8)
   *
   * Month is zero-based.
   */

  const gvizMatch =
    text.match(
      /^Date\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?(?:,\s*(\d+))?(?:,\s*(\d+))?\)$/
    );


  if (gvizMatch) {

    const year =
      Number(gvizMatch[1]);

    const month =
      Number(gvizMatch[2]);

    const day =
      Number(gvizMatch[3]);

    const hour =
      Number(gvizMatch[4] || 0);

    const minute =
      Number(gvizMatch[5] || 0);

    const second =
      Number(gvizMatch[6] || 0);


    return new Date(
      year,
      month,
      day,
      hour,
      minute,
      second
    );

  }


  /*
   * Normal browser date parsing.
   */

  const date =
    new Date(text);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }


  return date;
}


/* =========================================
   DATE DISPLAY
   ========================================= */

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

  if (
    typeof text !== "string" ||
    !text
  ) {

    throw new Error(
      "Empty Google Sheets response."
    );

  }


  /*
   * GViz returns something similar to:
   *
   * google.visualization.Query.setResponse({...})
   *
   * Find the JSON object.
   */

  const start =
    text.indexOf("{");

  const end =
    text.lastIndexOf("}");


  if (
    start === -1 ||
    end === -1 ||
    end <= start
  ) {

    throw new Error(
      "Invalid Google Sheets response."
    );

  }


  let json;


  try {

    json =
      JSON.parse(
        text.substring(
          start,
          end + 1
        )
      );

  } catch (error) {

    console.error(
      "GViz JSON parse error:",
      error
    );

    throw new Error(
      "Unable to parse Google Sheets data."
    );

  }


  if (
    json.status &&
    json.status !== "ok"
  ) {

    throw new Error(
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
   * Allocation uses A:N = 14 columns.
   *
   * GViz can omit trailing empty cells.
   *
   * We therefore ALWAYS normalize
   * every row to 14 positions.
   */

  return rows.map(
    row => {

      const cells =
        row?.c || [];

      const result =
        new Array(14).fill("");


      for (
        let i = 0;
        i < 14;
        i++
      ) {

        const cell =
          cells[i];


        if (
          cell === null ||
          cell === undefined
        ) {

          result[i] = "";

          continue;

        }


        /*
         * Prefer raw value for numeric
         * calculations.
         *
         * Use formatted value only
         * when raw value is unavailable.
         */

        if (
          cell.v !== null &&
          cell.v !== undefined
        ) {

          result[i] =
            cell.v;

        } else if (
          cell.f !== null &&
          cell.f !== undefined
        ) {

          result[i] =
            cell.f;

        } else {

          result[i] = "";

        }

      }


      return result;

    }
  );
}


/* =========================================
   GOOGLE SHEET FETCH
   ========================================= */

async function fetchSheet(
  sheetName
) {

  if (
    !C ||
    !C.sheetId
  ) {

    throw new Error(
      "Google Sheet ID is missing."
    );

  }


  if (!sheetName) {

    throw new Error(
      "Google Sheet tab name is missing."
    );

  }


  /*
   * Cache-busting parameter prevents
   * browser/proxy from showing an old
   * snapshot.
   */

  const cacheBust =
    Date.now();


  const url =
    "https://docs.google.com/spreadsheets/d/" +
    encodeURIComponent(C.sheetId) +
    "/gviz/tq" +
    "?tqx=out:json" +
    "&sheet=" +
    encodeURIComponent(sheetName) +
    "&_=" +
    cacheBust;


  let response;


  try {

    response =
      await fetch(
        url,
        {
          method: "GET",
          cache: "no-store",
          credentials: "omit",
          redirect: "follow"
        }
      );

  } catch (error) {

    throw new Error(
      "Unable to connect to Google Sheets."
    );

  }


  if (!response.ok) {

    throw new Error(
      `Google Sheets request failed: ${response.status}`
    );

  }


  const text =
    await response.text();


  return parseGviz(text);
}


/* =========================================
   REWARD SHEET PARSER
   ========================================= */

function parseReward(rows) {

  const claims = [];

  const redeemed = [];

  const expenses = [];


  /*
   * REWARD SHEET
   *
   * ROW 1
   *
   * A1 = CLAIMED
   * B1 = TOTAL CLAIMED
   *
   * D1 = REDEEMED
   *
   * J1 = EXPENSES
   *
   *
   * ROW 2
   *
   * A2 = DATE
   * B2 = SOL CLAIMED
   *
   * D2 = DATE
   * E2 = SOLD SOL
   * F2 = RATE
   * G2 = $
   * H2 = IN PESO
   *
   * J2 = DATE
   * K2 = DESCRIPTION
   * L2 = AMOUNT
   * M2 = REMARKS
   *
   *
   * DATA STARTS ROW 3
   *
   * Array index = sheet row - 1
   *
   * Therefore:
   *
   * Row 3 = index 2
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


    /*
     * A date AND B amount required.
     */

    if (
      claimDate !== "" &&
      claimDate !== null &&
      claimSOL !== null
    ) {

      const date =
        cleanDate(
          claimDate
        );


      if (date) {

        claims.push([
          date,
          claimSOL
        ]);

      }

    }


    /* =====================================
       REDEEMED
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


    /*
     * Do NOT require RATE/$/PHP.
     *
     * A valid sold transaction only needs
     * DATE + SOLD SOL.
     */

    if (
      soldDate !== "" &&
      soldDate !== null &&
      soldSOL !== null &&
      soldSOL > 0
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


        redeemed.push([
          date,
          soldSOL,
          rate,
          usd,
          php
        ]);

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


    /*
     * Expense requires:
     *
     * DATE
     * DESCRIPTION
     * AMOUNT
     */

    if (
      expenseDate !== "" &&
      expenseDate !== null &&
      description !== "" &&
      description !== null &&
      amount !== null
    ) {

      const date =
        cleanDate(
          expenseDate
        );


      if (date) {

        expenses.push([
          date,
          String(description),
          amount,
          String(remarks ?? "")
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
   ALLOCATION SHEET PARSER
   ========================================= */

function parseAllocation(rows) {

  /*
   * ========================================
   * LOCKED ALLOCATION STRUCTURE
   * ========================================
   *
   * ROW 2
   *
   * A2 = TRANSPARENCY NOTE
   *
   *
   * ROW 4
   *
   * BALANCE / FORMULAS
   *
   * IGNORE COMPLETELY.
   *
   *
   * ROW 5
   *
   * A5 = LEAM %
   * F5 = CP KIDS %
   * K5 = PROJECT %
   *
   * !!! PERCENTAGE LABEL ONLY !!!
   *
   * NEVER treat these as transactions.
   *
   *
   * ROW 6
   *
   * Headers only.
   *
   *
   * ROW 7 ONWARD
   *
   * Actual allocation transactions.
   *
   *
   * LEAM
   *
   * A = DATE
   * B = REMARKS
   * C = IN
   * D = OUT
   *
   *
   * CP KIDS
   *
   * F = DATE
   * G = REMARKS
   * H = IN
   * I = OUT
   *
   *
   * PROJECT
   *
   * K = DATE
   * L = REMARKS
   * M = IN
   * N = OUT
   *
   * ========================================
   */


  const fallback =
    C?.fallback?.allocation || {};


  /* =====================================
     TRANSPARENCY NOTE
     ===================================== */

  /*
   * A2 = array index 1
   */

  let note =
    rows[1]?.[0];


  /*
   * If empty, use fallback note.
   */

  if (
    note === null ||
    note === undefined ||
    String(note).trim() === ""
  ) {

    note =
      fallback.note || "";

  }


  note =
    String(note);


  /* =====================================
     PERCENTAGE LABELS
     ===================================== */

  /*
   * VERY IMPORTANT:
   *
   * Row 5 = array index 4.
   *
   * We ONLY read these cells
   * as labels.
   */

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


  const leamPct =
    leamPercentage !== null
      ? leamPercentage
      : Number(
          fallback.leam?.pct ?? 30
        );


  const cpPct =
    cpPercentage !== null
      ? cpPercentage
      : Number(
          fallback.cp?.pct ?? 30
        );


  const projectPct =
    projectPercentage !== null
      ? projectPercentage
      : Number(
          fallback.project?.pct ?? 40
        );


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
     TRANSACTION RECORDS
     ===================================== */

  const leamRecords = [];

  const cpRecords = [];

  const projectRecords = [];


  /*
   * START AT ROW 7.
   *
   * Sheet Row 7 = JavaScript index 6.
   *
   * This intentionally skips:
   *
   * Row 4
   * Row 5
   * Row 6
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
       A DATE
       B REMARKS
       C IN
       D OUT
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


    /*
     * IMPORTANT:
     *
     * An empty row must NOT become
     * a transaction.
     */

    const hasLeamData =
      (
        leamDate !== "" &&
        leamDate !== null &&
        leamDate !== undefined
      ) ||
      (
        leamRemarks !== "" &&
        leamRemarks !== null &&
        leamRemarks !== undefined
      ) ||
      leamInValue !== null ||
      leamOutValue !== null;


    if (hasLeamData) {

      const date =
        cleanDate(
          leamDate
        );


      const safeIn =
        leamInValue !== null
          ? leamInValue
          : 0;


      const safeOut =
        leamOutValue !== null
          ? leamOutValue
          : 0;


      /*
       * Only add to totals when there
       * is actual IN/OUT movement.
       */

      leamIn +=
        safeIn;


      leamOut +=
        safeOut;


      /*
       * Keep a record if there is
       * meaningful row data.
       */

      if (
        date ||
        leamRemarks ||
        leamInValue !== null ||
        leamOutValue !== null
      ) {

        leamRecords.push({
          date,
          remarks:
            String(
              leamRemarks ?? ""
            ),
          in:
            safeIn,
          out:
            safeOut
        });

      }

    }


    /* ===================================
       CP KIDS
       F DATE
       G REMARKS
       H IN
       I OUT
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
      (
        cpDate !== "" &&
        cpDate !== null &&
        cpDate !== undefined
      ) ||
      (
        cpRemarks !== "" &&
        cpRemarks !== null &&
        cpRemarks !== undefined
      ) ||
      cpInValue !== null ||
      cpOutValue !== null;


    if (hasCPData) {

      const date =
        cleanDate(
          cpDate
        );


      const safeIn =
        cpInValue !== null
          ? cpInValue
          : 0;


      const safeOut =
        cpOutValue !== null
          ? cpOutValue
          : 0;


      cpIn +=
        safeIn;


      cpOut +=
        safeOut;


      if (
        date ||
        cpRemarks ||
        cpInValue !== null ||
        cpOutValue !== null
      ) {

        cpRecords.push({
          date,
          remarks:
            String(
              cpRemarks ?? ""
            ),
          in:
            safeIn,
          out:
            safeOut
        });

      }

    }


    /* ===================================
       PROJECT
       K DATE
       L REMARKS
       M IN
       N OUT
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
      (
        projectDate !== "" &&
        projectDate !== null &&
        projectDate !== undefined
      ) ||
      (
        projectRemarks !== "" &&
        projectRemarks !== null &&
        projectRemarks !== undefined
      ) ||
      projectInValue !== null ||
      projectOutValue !== null;


    if (hasProjectData) {

      const date =
        cleanDate(
          projectDate
        );


      const safeIn =
        projectInValue !== null
          ? projectInValue
          : 0;


      const safeOut =
        projectOutValue !== null
          ? projectOutValue
          : 0;


      projectIn +=
        safeIn;


      projectOut +=
        safeOut;


      if (
        date ||
        projectRemarks ||
        projectInValue !== null ||
        projectOutValue !== null
      ) {

        projectRecords.push({
          date,
          remarks:
            String(
              projectRemarks ?? ""
            ),
          in:
            safeIn,
          out:
            safeOut
        });

      }

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
     SUMMARY
     ===================================== */

  const totalClaimed =
    data.claims.reduce(
      (
        total,
        row
      ) =>
        total +
        Number(row[1] || 0),
      0
    );


  const totalRedeemed =
    data.redeemed.reduce(
      (
        total,
        row
      ) =>
        total +
        Number(row[1] || 0),
      0
    );


  const totalProceeds =
    data.redeemed.reduce(
      (
        total,
        row
      ) =>
        total +
        Number(row[4] || 0),
      0
    );


  const totalExpenses =
    data.expenses.reduce(
      (
        total,
        row
      ) =>
        total +
        Number(row[2] || 0),
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
     CLAIMED TABLE
     ===================================== */

  const claimsTable =
    $("claimsTable");


  if (claimsTable) {

    if (data.claims.length === 0) {

      claimsTable.innerHTML = `
        <tr>
          <td colspan="2">
            No Creator Reward claims recorded yet.
          </td>
        </tr>
      `;

    } else {

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

    if (data.expenses.length === 0) {

      expensesTable.innerHTML = `
        <tr>
          <td colspan="4">
            No expenses recorded yet.
          </td>
        </tr>
      `;

    } else {

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
        .remove("hidden");

    }


    if (redeemedWrap) {

      redeemedWrap
        .classList
        .add("hidden");

    }

  } else {

    if (redeemedEmpty) {

      redeemedEmpty
        .classList
        .add("hidden");

    }


    if (redeemedWrap) {

      redeemedWrap
        .classList
        .remove("hidden");

    }

  }


  /* =====================================
     ALLOCATION
     ===================================== */

  const allocation =
    data.allocation;


  if (allocation) {

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


    setText(
      "allocationNote",
      allocation.note
    );

  }


  /* =====================================
     LATEST ACTIVITY
     ===================================== */

  const dates = [

    ...data.claims.map(
      row => row[0]
    ),

    ...data.redeemed.map(
      row => row[0]
    ),

    ...data.expenses.map(
      row => row[0]
    ),

    ...(allocation?.leam?.records || [])
      .map(
        row => row.date
      ),

    ...(allocation?.cp?.records || [])
      .map(
        row => row.date
      ),

    ...(allocation?.project?.records || [])
      .map(
        row => row.date
      )

  ]
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
     DATA STATUS
     ===================================== */

  const status =
    $("dataStatus");


  if (status) {

    status.className =
      source === "live"
        ? "status live"
        : "status fallback";


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

  if (!allocation) {
    return;
  }


  const input =
    Number(
      allocation.in || 0
    );


  const output =
    Number(
      allocation.out || 0
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
    Number(percentage);


  const safe =
    Number.isFinite(value)
      ? value
      : 0;


  /*
   * Main percentage circle.
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
   * Optional percentage element
   * if present in HTML.
   */

  setText(
    prefix + "Percentage",
    `${safe}%`
  );

}


/* =========================================
   DOM TEXT SETTER
   ========================================= */

function setText(
  id,
  value
) {

  const element =
    $(id);


  if (element) {

    element.textContent =
      value ?? "";

  }

}


/* =========================================
   HTML ESCAPE
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
   LIVE DATA LOAD
   ========================================= */

async function load() {

  const status =
    $("dataStatus");


  if (status) {

    status.className =
      "status live";

    status.textContent =
      "● Connecting to Google Sheet...";

  }


  try {

    /*
     * Fetch BOTH tabs directly
     * from the same Google Spreadsheet.
     */

    const results =
      await Promise.all([
        fetchSheet(
          C.rewardSheet
        ),

        fetchSheet(
          C.allocationSheet
        )
      ]);


    const rewardRows =
      results[0];


    const allocationRows =
      results[1];


    /*
     * Parse Reward tab.
     */

    const reward =
      parseReward(
        rewardRows
      );


    /*
     * Parse Allocation tab.
     */

    const allocation =
      parseAllocation(
        allocationRows
      );


    /*
     * Render live data.
     */

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


    /*
     * Debug information.
     *
     * Useful if we need to inspect
     * the sheet later.
     */

    console.log(
      "GWAR Google Sheet loaded successfully."
    );


    console.log(
      "Claims:",
      reward.claims.length
    );


    console.log(
      "Redeemed:",
      reward.redeemed.length
    );


    console.log(
      "Expenses:",
      reward.expenses.length
    );


    console.log(
      "Allocation:",
      allocation
    );


  } catch (error) {

    console.error(
      "GWAR Google Sheet error:",
      error
    );


    /*
     * IMPORTANT:
     *
     * We do NOT silently pretend that
     * Google Sheet has zero data.
     *
     * If the live sheet fails, show
     * an explicit error.
     */

    if (status) {

      status.className =
        "status fallback";

      status.textContent =
        "● Google Sheet unavailable";

    }


    /*
     * Only use fallback if one exists
     * AND it actually contains data.
     *
     * Otherwise show empty state.
     */

    const fallback =
      C?.fallback || {};


    const hasFallbackData =
      (
        Array.isArray(
          fallback.claims
        ) &&
        fallback.claims.length > 0
      ) ||
      (
        Array.isArray(
          fallback.redeemed
        ) &&
        fallback.redeemed.length > 0
      ) ||
      (
        Array.isArray(
          fallback.expenses
        ) &&
        fallback.expenses.length > 0
      );


    if (hasFallbackData) {

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

    } else {

      /*
       * Keep the page usable but clearly
       * indicate that live data could not
       * be loaded.
       */

      render(
        {
          claims: [],

          redeemed: [],

          expenses: [],

          allocation:
            normalizeFallbackAllocation(
              fallback.allocation
            )

        },
        "fallback"
      );

    }

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
          allocation.leam?.pct ?? 30
        ),

      in:
        Number(
          allocation.leam?.in || 0
        ),

      out:
        Number(
          allocation.leam?.out || 0
        ),

      records: []

    },


    cp: {

      pct:
        Number(
          allocation.cp?.pct ?? 30
        ),

      in:
        Number(
          allocation.cp?.in || 0
        ),

      out:
        Number(
          allocation.cp?.out || 0
        ),

      records: []

    },


    project: {

      pct:
        Number(
          allocation.project?.pct ?? 40
        ),

      in:
        Number(
          allocation.project?.in || 0
        ),

      out:
        Number(
          allocation.project?.out || 0
        ),

      records: []

    }

  };
}


/* =========================================
   START
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    load();

  }
);
