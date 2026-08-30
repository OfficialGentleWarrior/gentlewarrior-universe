/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   SCRIPT
   ========================================= */

(() => {

  "use strict";


  /* =========================================
     STATE
     ========================================= */

  const state = {
    reward: {
      claimed: [],
      redeemed: [],
      expenses: []
    },

    allocation: {
      leam: {
        in: 0,
        out: 0
      },

      cpKids: {
        in: 0,
        out: 0
      },

      project: {
        in: 0,
        out: 0
      },

      note: ""
    },

    updatedAt: null
  };


  /* =========================================
     DOM HELPERS
     ========================================= */

  const $ = (id) =>
    document.getElementById(id);


  function setText(id, value) {

    const element = $(id);

    if (!element) return;

    element.textContent = value;

  }


  /* =========================================
     NUMBER HELPERS
     ========================================= */

  function number(value) {

    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    const cleaned = String(value)
      .replace(/₱/g, "")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/\s/g, "")
      .trim();

    if (!cleaned) return 0;

    const parsed = Number(cleaned);

    return Number.isFinite(parsed) ? parsed : 0;

  }


  function formatNumber(value, decimals = 2) {

    const n = number(value);

    return n.toLocaleString("en-PH", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

  }


  function formatSOL(value) {

    return `${formatNumber(value, 2)} SOL`;

  }


  function formatPHP(value) {

    return `₱${formatNumber(value, 2)}`;

  }


  /* =========================================
     DATE HELPERS
     ========================================= */

  function formatDate(value) {

    if (!value) return "—";

    if (value instanceof Date) {
      return value.toLocaleDateString(
        "en-PH",
        {
          year: "numeric",
          month: "short",
          day: "numeric"
        }
      );
    }

    const text = String(value).trim();

    /*
      Google Sheets can return dates such as:

      Aug 8
      Aug 13, 2026
      2026-08-13
      Date(2026,7,13)
    */

    const googleDate =
      text.match(
        /^Date(\d+),(\d+),(\d+)$/
      );

    if (googleDate) {

      const year =
        Number(googleDate[1]);

      const month =
        Number(googleDate[2]);

      const day =
        Number(googleDate[3]);

      return new Date(
        year,
        month,
        day
      ).toLocaleDateString(
        "en-PH",
        {
          year: "numeric",
          month: "short",
          day: "numeric"
        }
      );

    }


    /*
      If the sheet only has "Aug 8",
      preserve the original display.
    */

    return text;

  }


  /* =========================================
     GOOGLE SHEETS FETCH
     ========================================= */

  async function fetchSheet(sheetName) {

    const url =
      getGoogleSheetUrl(sheetName);

    const response =
      await fetch(url, {
        method: "GET",
        cache: "no-store"
      });

    if (!response.ok) {
      throw new Error(
        `Google Sheet request failed: ${response.status}`
      );
    }

    const text =
      await response.text();

    /*
      Google Visualization API returns:

      google.visualization.Query.setResponse({...});
    */

    const match =
      text.match(
        /google\.visualization\.Query\.setResponse([\s\S]+);?\s*$/
      );

    if (!match) {

      throw new Error(
        "Invalid Google Sheets response."
      );

    }

    const data =
      JSON.parse(match[1]);

    if (
      data.status &&
      data.status !== "ok"
    ) {

      throw new Error(
        data.errors?.[0]?.detailed_message ||
        data.errors?.[0]?.message ||
        "Google Sheets returned an error."
      );

    }

    return parseGoogleTable(data);

  }


  /* =========================================
     PARSE GOOGLE VISUALIZATION TABLE
     ========================================= */

  function parseGoogleTable(data) {

    const table =
      data?.table;

    if (!table) {
      return [];
    }

    const columns =
      table.cols || [];

    const rows =
      table.rows || [];


    /*
      Convert column labels into
      simple usable headers.
    */

    const headers =
      columns.map(
        (column, index) => {

          const label =
            column.label ||
            column.id ||
            `column_${index}`;

          return normalizeKey(label);

        }
      );


    return rows.map(row => {

      const object = {};

      headers.forEach(
        (header, index) => {

          const cell =
            row.c?.[index];

          object[header] =
            cell?.v ??
            cell?.f ??
            "";

        }
      );

      return object;

    });

  }


  /* =========================================
     NORMALIZE COLUMN NAMES
     ========================================= */

  function normalizeKey(value) {

    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[%₱$]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  }


  function findValue(row, possibleNames) {

    for (
      const name of possibleNames
    ) {

      const key =
        normalizeKey(name);

      if (
        Object.prototype.hasOwnProperty.call(
          row,
          key
        )
      ) {

        return row[key];

      }

    }

    return "";

  }


  /* =========================================
     REWARD TAB PARSER
     ========================================= */

  function parseRewardSheet(rows) {

    const claimed = [];
    const redeemed = [];
    const expenses = [];


    rows.forEach(row => {

      /*
       =====================================
       CLAIMED
       =====================================
      */

      const claimedDate =
        findValue(row, [
          "date",
          "date claimed",
          "claimed date"
        ]);

      const solClaimed =
        findValue(row, [
          "sol claimed",
          "claimed",
          "sol"
        ]);


      if (
        claimedDate &&
        number(solClaimed) > 0
      ) {

        claimed.push({
          date: claimedDate,
          sol: number(solClaimed)
        });

      }


      /*
       =====================================
       REDEEMED / SOLD
       =====================================
      */

      const soldDate =
        findValue(row, [
          "date sold",
          "sold date"
        ]);

      const solSold =
        findValue(row, [
          "sol sold",
          "sold"
        ]);

      const rate =
        findValue(row, [
          "rate",
          "sol rate"
        ]);

      const usd =
        findValue(row, [
          "$",
          "usd",
          "dollar",
          "dollars"
        ]);

      const peso =
        findValue(row, [
          "peso",
          "php",
          "amount php",
          "proceeds"
        ]);


      if (
        soldDate &&
        (
          number(solSold) > 0 ||
          number(peso) > 0 ||
          number(usd) > 0
        )
      ) {

        redeemed.push({

          date: soldDate,

          sol:
            number(solSold),

          rate:
            number(rate),

          usd:
            number(usd),

          php:
            number(peso)

        });

      }


      /*
       =====================================
       EXPENSES
       =====================================
      */

      const expenseDate =
        findValue(row, [
          "date expense",
          "expense date",
          "date"
        ]);

      const description =
        findValue(row, [
          "description",
          "expense",
          "item"
        ]);

      const amount =
        findValue(row, [
          "amount",
          "expense amount"
        ]);

      const remarks =
        findValue(row, [
          "remarks",
          "remark",
          "notes",
          "note"
        ]);


      /*
       Avoid treating a reward-only row
       as an expense.
      */

      if (
        description &&
        number(amount) > 0
      ) {

        expenses.push({

          date:
            expenseDate,

          description:
            String(description),

          amount:
            number(amount),

          remarks:
            String(remarks || "")

        });

      }

    });


    return {
      claimed,
      redeemed,
      expenses
    };

  }


  /* =========================================
     ALLOCATION TAB PARSER
     ========================================= */

  function parseAllocationSheet(rows) {

    const result = {

      leam: {
        in: 0,
        out: 0
      },

      cpKids: {
        in: 0,
        out: 0
      },

      project: {
        in: 0,
        out: 0
      },

      note: ""

    };


    /*
      The allocation sheet can contain
      columns such as:

      LEAM IN
      LEAM OUT

      CP KIDS IN
      CP KIDS OUT

      PROJECT IN
      PROJECT OUT
    */


    rows.forEach(row => {

      const leamIn =
        findValue(row, [
          "leam in"
        ]);

      const leamOut =
        findValue(row, [
          "leam out"
        ]);

      const cpIn =
        findValue(row, [
          "cp kids in",
          "cp_kids_in"
        ]);

      const cpOut =
        findValue(row, [
          "cp kids out",
          "cp_kids_out"
        ]);

      const projectIn =
        findValue(row, [
          "project in"
        ]);

      const projectOut =
        findValue(row, [
          "project out"
        ]);


      if (
        leamIn !== "" ||
        leamOut !== "" ||
        cpIn !== "" ||
        cpOut !== "" ||
        projectIn !== "" ||
        projectOut !== ""
      ) {

        result.leam.in =
          number(leamIn);

        result.leam.out =
          number(leamOut);

        result.cpKids.in =
          number(cpIn);

        result.cpKids.out =
          number(cpOut);

        result.project.in =
          number(projectIn);

        result.project.out =
          number(projectOut);

      }


      const note =
        findValue(row, [
          "note",
          "notes",
          "remark",
          "remarks"
        ]);

      if (note) {

        result.note =
          String(note);

      }

    });


    return result;

  }


  /* =========================================
     RENDER CLAIMS
     ========================================= */

  function renderClaims() {

    const tbody =
      $("claimsTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    let total = 0;


    state.reward.claimed
      .forEach(item => {

        total += item.sol;


        const tr =
          document.createElement("tr");


        tr.innerHTML = `
          <td>
            ${escapeHTML(
              formatDate(item.date)
            )}
          </td>

          <td class="number">
            ${formatSOL(item.sol)}
          </td>
        `;


        tbody.appendChild(tr);

      });


    setText(
      "claimsTotal",
      formatSOL(total)
    );

    setText(
      "totalClaimed",
      formatSOL(total)
    );

    setText(
      "claimedCount",
      `${state.reward.claimed.length} ${
        state.reward.claimed.length === 1
          ? "entry"
          : "entries"
      }`
    );

  }


  /* =========================================
     RENDER REDEEMED
     ========================================= */

  function renderRedeemed() {

    const tbody =
      $("redeemedTable");

    const empty =
      $("redeemedEmpty");

    const card =
      $("redeemedTableCard");

    if (!tbody) return;

    tbody.innerHTML = "";

    let totalSOL = 0;
    let totalPHP = 0;


    state.reward.redeemed
      .forEach(item => {

        totalSOL += item.sol;
        totalPHP += item.php;


        const tr =
          document.createElement("tr");


        tr.innerHTML = `

          <td>
            ${escapeHTML(
              formatDate(item.date)
            )}
          </td>

          <td class="number">
            ${formatSOL(item.sol)}
          </td>

          <td class="number">
            ${
              item.rate
                ? formatPHP(item.rate)
                : "—"
            }
          </td>

          <td class="number">
            ${
              item.usd
                ? `$${formatNumber(item.usd, 2)}`
                : "—"
            }
          </td>

          <td class="number">
            ${
              item.php
                ? formatPHP(item.php)
                : "—"
            }
          </td>

        `;


        tbody.appendChild(tr);

      });


    setText(
      "redeemedTotal",
      formatSOL(totalSOL)
    );

    setText(
      "proceedsTotal",
      formatPHP(totalPHP)
    );

    setText(
      "totalRedeemed",
      formatSOL(totalSOL)
    );

    setText(
      "totalProceeds",
      formatPHP(totalPHP)
    );


    setText(
      "redeemedCount",
      `${state.reward.redeemed.length} ${
        state.reward.redeemed.length === 1
          ? "entry"
          : "entries"
      }`
    );


    /*
      Show empty state when there
      are currently no redeemed records.
