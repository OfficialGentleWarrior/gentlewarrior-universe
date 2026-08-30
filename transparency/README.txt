GENTLE WARRIOR
CREATOR REWARD TRANSPARENCY
SETUP & MAINTENANCE GUIDE

========================================
1. FOLDER STRUCTURE
========================================

Upload the following files together:

transparency/
│
├── index.html
├── style.css
├── config.js
├── script.js
│
└── assets/
    └── gentle-warrior-logo.png


========================================
2. WEBSITE LOCATION
========================================

This is a standalone page.

Recommended URL:

https://gentlewarrior.world/transparency/

The transparency page does not need to be placed
inside the main website page structure.

It can be accessed directly through its URL.


========================================
3. GOOGLE SHEET
========================================

The page reads data from the configured Google Sheet.

Spreadsheet ID:

1pXMbQ3QScwSNvreeMO-1xEjr7yRhKw9T


Required sheet tabs:

REWARD

ALLOCATION


========================================
4. GOOGLE SHEET PERMISSION
========================================

The Google Sheet must allow public viewing.

Recommended setting:

Anyone with the link
→ Viewer

Do NOT give the website public editing access.

Only the owner/editor should modify the Sheet.


========================================
5. HOW TO UPDATE THE TRANSPARENCY PAGE
========================================

You do NOT need to edit:

index.html
style.css
script.js

for normal data updates.

Instead:

1. Open the Google Sheet.
2. Add or update the appropriate record.
3. Save the Sheet.
4. Open /transparency/.
5. Refresh the page.

The page will retrieve the latest available
Google Sheet data.


========================================
6. REWARD TAB
========================================

The REWARD tab contains three types of information:

A. CLAIMED

Records of Creator Rewards claimed.

Example:

Date       | SOL Claimed
-----------|------------
Aug 8      | 1.75
Aug 14     | 3
Aug 15     | 1.60


B. REDEEMED / SOLD

Records of rewards that have been sold/redeemed.

Information can include:

Date Sold
SOL Sold
SOL Rate
USD
PHP


C. EXPENSES

Records of expenses.

Information can include:

Date
Description
Amount
Remarks


========================================
7. ALLOCATION TAB
========================================

Current allocation structure:

LEAM      30%

CP KIDS   30%

PROJECT   40%


The page displays:

IN
OUT
BALANCE


BALANCE is calculated as:

IN - OUT


========================================
8. IMPORTANT
========================================

The allocation percentages are part of the
current transparency structure.

Do not change the percentages in config.js
unless the official allocation structure
has been changed.

Current structure:

30% LEAM
30% CP KIDS
40% PROJECT


========================================
9. ADDING NEW REWARD CLAIMS
========================================

To add a new Creator Reward:

Open:

REWARD

Add the date and SOL amount in the
appropriate CLAIMED columns.

Example:

Aug 30    | 2.00


After saving the Sheet, the transparency
page will include the new record.


========================================
10. ADDING A SALE / REDEMPTION
========================================

When a Creator Reward is sold:

Record:

Date Sold
SOL Sold
Rate
USD
PHP


Example:

Aug 30, 2026
2.00 SOL
₱60.00
$120
₱7,200


The transparency page will calculate and
display the recorded totals.


========================================
11. ADDING EXPENSES
========================================

When a legitimate expense is recorded,
add it to the EXPENSES section.

Example:

Date:
Aug 30, 2026

Description:
Event Materials

Amount:
1500

Remarks:
Refund to event fund


The expense total will update automatically.


========================================
12. ALLOCATION RECORDS
========================================

When funds are allocated:

Record the appropriate IN amount
under the corresponding allocation.

When funds are used:

Record the appropriate OUT amount.

The page calculates:

BALANCE = IN - OUT


========================================
13. NO CODE EDITING FOR NORMAL UPDATES
========================================

The goal of this setup is:

GOOGLE SHEET
      ↓
TRANSPARENCY PAGE
      ↓
PUBLIC VIEW


This means the Google Sheet becomes the
main data source.

The website is only the public presentation
layer.


========================================
14. DESIGN
========================================

The page follows the Gentle Warrior visual
direction:

- Soft green background
- Dark green branding
- Lime green accents
- Rounded cards
- Rounded pills
- Clean typography
- Mobile-first layout
- Light overall interface
- Gentle Warrior branding

It is intentionally NOT a dark-only dashboard.


========================================
15. FUTURE MAINTENANCE
========================================

If the Google Sheet structure changes
(column names or tab names), update:

config.js
and/or
script.js

Normal additions of new rows should not
require code changes.


========================================
16. TRANSPARENCY PRINCIPLE
========================================

The purpose of this page is to make Creator
Reward activity easier for the community to
understand.

It records:

What was claimed
What was redeemed/sold
What was received
What was spent
Where funds are allocated


========================================
END
========================================
