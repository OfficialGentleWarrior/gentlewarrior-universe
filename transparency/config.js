/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   CONFIG.JS
   ========================================= */

const TRANSPARENCY_CONFIG = {

  /* =======================================
     GOOGLE SHEETS
     ======================================= */

  spreadsheetId:
    "1pXMbQ3QScwSNvreeMO-1xEjr7yRhKw9T",

  /*
   * Public Google Sheet
   *
   * Current tabs:
   * 1. REWARD
   * 2. ALLOCATION
   */

  sheets: {

    reward: {
      name: "REWARD"
    },

    allocation: {
      name: "ALLOCATION"
    }

  },


  /* =======================================
     GOOGLE SHEETS DATA ACCESS
     ======================================= */

  /*
   * We use the published/exportable Sheet
   * endpoint so the transparency page can
   * read the spreadsheet without exposing
   * any editing credentials.
   */

  endpoint:
    "https://docs.google.com/spreadsheets/d/",


  /* =======================================
     CREATOR REWARD ALLOCATION
     ======================================= */

  allocationPercent: {

    leam: 30,

    cpKids: 30,

    project: 40

  },


  /* =======================================
     CURRENCY
     ======================================= */

  currency: {

    php: "₱",

    sol: "SOL",

    usd: "$"

  },


  /* =======================================
     PAGE SETTINGS
     ======================================= */

  page: {

    title:
      "Creator Reward Transparency | Gentle Warrior",

    brand:
      "Gentle Warrior",

    tagline:
      "Soft Heart. Strong Spirit.",

    updateLabel:
      "Last updated"

  },


  /* =======================================
     DATA SETTINGS
     ======================================= */

  data: {

    /*
     * Keep values coming from the spreadsheet.
     * Do not hard-code reward transactions here.
     */

    useLiveSheet: true,

    showEmptyRedeemedMessage: true,

    showAllocation: true,

    showExpenses: true

  }

};


/* =========================================
   HELPER
   ========================================= */

function getTransparencySheetUrl(sheetName) {

  const sheet =
    TRANSPARENCY_CONFIG.sheets[sheetName];

  if (!sheet) {
    throw new Error(
      `Unknown transparency sheet: ${sheetName}`
    );
  }

  return (
    TRANSPARENCY_CONFIG.endpoint +
    TRANSPARENCY_CONFIG.spreadsheetId +
    "/gviz/tq?tqx=out:json&sheet=" +
    encodeURIComponent(sheet.name)
  );
}
