/* =========================================
   GENTLE WARRIOR
   CREATOR REWARD TRANSPARENCY
   CONFIGURATION
   ========================================= */

const GW_CONFIG = {

  /*
   =========================================
   GOOGLE SHEETS
   =========================================
  */

  spreadsheetId:
    "1pXMbQ3QScwSNvreeMO-1xEjr7yRhKw9T",

  sheets: {

    /*
     Creator Reward claims and
     redeemed / sold records
    */
    reward: "REWARD",

    /*
     Fund allocation records
    */
    allocation: "ALLOCATION"

  },


  /*
   =========================================
   ALLOCATION
   =========================================

   Locked allocation structure:
   LEAM     = 30%
   CP KIDS  = 30%
   PROJECT  = 40%
  */

  allocation: {

    leam: 0.30,

    cpKids: 0.30,

    project: 0.40

  },


  /*
   =========================================
   GOOGLE SHEETS API
   =========================================

   Uses Google's public Visualization API.

   Your Sheet must remain:
   "Anyone with the link → Viewer"
  */

  googleSheetsBase:
    "https://docs.google.com/spreadsheets/d/",


  /*
   =========================================
   DATA FORMAT
   =========================================
  */

  currency: "PHP",

  rewardCurrency: "SOL",


  /*
   =========================================
   DISPLAY
   =========================================
  */

  siteName:
    "Gentle Warrior",

  pageTitle:
    "Creator Reward Transparency",

  tagline:
    "Soft Heart. Strong Spirit.",


  /*
   =========================================
   FALLBACK
   =========================================

   If Google Sheets temporarily fails,
   script.js can use the last known
   local snapshot instead of showing
   a completely broken page.
  */

  enableFallback:
    true

};


/*
 =========================================
 HELPER
 =========================================

 Creates a Google Visualization API URL
 for a specific sheet/tab.
*/

function getGoogleSheetUrl(sheetName) {

  return (
    GW_CONFIG.googleSheetsBase +
    GW_CONFIG.spreadsheetId +
    "/gviz/tq?tqx=out:json&sheet=" +
    encodeURIComponent(sheetName)
  );

}
