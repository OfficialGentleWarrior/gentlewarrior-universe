/*
========================================
Pillar Match - Competition Configuration
========================================

Update ONLY this file for every new competition.

Fields you will usually update:
- eventName
- eventStart
- eventEnd
- facebookPost
- mechanics (optional)

No game logic should be added here.
*/

window.COMPETITION_CONFIG = {

    // Enable or disable the competition
    enabled: true,

    // Configuration version
    configVersion: "1.0.1",

    // Competition name
    eventName: "Weekly Competition",

    // Competition schedule (Philippine Time)
    eventStart: "2026-07-10T08:00:00+08:00",
    eventEnd: "2026-07-20T08:00:00+08:00",

    // Facebook competition post
    // Leave blank until the official competition post is published.
    postUrl: "https://www.facebook.com/share/r/18khZBQtUG/",

    /instructions:
    "📸 Screenshot your result before joining the competition.",

    // Competition mechanics
    mechanics: [
        "Comment your saved result.",
        "Tag 1 friend.",
        "Follow the Baby Leam page."
    ],

    // Competition settings
    topWinners: 3,
    bonusRewards: true,

    // Button labels
    saveButtonText: "💾 Save Result",
    joinButtonText: "🏆 Join Competition",
    retryButtonText: "🔄 Try Again",

    // Status messages
    notStartedMessage:
        "⏳ Competition has not started yet.",

    endedMessage:
        "🏁 This competition has ended. See you in the next event!"

};
