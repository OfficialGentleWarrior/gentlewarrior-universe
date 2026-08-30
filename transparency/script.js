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
      .trim();


  if (text.endsWith("%")) {

    text =
      text.slice(0, -1)
        .trim();

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


  if (value instanceof Date) {

    return Number.isNaN(value.getTime())
      ? null
      : value;

  }


  const text =
    String(value)
      .trim();


  if (!text) {
    return null;
  }


  /*
   * Google Visualization format:
   *
   * Date(2026,7,8)
   */

  const gviz =
    text.match(
      /^Date\((\d+),\s*(\d+),\s*(\d+)\)$/
    );


  if (gviz) {

    const date =
      new Date(
        Number(gviz[1]),
        Number(gviz[2]),
        Number(gviz[3])
      );


    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;

  }


  /*
   * Normal date strings.
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
    !text.trim()
  ) {

    throw new Error(
      "Empty Google Sheets response."
    );

  }


  /*
   * Google returns:
   *
   * google.visualization.Query.setResponse({...})
   *
   * Extract the JSON object.
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
      "Google Sheets returned status: " +
      json.status
    );

  }


  const table =
    json.table;


  if (!table) {

    throw new Error(
      "Google Sheets table not found."
    );

  }


  const rows =
    table.rows || [];


  /*
   * IMPORTANT
   *
   * We always create 14 columns.
   *
   * A = 0
   * B = 1
   * C = 2
   * D = 3
   * E = 4
   * F = 5
   * G = 6
   * H = 7
   * I = 8
   * J = 9
   * K = 10
   * L = 11
   * M = 12
   * N = 13
   */

  return rows.map(
    row => {

      const cells =
        row?.c || [];


      const result =
        new Array(14)
          .fill("");


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
          continue;
        }


        /*
         * Use formatted value first.
         * If unavailable use raw value.
         */

        if (
          cell.f !== null &&
          cell.f !== undefined
        ) {

          result[i] =
            cell.f;

        } else if (
          cell.v !== null &&
          cell.v !== undefined
        ) {

          result[i] =
            cell.v;

        }

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

  const url =
    "https://docs.google.com/spreadsheets/d/" +
    C.sheetId +
    "/gviz/tq?" +
    "tqx=out:json" +
    "&sheet=" +
    encodeURIComponent(sheetName);


  console.log(
    "Fetching:",
    sheetName
  );


  const response =
    await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      "Google Sheets request failed: " +
      response.status
    );

  }


  const text =
    await response.text();


  console.log(
    sheetName +
    " raw response:",
    text.substring(0, 300)
  );


  return parseGviz(text);

}


/* =========================================
   REWARD SHEET
   ========================================= */

/*
   EXACT STRUCTURE FROM REWARD SCREENSHOT

   CLAIMED
   A = DATE
   B = SOL CLAIMED

   REDEEMED
   D = DATE
   E = SOLD SOL
   F = RATE
   G = $
   H = IN PESO

   EXPENSES
   J = DATE
   K = DESCRIPTION
   L = AMOUNT
   M = REMARKS

   Row 1 = section totals / labels
   Row 2 = headers
   Row 3 onward = transactions
*/

function parseReward(rows) {

  const claims =
    [];

  const redeemed =
    [];

  const expenses =
    [];


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
      claimDate !== null &&
      claimSOL !== null
    ) {

      const date =
        cleanDate(
          claimDate
        );


      if (date) {

        claims.push({
          date,
          sol:
            claimSOL
        });

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

        redeemed.push({

          date,

          soldSOL:
            soldSOL,

          rate:
            toNumber(row[5]),

          usd:
            toNumber(row[6]),

          php:
            toNumber(row[7])

        });

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

        expenses.push({

          date,

          description:
            String(description),

          amount,

          remarks:
            String(
              remarks || ""
            )

        });

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

/*
   EXACT STRUCTURE FROM ALLOCATION SCREENSHOT

   LEAM
   A5 = 30% LABEL ONLY
   A6 = DATE
   B6 = REMARKS
   C6 = IN
   D6 = OUT

   CP KIDS
   F5 = 30% LABEL ONLY
   F6 = DATE
   G6 = REMARKS
   H6 = IN
   I6 = OUT

   PROJECT
   K5 = 40% LABEL ONLY
   K6 = DATE
   L6 = REMARKS
   M6 = IN
   N6 = OUT

   DATA STARTS ROW 7.

   VERY IMPORTANT:

   Row 5 is NOT a transaction.

   The percentage values are ONLY labels.

   Row 6 is ONLY the header.

   Transactions start at row 7.
*/

function parseAllocation(rows) {

  const result = {

    note:
      "",

    leam: {

      pct:
        30,

      in:
        0,

      out:
        0,

      records:
        []

    },

    cp: {

      pct:
        30,

      in:
        0,

      out:
        0,

      records:
        []

    },

    project: {

      pct:
        40,

      in:
        0,

      out:
        0,

      records:
        []

    }

  };


  /* =====================================
     NOTE
     ===================================== */

  if (
    rows[1] &&
    rows[1][0] !== undefined &&
    rows[1][0] !== ""
  ) {

    result.note =
      String(
        rows[1][0]
      );

  }


  /* =====================================
     PERCENTAGE LABELS ONLY
     ===================================== */

  /*
   * Row 5 = array index 4.
   *
   * These values are ONLY percentages.
   */

  const leamPct =
    toNumber(
      rows[4]?.[0]
    );


  const cpPct =
    toNumber(
      rows[4]?.[5]
    );


  const projectPct =
    toNumber(
      rows[4]?.[10]
    );


  if (
    leamPct !== null
  ) {

    result.leam.pct =
      leamPct;

  }


  if (
    cpPct !== null
  ) {

    result.cp.pct =
      cpPct;

  }


  if (
    projectPct !== null
  ) {

    result.project.pct =
      projectPct;

  }


  /* =====================================
     TRANSACTIONS
     ===================================== */

  /*
   * START ROW 7
   *
   * Array index = 6
   */

  for (
    let i = 6;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];


    /* ===================================
       LEAM
       A B C D
       =================================== */

    const leamDate =
      row[0];


    const leamRemarks =
      row[1];


    const leamIn =
      toNumber(
        row[2]
      );


    const leamOut =
      toNumber(
        row[3]
      );


    const hasLeamData =
      (
        leamDate !== "" &&
        leamDate !== null
      ) ||
      (
        leamRemarks !== "" &&
        leamRemarks !== null
      ) ||
      leamIn !== null ||
      leamOut !== null;


    if (hasLeamData) {

      const date =
        cleanDate(
          leamDate
        );


      const safeIn =
        leamIn === null
          ? 0
          : leamIn;


      const safeOut =
        leamOut === null
          ? 0
          : leamOut;


      result.leam.in +=
        safeIn;


      result.leam.out +=
        safeOut;


      result.leam.records.push({

        date,

        remarks:
          String(
            leamRemarks || ""
          ),

        in:
          safeIn,

        out:
          safeOut

      });

    }


    /* ===================================
       CP KIDS
       F G H I
       =================================== */

    const cpDate =
      row[5];


    const cpRemarks =
      row[6];


    const cpIn =
      toNumber(
        row[7]
      );


    const cpOut =
      toNumber(
        row[8]
      );


    const hasCPData =
      (
        cpDate !== "" &&
        cpDate !== null
      ) ||
      (
        cpRemarks !== "" &&
        cpRemarks !== null
      ) ||
      cpIn !== null ||
      cpOut !== null;


    if (hasCPData) {

      const date =
        cleanDate(
          cpDate
        );


      const safeIn =
        cpIn === null
          ? 0
          : cpIn;


      const safeOut =
        cpOut === null
          ? 0
          : cpOut;


      result.cp.in +=
        safeIn;


      result.cp.out +=
        safeOut;


      result.cp.records.push({

        date,

        remarks:
          String(
            cpRemarks || ""
          ),

        in:
          safeIn,

        out:
          safeOut

      });

    }


    /* ===================================
       PROJECT
       K L M N
       =================================== */

    const projectDate =
      row[10];


    const projectRemarks =
      row[11];


    const projectIn =
      toNumber(
        row[12]
      );


    const projectOut =
      toNumber(
        row[13]
      );


    const hasProjectData =
      (
        projectDate !== "" &&
        projectDate !== null
      ) ||
      (
        projectRemarks !== "" &&
        projectRemarks !== null
      ) ||
      projectIn !== null ||
      projectOut !== null;


    if (hasProjectData) {

      const date =
        cleanDate(
          projectDate
        );


      const safeIn =
        projectIn === null
          ? 0
          : projectIn;


      const safeOut =
        projectOut === null
          ? 0
          : projectOut;


      result.project.in +=
        safeIn;


      result.project.out +=
        safeOut;


      result.project.records.push({

        date,

        remarks:
          String(
            projectRemarks || ""
          ),

        in:
          safeIn,

        out:
          safeOut

      });

    }

  }


  return result;

}


/* =========================================
   RENDER
   ========================================= */

function render(
  reward,
  allocation
) {

  /* =====================================
     SUMMARY TOTALS
     ===================================== */

  const totalClaimed =
    reward.claims.reduce(
      (
        total,
        item
      ) =>
        total +
        item.sol,
      0
    );


  const totalRedeemed =
    reward.redeemed.reduce(
      (
        total,
        item
      ) =>
        total +
        item.soldSOL,
      0
    );


  const totalProceeds =
    reward.redeemed.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          Number(item.php) || 0
        ),
      0
    );


  const totalExpenses =
    reward.expenses.reduce(
      (
        total,
        item
      ) =>
        total +
        item.amount,
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
    `${reward.claims.length} records`
  );


  setText(
    "redeemedCount",
    `${reward.redeemed.length} records`
  );


  setText(
    "expenseCount",
    `${reward.expenses.length} records`
  );


  /* =====================================
     CLAIMED TABLE
     ===================================== */

  const claimsTable =
    $("claimsTable");


  if (claimsTable) {

    if (
      reward.claims.length === 0
    ) {

      claimsTable.innerHTML = `
        <tr>
          <td colspan="2">
            No Creator Reward claims recorded yet.
          </td>
        </tr>
      `;

    } else {

      claimsTable.innerHTML =
        reward.claims
          .map(
            item => `
              <tr>
                <td>
                  ${escapeHtml(
                    dateText(item.date)
                  )}
                </td>

                <td class="num">
                  ${num(item.sol)} SOL
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

    if (
      reward.redeemed.length === 0
    ) {

      redeemedTable.innerHTML = `
        <tr>
          <td colspan="5">
            No Creator Rewards redeemed yet.
          </td>
        </tr>
      `;

    } else {

      redeemedTable.innerHTML =
        reward.redeemed
          .map(
            item => `
              <tr>

                <td>
                  ${escapeHtml(
                    dateText(item.date)
                  )}
                </td>

                <td class="num">
                  ${num(item.soldSOL)} SOL
                </td>

                <td class="num">
                  ${
                    item.rate === null
                      ? "—"
                      : money(item.rate)
                  }
                </td>

                <td class="num">
                  ${
                    item.usd === null
                      ? "—"
                      : "$" + num(item.usd)
                  }
                </td>

                <td class="num">
                  ${
                    item.php === null
                      ? "—"
                      : money(item.php)
                  }
                </td>

              </tr>
            `
          )
          .join("");

    }

  }


  /* =====================================
     EXPENSES TABLE
     ===================================== */

  const expensesTable =
    $("expensesTable");


  if (expensesTable) {

    if (
      reward.expenses.length === 0
    ) {

      expensesTable.innerHTML = `
        <tr>
          <td colspan="4">
            No expenses recorded yet.
          </td>
        </tr>
      `;

    } else {

      expensesTable.innerHTML =
        reward.expenses
          .map(
            item => `
              <tr>

                <td>
                  ${escapeHtml(
                    dateText(item.date)
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    item.description
                  )}
                </td>

                <td class="num">
                  ${money(item.amount)}
                </td>

                <td>
                  ${escapeHtml(
                    item.remarks
                  )}
                </td>

              </tr>
            `
          )
          .join("");

    }

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
     LATEST ACTIVITY
     ===================================== */

  const dates = [

    ...reward.claims.map(
      item => item.date
    ),

    ...reward.redeemed.map(
      item => item.date
    ),

    ...reward.expenses.map(
      item => item.date
    ),

    ...allocation.leam.records.map(
      item => item.date
    ),

    ...allocation.cp.records.map(
      item => item.date
    ),

    ...allocation.project.records.map(
      item => item.date
    )

  ]
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
      "Latest recorded activity: " +
      dateText(
        dates[dates.length - 1]
      )
    );

  } else {

    setText(
      "latestEntry",
      ""
    );

  }


  /* =====================================
     LIVE STATUS
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
   ALLOCATION RENDER
   ========================================= */

function renderAllocation(
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
   * Example:
   *
   * data-allocation="leam"
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
   * Example:
   *
   * id="leamPercentage"
   */

  setText(
    prefix + "Percentage",
    `${safe}%`
  );

}


/* =========================================
   DOM TEXT
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
   LOAD
   ========================================= */

async function load() {

  try {

    setText(
      "dataStatus",
      "Loading Google Sheet data..."
    );


    const [
      rewardRows,
      allocationRows
    ] =
      await Promise.all([

        fetchSheet(
          C.rewardSheet
        ),

        fetchSheet(
          C.allocationSheet
        )

      ]);


    console.log(
      "REWARD rows:",
      rewardRows
    );


    console.log(
      "ALLOCATION rows:",
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
      "Parsed reward:",
      reward
    );


    console.log(
      "Parsed allocation:",
      allocation
    );


    render(
      reward,
      allocation
    );


  } catch (error) {

    console.error(
      "CREATOR REWARD DATA ERROR:",
      error
    );


    const status =
      $("dataStatus");


    if (status) {

      status.className =
        "status error";


      status.textContent =
        "● Unable to load Google Sheet data";

    }

  }

}


/* =========================================
   START
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  load
);
