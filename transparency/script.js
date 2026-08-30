/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   ========================================= */

"use strict";


/* =========================================
   CONFIG
   ========================================= */

const CONFIG = window.GW_CONFIG || window.CONFIG || {};

const SPREADSHEET_ID =
  CONFIG.spreadsheetId ||
  CONFIG.SPREADSHEET_ID ||
  "1pXMbQ3QScwSNvreeMO-1xEjr7yRhKw9T";


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
    .replace(/,/g, "")
    .replace(/SOL/gi, "")
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


function normalizeKey(value) {

  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[_-]/g, " ");
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
   GOOGLE GVIZ FETCH
   ========================================= */

async function fetchGoogleSheet(sheetName) {

  if (!SPREADSHEET_ID) {
    throw new Error(
      "Google Spreadsheet ID is not configured."
    );
  }

  const url =
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq` +
    `?sheet=${encodeURIComponent(sheetName)}` +
    `&tqx=out:json`;

  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load ${sheetName}.`
    );
  }

  const text = await response.text();

  /*
    GViz returns something like:

    /*O_o*/
    google.visualization.Query.setResponse({...})

    Extract the JSON object from that response.
  */

  const start =
    text.indexOf("{");

  const end =
    text.lastIndexOf("}");

  if (
    start === -1 ||
    end === -1
  ) {
    throw new Error(
      `Invalid Google Sheet response for ${sheetName}.`
    );
  }

  const jsonText =
    text.substring(start, end + 1);

  const data =
    JSON.parse(jsonText);

  if (
    data.status !== "ok" ||
    !data.table
  ) {
    throw new Error(
      `Google Sheet returned no usable data for ${sheetName}.`
    );
  }

  return data.table;
}


/* =========================================
   GVIZ TABLE → ARRAY
   ========================================= */

function tableToRows(table) {

  if (
    !table ||
    !Array.isArray(table.cols) ||
    !Array.isArray(table.rows)
  ) {
    return [];
  }

  const headers =
    table.cols.map((column, index) => {

      return (
        column.label ||
        column.id ||
        `Column ${index + 1}`
      ).trim();

    });


  return table.rows.map(row => {

    const object = {};

    headers.forEach((header, index) => {

      const cell =
        row.c?.[index];

      if (!cell) {
        object[header] = "";
        return;
      }

      /*
        Prefer formatted value when available.
        Fall back to raw value.
      */

      object[header] =
        cell.f ??
        cell.v ??
        "";

    });

    return object;

  });
}


/* =========================================
   GVIZ CELL VALUE
   ========================================= */

function cellValue(table, rowIndex, columnIndex) {

  const row =
    table?.rows?.[rowIndex];

  if (!row) {
    return "";
  }

  const cell =
    row.c?.[columnIndex];

  if (!cell) {
    return "";
  }

  return (
    cell.f ??
    cell.v ??
    ""
  );
}


/* =========================================
   REWARD — CLAIMED
   ========================================= */

function loadClaimedFromReward(table) {

  const rows = [];

  if (!table?.rows) {
    return rows;
  }

  /*
    REWARD:
    A = Date
    B = SOL Claimed

    Data begins below the header.
  */

  table.rows.forEach((row, index) => {

    const date =
      cellValue(table, index, 0);

    const sol =
      cellValue(table, index, 1);

    const amount =
      toNumber(sol);

    if (
      String(date).trim() !== "" &&
      amount !== 0
    ) {

      rows.push({
        date: date,
        sol: amount
      });

    }

  });

  return rows;
}


/* =========================================
   REWARD — REDEEMED / SOLD
   ========================================= */

function loadRedeemedFromReward(table) {

  const rows = [];

  if (!table?.rows) {
    return rows;
  }

  /*
    REWARD:
    D = Date
    E = Sold SOL
    F = Rate
    G = $
    H = In Peso
  */

  table.rows.forEach((row, index) => {

    const date =
      cellValue(table, index, 3);

    const soldSOL =
      cellValue(table, index, 4);

    const rate =
      cellValue(table, index, 5);

    const usd =
      cellValue(table, index, 6);

    const peso =
      cellValue(table, index, 7);

    const solValue =
      toNumber(soldSOL);

    if (
      String(date).trim() !== "" &&
      (
        solValue !== 0 ||
        toNumber(peso) !== 0
      )
    ) {

      rows.push({

        date: date,

        sol: solValue,

        rate: toNumber(rate),

        usd: toNumber(usd),

        peso: toNumber(peso)

      });

    }

  });

  return rows;
}


/* =========================================
   REWARD — EXPENSES
   ========================================= */

function loadExpensesFromReward(table) {

  const rows = [];

  if (!table?.rows) {
    return rows;
  }

  /*
    REWARD:
    J = Date
    K = Description
    L = Amount
    M = Remarks
  */

  table.rows.forEach((row, index) => {

    const date =
      cellValue(table, index, 9);

    const description =
      cellValue(table, index, 10);

    const amount =
      cellValue(table, index, 11);

    const remarks =
      cellValue(table, index, 12);

    const numericAmount =
      toNumber(amount);

    if (
      String(date).trim() !== "" &&
      (
        String(description).trim() !== "" ||
        numericAmount !== 0 ||
        String(remarks).trim() !== ""
      )
    ) {

      rows.push({

        date: date,

        description: description,

        amount: numericAmount,

        remarks: remarks

      });

    }

  });

  return rows;
}


/* =========================================
   ALLOCATION
   ========================================= */

function loadAllocation(table) {

  const allocation = {

    leam: [],

    cp: [],

    project: []

  };


  if (!table?.rows) {
    return allocation;
  }


  /*
    ALLOCATION structure:

    Row 5:
      allocation labels / percentages

    Row 7+:
      transactions

    We detect the transaction columns
    instead of assuming row 5 is data.
  */

  const rows =
    table.rows;


  rows.forEach((row, index) => {

    /*
      Skip the first 6 spreadsheet rows.

      Actual allocation transactions
      start at row 7.
    */

    if (index < 6) {
      return;
    }


    /*
      Expected transaction layout:

      A = Date
      B = Fund
      C = Remarks
      D = IN
      E = OUT

      The parser also checks alternate
      positions below.
    */

    let date =
      cellValue(table, index, 0);

    let fund =
      cellValue(table, index, 1);

    let remarks =
      cellValue(table, index, 2);

    let incoming =
      cellValue(table, index, 3);

    let outgoing =
      cellValue(table, index, 4);


    /*
      Ignore completely empty rows.
    */

    if (
      String(date).trim() === "" &&
      String(fund).trim() === "" &&
      String(remarks).trim() === "" &&
      String(incoming).trim() === "" &&
      String(outgoing).trim() === ""
    ) {
      return;
    }


    const normalizedFund =
      normalizeKey(fund);


    let key = null;


    if (
      normalizedFund.includes("leam")
    ) {

      key = "leam";

    } else if (
      normalizedFund.includes("cp") ||
      normalizedFund.includes("cerebral")
    ) {

      key = "cp";

    } else if (
      normalizedFund.includes("project") ||
      normalizedFund.includes("gentle warrior")
    ) {

      key = "project";

    }


    if (!key) {
      return;
    }


    allocation[key].push({

      date: date,

      fund: fund,

      remarks: remarks,

      in: toNumber(incoming),

      out: toNumber(outgoing)

    });

  });


  return allocation;
}


/* =========================================
   CLAIMED RENDER
   ========================================= */

function renderClaimed() {

  const table =
    $("claimsTable");

  if (!table) {
    return;
  }


  const rows =
    state.claimed;


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

    $("claimedCount").textContent =
      "0 records";

    $("totalClaimed").textContent =
      formatSOL(0);

    return;
  }


  table.innerHTML =
    rows.map(row => `

      <tr>

        <td>
          ${escapeHTML(row.date)}
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

  $("claimedCount").textContent =
    `${rows.length} ${
      rows.length === 1
        ? "record"
        : "records"
    }`;
}


/* =========================================
   REDEEMED RENDER
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

    empty.classList.remove("hidden");

    wrap.classList.add("hidden");

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


  empty.classList.add("hidden");

  wrap.classList.remove("hidden");


  table.innerHTML =
    rows.map(row => `

      <tr>

        <td>
          ${escapeHTML(row.date)}
        </td>

        <td class="num">
          ${row.sol.toFixed(2)} SOL
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
   EXPENSES RENDER
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
          ${escapeHTML(row.date)}
        </td>

        <td>
          ${escapeHTML(row.description)}
        </td>

        <td class="num">
          ${formatPeso(row.amount)}
        </td>

        <td>
          ${escapeHTML(row.remarks)}
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
   ALLOCATION RENDER
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
          ${escapeHTML(row.date)}
        </span>

        <span>
          ${escapeHTML(row.remarks)}
        </span>

        <strong>
          ${row.in
            ? formatPeso(row.in)
            : "—"}
        </strong>

        <strong>
          ${row.out
            ? formatPeso(row.out)
            : "—"}
        </strong>

      </div>

    `).join("");
}


/* =========================================
   ALLOCATION TOTAL
   ========================================= */

function renderAllocation() {

  renderAllocationCard("leam");

  renderAllocationCard("cp");

  renderAllocationCard("project");


  const percentages = {

    leam: 30,

    cp: 30,

    project: 40

  };


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


  if ($("allocationTotalPercentage")) {

    $("allocationTotalPercentage").textContent =
      `${
        percentages.leam +
        percentages.cp +
        percentages.project
      }%`;

  }


  if ($("allocationNote")) {

    $("allocationNote").textContent =
      state.note ||
      "Creator Reward funds are allocated across direct support, cerebral palsy support, and Gentle Warrior projects.";

  }
}


/* =========================================
   LOAD DATA
   ========================================= */

async function loadData() {

  setStatus("Loading...");


  try {

    /*
      ACTUAL GOOGLE SHEET STRUCTURE:

      REWARD
      ALLOCATION
    */

    const [
      rewardTable,
      allocationTable
    ] = await Promise.all([

      fetchGoogleSheet("REWARD"),

      fetchGoogleSheet("ALLOCATION")

    ]);


    /*
      REWARD
    */

    state.claimed =
      loadClaimedFromReward(
        rewardTable
      );


    state.redeemed =
      loadRedeemedFromReward(
        rewardTable
      );


    state.expenses =
      loadExpensesFromReward(
        rewardTable
      );


    /*
      ALLOCATION
    */

    state.allocation =
      loadAllocation(
        allocationTable
      );


    /*
      Render everything.
    */

    renderAll();


    state.loaded =
      true;


    setStatus(
      "Live Google Sheet data"
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

    console.error(
      "Creator Reward Transparency:",
      error
    );


    setStatus(
      "Data unavailable"
    );


    showDataError();

  }
}


/* =========================================
   RENDER ALL
   ========================================= */

function renderAll() {

  renderClaimed();

  renderRedeemed();

  renderExpenses();

  renderAllocation();

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
   ERROR DISPLAY
   ========================================= */

function showDataError() {

  if ($("claimsTable")) {

    $("claimsTable").innerHTML = `

      <tr>

        <td
          colspan="2"
          class="data-error"
        >
          Unable to load transparency data.
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
          Unable to load transparency data.
        </td>

      </tr>

    `;

  }


  if ($("redeemedEmpty")) {

    $("redeemedEmpty")
      .classList.remove("hidden");


    $("redeemedEmpty").innerHTML = `

      <div class="empty-icon">
        !
      </div>

      <strong>
        Unable to load reward sales.
      </strong>

      <p>
        Please check the live data source.
      </p>

    `;

  }

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


  const parsedDates =
    dates
      .map(date => new Date(date))
      .filter(date =>
        !Number.isNaN(
          date.getTime()
        )
      );


  if (!parsedDates.length) {

    element.textContent =
      "Latest transparency records available.";

    return;
  }


  const latest =
    new Date(
      Math.max(
        ...parsedDates.map(
          date =>
            date.getTime()
        )
      )
    );


  element.textContent =
    `Latest recorded activity: ${
      latest.toLocaleDateString(
        "en-PH",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      )
    }`;
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

        pills.forEach(item =>
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

  });

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
