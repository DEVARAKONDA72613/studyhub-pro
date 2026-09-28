import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
}

export function subscribeToUserStats(userId, callback) {
  return onSnapshot(doc(db, "userStats", userId), (snapshot) => {
    callback(
      snapshot.exists()
        ? snapshot.data()
        : { totalFocusMinutes: 0, currentStreak: 0, lastStudyDate: null }
    );
  });
}

export async function recordFocusSession(user, minutes) {
  const ref = doc(db, "userStats", user.uid);
  const snapshot = await getDoc(ref);
  const today = todayKey();
  const existing = snapshot.exists()
    ? snapshot.data()
    : { totalFocusMinutes: 0, currentStreak: 0, lastStudyDate: null };

  let newStreak = existing.currentStreak || 0;

  if (existing.lastStudyDate === today) {
    // Already studied today, so the streak stays unchanged.
  } else if (existing.lastStudyDate && daysBetween(existing.lastStudyDate, today) === 1) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  await setDoc(ref, {
    totalFocusMinutes: (existing.totalFocusMinutes || 0) + minutes,
    currentStreak: newStreak,
    lastStudyDate: today,
    updatedAt: serverTimestamp(),
  });
}