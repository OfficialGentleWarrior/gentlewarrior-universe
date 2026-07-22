// ==========================================
// Little Wins - Journey Service
// ==========================================

import { db, auth } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

/**
 * Check if the current user already has a journey.
 * @returns {Promise<boolean>}
 */
export async function hasJourney() {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  try {
    const journeyRef = doc(db, "lw_journeys", user.uid);
    const journeySnap = await getDoc(journeyRef);

    return journeySnap.exists();
  } catch (error) {
    console.error("Error checking journey:", error);
    return false;
  }
}

/**
 * Get the current user's journey.
 */
export async function getJourney() {
  // TODO: Implement next
}

/**
 * Create a new journey.
 * @param {Object} data
 */
export async function createJourney(data) {
  // TODO: Implement next
}

/**
 * Update an existing journey.
 * @param {Object} data
 */
export async function updateJourney(data) {
  // TODO: Implement next
}
