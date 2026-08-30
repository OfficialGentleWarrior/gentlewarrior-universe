/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT.JS
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

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const cleaned = String(value)
    .replace(/₱/g, "")
    .replace(/\$/g, "")
    .replace(/SOL/gi, "")
    .replace(/,/g, "")
    .replace(/%/g, "")
    .trim();

  const number = parseFloat(cleaned);

  return Number.isFinite(number)
    ? number
    : 0;
}


function formatSOL(value) {
  return `${toNumber(value).toFixed(2)} SOL`;
}


function formatPeso(value) {
  return `₱${toNumber(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}


function formatUSD(value) {
  return `$${toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}


function formatRate(value) {

  const number = toNumber(value);

  if (!number) {
    return "—";
  }

  return `$${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
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
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  /*
    Google Sheets / gviz may return:

    8/8/2026
    08/08/2026
    2026-08-08
    Aug 8, 2026
  */

  let date = new Date(text);

  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  const match = text.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
  );

  if (match) {

    const month = Number(match[1]) - 1;
    const day = Number(match[2]);
    const year = Number(match[3]);

    date = new Date(
      year,
      month,
      day
    );

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}


function formatDate(value) {

  const date = parseDate(value);

  if (!date) {
    return escapeHTML(value || "");
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
  let insideQuotes = false;

  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const char = text[i];
    const next = text[i + 1];

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
      insideQuotes = !insideQuotes;
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
      (char === "\n" || char === "\r") &&
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

async function fetchGoogleSheet(sheetName) {

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

    /*
      If Google returns an HTML page
      instead of CSV, the sheet is
      probably not publicly accessible.
    */

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

   Actual REWARD structure:

   A:B  = CLAIMED
   D:H  = REDEEMED
   J:M  = EXPENSES

   Row 1 = totals
   Row 2 = headers
   Row 3+ = records
*/


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


  /*
    Start at row 3
    because:

    row 1 = summary
    row 2 = headers
  */

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
       G = $
       H = IN PESO
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

    if (
      soldDate ||
      soldSOL ||
      soldRate ||
      soldUSD ||
      soldPeso
    ) {

      if (
        soldDate ||
        soldSOL ||
        soldPeso
      ) {

        redeemed.push({
          date: soldDate,
          sol: soldSOL,
          rate: soldRate,
          usd: soldUSD,
          peso: soldPeso
        });

      }

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
      expenseAmount ||
      expenseRemarks
    ) {

      expenses.push({
        date: expenseDate,
        description: expenseDescription,
        amount: expenseAmount,
        remarks: expenseRemarks
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

   Actual ALLOCATION structure:

   A:D  = LEAM
   F:I  = CP KIDS
   K:N  = PROJECT

   Row 2 = transparency note

   Row 4 = allocation headers
   Row 5 = percentage / balance data

   Row 6 = transaction headers
   Row 7+ = transactions
*/


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
    rows[1][0]
  ) {
    result.note =
      String(rows[1][0]).trim();
  }


  /*
    Data starts at row 7
    => array index 6
  */

  for (
    let i = 6;
    i < rows.length;
    i++
  ) {

    const row =
      rows[i] || [];


    /* -------------------------------------
       LEAM
       A = DATE
       B = REMARKS
       C = IN
       D = OUT
    ------------------------------------- */

    const leamDate =
      row[0];

    const leamRemarks =
      row[1];

    const leamIn =
      toNumber(row[2]);

    const leamOut =
      toNumber(row[3]);

    if (
      leamDate ||
      leamRemarks ||
      leamIn ||
      leamOut
    ) {

      result.leam.push({
        date: leamDate,
        remarks: leamRemarks,
        in: leamIn,
        out: leamOut
      });

    }


    /* -------------------------------------
       CP KIDS
       F = DATE
       G = REMARKS
       H = IN
       I = OUT
    ------------------------------------- */

    const cpDate =
      row[5];

    const cpRemarks =
      row[6];

    const cpIn =
      toNumber(row[7]);

    const cpOut =
      toNumber(row[8]);

    if (
      cpDate ||
      cpRemarks ||
      cpIn ||
      cpOut
    ) {

      result.cp.push({
        date: cpDate,
        remarks: cpRemarks,
        in: cpIn,
        out: cpOut
      });

    }


    /* -------------------------------------
       PROJECT
       K = DATE
       L = REMARKS
       M = IN
       N = OUT
    ------------------------------------- */

    const projectDate =
      row[10];

    const projectRemarks =
      row[11];

    const projectIn =
      toNumber(row[12]);

    const projectOut =
      toNumber(row[13]);

    if (
      projectDate ||
      projectRemarks ||
      projectIn ||
      projectOut
    ) {

      result.project.push({
        date: projectDate,
        remarks: projectRemarks,
        in: projectIn,
        out: projectOut
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


  $("claimedCount").textContent =
    `${rows.length} ${
      rows.length === 1
        ? "record"
        : "records"
    }`;


  if (!rows.length) {

    table.innerHTML = `
      <tr>
        <td colspan="2">
          No Creator Reward claims recorded yet.
        </td>
      </tr>
    `;

    $("claimsTotal").textContent =
      formatSOL(0);

    $("totalClaimed").textContent =
      formatSOL(0);

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
        sum + row.sol,
      0
    );


  $("claimsTotal").textContent =
    formatSOL(total);

  $("totalClaimed").textContent =
    formatSOL(total);

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


  $("redeemedCount").textContent =
    `${rows.length} ${
      rows.length === 1
        ? "record"
        : "records"
    }`;


  if (!rows.length) {

    empty.classList.remove(
      "hidden"
    );

    wrap.classList.add(
      "hidden"
    );

    $("redeemedTotal").textContent =
      formatSOL(0);

    $("proceedsTotal").textContent =
      formatPeso(0);

    $("totalRedeemed").textContent =
      formatSOL(0);

    $("totalProceeds").textContent =
      formatPeso(0);

    return;
  }


  empty.classList.add(
    "hidden"
  );

  wrap.classList.remove(
    "hidden"
  );


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


  const totalSOL =
    rows.reduce(
      (sum, row) =>
        sum + row.sol,
      0
    );


  const totalPeso =
    rows.reduce(
      (sum, row) =>
        sum + row.peso,
      0
    );


  $("redeemedTotal").textContent =
    formatSOL(totalSOL);

  $("proceedsTotal").textContent =
    formatPeso(totalPeso);

  $("totalRedeemed").textContent =
    formatSOL(totalSOL);

  $("totalProceeds").textContent =
    formatPeso(totalPeso);

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


  $("expenseCount").textContent =
    `${rows.length} ${
      rows.length === 1
        ? "record"
        : "records"
    }`;


  if (!rows.length) {

    table.innerHTML = `
      <tr>
        <td colspan="4">
          No expenses recorded yet.
        </td>
      </tr>
    `;

    $("expensesTotal").textContent =
      formatPeso(0);

    $("totalExpenses").textContent =
      formatPeso(0);

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
        sum + row.amount,
      0
    );


  $("expensesTotal").textContent =
    formatPeso(total);

  $("totalExpenses").textContent =
    formatPeso(total);

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
        sum + row.in,
      0
    );


  const outTotal =
    rows.reduce(
      (sum, row) =>
        sum + row.out,
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


  $(`${prefix}In`).textContent =
    formatPeso(inTotal);

  $(`${prefix}Out`).textContent =
    formatPeso(outTotal);

  $(`${prefix}Balance`).textContent =
    formatPeso(balance);


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
            row.in
              ? formatPeso(row.in)
              : "—"
          }
        </strong>

        <strong>
          ${
            row.out
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


  /*
    Row 5 in Google Sheet:

    A = LEAM %
    F = CP %
    K = PROJECT %
  */

  const leam =
    toNumber(rows[4][0]);

  const cp =
    toNumber(rows[4][5]);

  const project =
    toNumber(rows[4][10]);


  return {

    leam:
      leam > 0
        ? leam <= 1
          ? leam * 100
          : leam
        : defaults.leam,

    cp:
      cp > 0
        ? cp <= 1
          ? cp * 100
          : cp
        : defaults.cp,

    project:
      project > 0
        ? project <= 1
          ? project * 100
          : project
        : defaults.project

  };
}


/* =========================================
   RENDER ALLOCATION
   ========================================= */

function renderAllocation(
  allocationRows
) {

  renderAllocationCard("leam");
  renderAllocationCard("cp");
  renderAllocationCard("project");


  const percentages =
    getAllocationPercentages(
      allocationRows
    );


  $("leamPercentage").textContent =
    `${percentages.leam}%`;

  $("cpPercentage").textContent =
    `${percentages.cp}%`;

  $("projectPercentage").textContent =
    `${percentages.project}%`;


  const totalPercentage =
    percentages.leam +
    percentages.cp +
    percentages.project;


  $("allocationTotalPercentage").textContent =
    `${totalPercentage}%`;


  if ($("allocationNote")) {

    $("allocationNote").textContent =
      state.note ||
      "Creator Reward funds are allocated across direct support, cerebral palsy support, and Gentle Warrior projects.";

  }

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
      Only TWO Google Sheet tabs:

      REWARD
      ALLOCATION
    */

    const [
      rewardRows,
      allocationRows
    ] = await Promise.all([

      fetchGoogleSheet(
        REWARD_SHEET
      ),

      fetchGoogleSheet(
        ALLOCATION_SHEET
      )

    ]);


    /*
      Process REWARD

      A:B = Claimed
      D:H = Redeemed
      J:M = Expenses
    */

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


    /*
      Process ALLOCATION

      A:D = Leam
      F:I = CP
      K:N = Project
    */

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
          state.allocation.project.length
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
