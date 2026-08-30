/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   CONFIG.JS
   ========================================= */

"use strict";


/* =========================================
   GOOGLE SHEET CONFIG
   ========================================= */

const GWAR_CONFIG = {

  /* =======================================
     GOOGLE SHEET ID
     ======================================= */

  sheetId:
    "1pXMbQ3QScwSNvreeMO-1xEjr7yRhKw9T",


  /* =======================================
     SHEET NAMES
     ======================================= */

  rewardSheet:
    "reward",

  allocationSheet:
    "allocation",


  /* =======================================
     LOCKED ALLOCATION LABELS
     
     IMPORTANT:
     These are LABELS only.
     They are NOT taken from
     transaction rows.
     ======================================= */

  allocationLabels: {

    leam: 30,

    cp: 30,

    project: 40

  },


  /* =======================================
     FALLBACK
     
     Used only if Google Sheets
     temporarily fails to load.
     
     Live Google Sheet remains
     the primary source.
     ======================================= */

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

};
