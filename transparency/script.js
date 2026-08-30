/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT.JS — FIXED LIVE SHEET PARSER
   ========================================= */

"use strict";


/* =========================================
   CONFIG
   ========================================= */

const C = Object.assign(
  {
    sheetId:
      "1pXMbQ3QScwSNvreeMO-1xEjr7yRhKw9T",

    rewardSheet:
      "REWARD",

    allocationSheet:
      "ALLOCATION",

    fallback: {
      claims: [],
      redeemed: [],
      expenses: [],

      allocation: {
        note: "",

        leam: {
          pct: 30,
          in: 0,
          out: 0
        },

        cp: {
          pct: 30,
          in: 0,
          out: 0
        },

        project: {
          pct: 40,
          in: 0,
          out: 0
        }
      }
    }
  },

  window.GWAR_CONFIG || {}
);


/* =========================================
   DOM
   ========================================= */

const $ = (id) =>
  document.getElementById(id);


/* =========================================
   NUMBER FORMATTING
   ========================================= */

function money(value) {

  const n =
    Number(value) || 0;

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

  const n =
    Number(value) || 0;

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

  const n =
    Number(value) || 0;

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


  text =
    text
      .replace(/₱/g, "")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/\s/g, "")
      .trim();


  if (
    text.endsWith("%")
  ) {

    text =
      text.slice(
        0,
        -1
      );

  }


  const n =
    Number(text);


  return Number.isFinite(n)
    ? n
    : null;

}


/* =========================================
   TEXT NORMALIZER
   ========================================= */

function normalizeText(value) {

  return String(
    value ?? ""
  )
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[._-]+/g, " ")
    .trim();

}


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

    return value;

  }


  const text =
    String(value)
      .trim();


  /*
   * Google Visualization:
   *
   * Date(2026,7,8)
   */

  const gvizMatch =
    text.match(
      /Date\((\d+),(\d+),(\d+)(?:,\d+,\d+,\d+,\d+)?\)/
    );


  if (gvizMatch) {

    return new Date(
      Number(gvizMatch[1]),
      Number(gvizMatch[2]),
      Number(gvizMatch[3])
    );

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
   * Keep stable 14-column structure.
   *
   * Allocation:
   *
   * A-D = LEAM
   * F-I = CP KIDS
   * K-N = PROJECT
   */

  return rows.map(
    row => {

      const cells =
        row.c || [];


      const result =
        [];


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


        result.push(

          cell.f !== undefined &&
          cell.f !== null

            ? cell.f

            : cell.v !== undefined &&
              cell.v !== null

              ? cell.v

              : ""

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

  if (!C.sheetId) {

    throw new Error(
      "Missing Google Sheet ID."
    );

  }


  /*
   * cachebust prevents browser/proxy
   * from showing old spreadsheet data.
   */

  const url =
    `https://docs.google.com/spreadsheets/d/${C.sheetId}/gviz/tq` +
    `?tqx=out:json&sheet=${encodeURIComponent(sheetName)}` +
    `&cachebust=${Date.now()}`;


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
   HEADER SEARCH HELPERS
   ========================================= */

function findRowWithText(
  rows,
  requiredTexts
) {

  const wanted =
    requiredTexts.map(
      normalizeText
    );


  for (
    let r = 0;
    r < rows.length;
    r++
  ) {

    const row =
      rows[r] || [];


    const normalized =
      row.map(
        normalizeText
      );


    const found =
      wanted.every(
        item =>
          normalized.includes(
            item
          )
      );


    if (found) {

      return r;

    }

  }


  return -1;

}


function findColumn(
  row,
  matcher,
  startAt = 0
) {

  for (
    let i = startAt;
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

    let ok = true;


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

        ok = false;

        break;

      }

    }


    if (ok) {

      return start;

    }

  }


  return -1;

}


/* =========================================
   REWARD SHEET
   ========================================= */

function parseReward(rows) {

  const claims = [];

  const redeemed = [];

  const expenses = [];


  /*
   * We locate the actual headers instead
   * of assuming data always starts on
   * one specific row.
   */

  let claimHeaderRow =
    findRowWithText(
      rows,
      [
        "DATE",
        "SOL CLAIMED"
      ]
    );


  let redeemedHeaderRow =
    findRowWithText(
      rows,
      [
        "DATE",
        "SOLD SOL"
      ]
    );


  let expenseHeaderRow =
    findRowWithText(
      rows,
      [
        "DATE",
        "DESCRIPTION",
        "AMOUNT"
      ]
    );


  /*
   * Original sheet layout fallback.
   *
   * Row 2 in the sheet = index 1.
   */

  if (
    claimHeaderRow === -1
  ) {

    claimHeaderRow = 1;

  }


  if (
    redeemedHeaderRow === -1
  ) {

    redeemedHeaderRow = 1;

  }


  if (
    expenseHeaderRow === -1
  ) {

    expenseHeaderRow = 1;

  }


  /* =====================================
     CLAIMED
     ===================================== */

  {

    const header =
      rows[claimHeaderRow] || [];


    let dateCol =
      findColumn(
        header,
        isDateHeader
      );


    let solCol =
      findColumn(
        header,
        value =>
          normalizeText(value) ===
          "SOL CLAIMED"
      );


    /*
     * Original:
     *
     * A = DATE
     * B = SOL CLAIMED
     */

    if (
      dateCol === -1
    ) {

      dateCol = 0;

    }


    if (
      solCol === -1
    ) {

      solCol = 1;

    }


    for (
      let i =
        claimHeaderRow + 1;
      i < rows.length;
      i++
    ) {

      const row =
        rows[i] || [];


      const claimDate =
        row[dateCol];


      const claimSOL =
        toNumber(
          row[solCol]
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

    }

  }


  /* =====================================
     REDEEMED / SOLD
     ===================================== */

  {

    const header =
      rows[redeemedHeaderRow] ||
      [];


    let dateCol =
      findColumn(
        header,
        isDateHeader
      );


    let soldSolCol =
      findColumn(
        header,
        value =>
          normalizeText(value) ===
          "SOLD SOL"
      );


    let rateCol =
      findColumn(
        header,
        value =>
          normalizeText(value) ===
          "RATE"
      );


    let usdCol =
      findColumn(
        header,
        value => {

          const text =
            normalizeText(
              value
            );


          return (
            text === "$" ||
            text === "USD"
          );

        }
      );


    let phpCol =
      findColumn(
        header,
        value =>
          normalizeText(value) ===
          "IN PESO"
      );


    /*
     * Original:
     *
     * D = DATE
     * E = SOLD SOL
     * F = RATE
     * G = $
     * H = IN PESO
     */

    if (
      dateCol === -1
    ) {

      dateCol = 3;

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
      phpCol === -1
    ) {

      phpCol = 7;

    }


    for (
      let i =
        redeemedHeaderRow + 1;
      i < rows.length;
      i++
    ) {

      const row =
        rows[i] || [];


      const soldDate =
        row[dateCol];


      const soldSOL =
        toNumber(
          row[soldSolCol]
        );


      if (
        soldDate !== "" &&
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
              row[rateCol]
            );


          const usd =
            toNumber(
              row[usdCol]
            );


          const php =
            toNumber(
              row[phpCol]
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

    }

  }


  /* =====================================
     EXPENSES
     ===================================== */

  {

    const header =
      rows[expenseHeaderRow] ||
      [];


    let dateCol =
      findColumn(
        header,
        isDateHeader
      );


    let descriptionCol =
      findColumn(
        header,
        value =>
          normalizeText(value) ===
          "DESCRIPTION"
      );


    let amountCol =
      findColumn(
        header,
        value =>
          normalizeText(value) ===
          "AMOUNT"
      );


    let remarksCol =
      findColumn(
        header,
        isRemarkHeader
      );


    /*
     * Original:
     *
     * J = DATE
     * K = DESCRIPTION
     * L = AMOUNT
     * M = REMARKS
     */

    if (
      dateCol === -1
    ) {

      dateCol = 9;

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


      const expenseDate =
        row[dateCol];


      const description =
        row[descriptionCol];


      const amount =
        toNumber(
          row[amountCol]
        );


      const remarks =
        row[remarksCol];


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
              String(
                description
              ),
              amount,
              String(
                remarks || ""
              )
            ]
          );

        }

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

function parseAllocation(
  rows
) {

  const fallback =
    C.fallback?.allocation ||
    {};


  /* =====================================
     NOTE
     ===================================== */

  let note =
    rows[1]?.[0] ||
    fallback.note ||
    "";


  note =
    String(note);


  /*
   * EXACT REQUIRED LABELS:
   *
   * DATE
   * REMARK / REMARKS
   * IN
   * OUT
   *
   * LEAM:
   * A B C D
   *
   * CP KIDS:
   * F G H I
   *
   * PROJECT:
   * K L M N
   */


  let headerRowIndex =
    -1;


  /*
   * Find the first row containing:
   *
   * DATE | REMARK | IN | OUT
   *
   */

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
   * Original spreadsheet:
   *
   * Row 6 = header
   * Array index 5
   */

  if (
    headerRowIndex === -1
  ) {

    headerRowIndex = 5;

  }


  const header =
    rows[headerRowIndex] ||
    [];


  /*
   * Find all three blocks.
   *
   * Expected:
   *
   * A-D
   * F-I
   * K-N
   */

  const blocks = [];


  let searchFrom = 0;


  while (
    searchFrom <
    header.length
  ) {

    const start =
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
      start === -1
    ) {

      break;

    }


    const actualStart =
      searchFrom + start;


    blocks.push(
      actualStart
    );


    searchFrom =
      actualStart + 4;

  }


  /*
   * If detection doesn't find all 3,
   * use the exact known spreadsheet
   * positions.
   */

  const starts =
    blocks.length >= 3
      ? blocks.slice(0, 3)
      : [
          0,
          5,
          10
        ];


  const names = [
    "leam",
    "cp",
    "project"
  ];


  const percentages = {};


  /* =====================================
     PERCENTAGES
     ===================================== */

  for (
    let b = 0;
    b < 3;
    b++
  ) {

    const start =
      starts[b];


    const name =
      names[b];


    let pct =
      null;


    /*
     * Search upward for:
     *
     * 30%
     * 30%
     * 40%
     */

    for (
      let r =
        headerRowIndex - 1;
      r >= 0;
      r--
    ) {

      const value =
        rows[r]?.[start];


      const parsed =
        toNumber(
          value
        );


      if (
        parsed !== null &&
        String(value)
          .includes("%")
      ) {

        pct = parsed;

        break;

      }

    }


    /*
     * Locked defaults.
     */

    if (
      pct === null
    ) {

      pct =
        name === "leam"
          ? 30
          : name === "cp"
            ? 30
            : 40;

    }


    percentages[name] =
      pct;

  }


  const result = {

    note,

    leam: {

      pct:
        percentages.leam,

      in:
        0,

      out:
        0,

      records: []

    },


    cp: {

      pct:
        percentages.cp,

      in:
        0,

      out:
        0,

      records: []

    },


    project: {

      pct:
        percentages.project,

      in:
        0,

      out:
        0,

      records: []

    }

  };


  /*
   * Transactions start AFTER:
   *
   * DATE | REMARK | IN | OUT
   *
   * This means:
   *
   * header row + 1
   */

  for (
    let rowIndex =
      headerRowIndex + 1;
    rowIndex < rows.length;
    rowIndex++
  ) {

    const row =
      rows[rowIndex] ||
      [];


    for (
      let b = 0;
      b < 3;
      b++
    ) {

      const start =
        starts[b];


      const name =
        names[b];


      /*
       * EXACT LABEL STRUCTURE:
       *
       * start
       * start + 1
       * start + 2
       * start + 3
       *
       * DATE
       * REMARK
       * IN
       * OUT
       */

      const dateValue =
        row[start];


      const remarksValue =
        row[start + 1];


      const inValue =
        toNumber(
          row[start + 2]
        );


      const outValue =
        toNumber(
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


      const safeIn =
        inValue === null
          ? 0
          : inValue;


      const safeOut =
        outValue === null
          ? 0
          : outValue;


      result[name].in +=
        safeIn;


      result[name].out +=
        safeOut;


      result[name].records.push(
        {

          date,

          remarks:
            String(
              remarksValue || ""
            ),

          in:
            safeIn,

          out:
            safeOut

        }
      );

    }

  }


  return result;

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
    sol(
      totalClaimed
    )
  );


  setText(
    "totalRedeemed",
    sol(
      totalRedeemed
    )
  );


  setText(
    "totalProceeds",
    money(
      totalProceeds
    )
  );


  setText(
    "totalExpenses",
    money(
      totalExpenses
    )
  );


  /* =====================================
     TABLE TOTALS
     ===================================== */

  setText(
    "claimsTotal",
    sol(
      totalClaimed
    )
  );


  setText(
    "redeemedTotal",
    sol(
      totalRedeemed
    )
  );


  setText(
    "proceedsTotal",
    money(
      totalProceeds
    )
  );


  setText(
    "expensesTotal",
    money(
      totalExpenses
    )
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
                  dateText(
                    row[0]
                  )
                )}
              </td>

              <td class="num">
                ${num(
                  row[1]
                )} SOL
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
                  dateText(
                    row[0]
                  )
                )}
              </td>

              <td class="num">
                ${num(
                  row[1]
                )} SOL
              </td>

              <td class="num">

                ${
                  row[2] === null

                    ? "—"

                    : money(
                        row[2]
                      )
                }

              </td>

              <td class="num">

                ${
                  row[3] === null

                    ? "—"

                    : "$" +
                      num(
                        row[3]
                      )
                }

              </td>

              <td class="num">
                ${money(
                  row[4]
                )}
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
                  dateText(
                    row[0]
                  )
                )}
              </td>

              <td>
                ${escapeHtml(
                  row[1]
                )}
              </td>

              <td class="num">
                ${money(
                  row[2]
                )}
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

  }

  else {

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
      cleanDate
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


  if (
    dates.length
  ) {

    setText(
      "latestEntry",
      `Latest recorded activity: ${dateText(
        dates[
          dates.length - 1
        ]
      )}`
    );

  }

  else {

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
    money(
      input
    )
  );


  setText(
    prefix + "Out",
    money(
      output
    )
  );


  setText(
    prefix + "Balance",
    money(
      balance
    )
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


  const element =
    document.querySelector(
      `[data-allocation="${prefix}"]`
    );


  if (element) {

    element.textContent =
      `${safe}%`;

  }


  setText(
    prefix + "Percentage",
    `${safe}%`
  );

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

    console.log(
      "[GWAR] Loading Google Sheets:",
      {
        rewardSheet:
          C.rewardSheet,

        allocationSheet:
          C.allocationSheet
      }
    );


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


  }

  catch (error) {

    console.error(
      "[GWAR] Live Google Sheet error:",
      error
    );


    const fallback =
      C.fallback || {};


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

      records: []

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

      records: []

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

      records: []

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
