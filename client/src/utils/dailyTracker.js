/**
 * Daily nutrition tracker persisted to localStorage.
 * When the user is logged in, cloudSync pushes/pulls a durable Mongo snapshot.
 */

const LOG_KEY = (dateISO) => `fa-tracker-log-${dateISO}`;
const TARGET_KEY = "fa-tracker-target";
const WATER_KEY = (dateISO) => `fa-tracker-water-${dateISO}`;
const ACTIVITY_KEY = (dateISO) => `fa-tracker-activity-${dateISO}`;

export const WATER_TARGET_ML_DEFAULT = 2500;

function notifySync() {
  // Lazy import avoids circular dependency with cloudSync.js
  import("./cloudSync")
    .then((m) => m.scheduleSyncPush())
    .catch(() => {});
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadTarget() {
  try {
    const raw = localStorage.getItem(TARGET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTarget(target) {
  try {
    localStorage.setItem(TARGET_KEY, JSON.stringify(target));
    notifySync();
  } catch {
    // ignore quota issues
  }
}

export function loadLog(dateISO = todayISO()) {
  try {
    const raw = localStorage.getItem(LOG_KEY(dateISO));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLog(entries, dateISO = todayISO()) {
  try {
    localStorage.setItem(LOG_KEY(dateISO), JSON.stringify(entries));
    notifySync();
  } catch {
    // ignore
  }
}

export function addEntry(entry, dateISO = todayISO()) {
  const list = loadLog(dateISO);
  const withId = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ts: Date.now(), ...entry };
  const next = [withId, ...list];
  saveLog(next, dateISO);
  return next;
}

export function removeEntry(id, dateISO = todayISO()) {
  const next = loadLog(dateISO).filter((e) => e.id !== id);
  saveLog(next, dateISO);
  return next;
}

export function totals(entries) {
  return entries.reduce(
    (acc, e) => {
      acc.calories += Number(e.calories) || 0;
      acc.protein += Number(e.protein) || 0;
      acc.carbs += Number(e.carbs) || 0;
      acc.fat += Number(e.fat) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function loadWater(dateISO = todayISO()) {
  try {
    const raw = localStorage.getItem(WATER_KEY(dateISO));
    const n = raw == null ? 0 : Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveWater(ml, dateISO = todayISO()) {
  try {
    localStorage.setItem(WATER_KEY(dateISO), String(Math.max(0, Math.round(ml))));
    notifySync();
  } catch {
    // ignore
  }
}

export function addWater(deltaMl, dateISO = todayISO()) {
  const next = Math.max(0, loadWater(dateISO) + (Number(deltaMl) || 0));
  saveWater(next, dateISO);
  return next;
}

const DEFAULT_ACTIVITY = { steps: 0, workoutMinutes: 0, workoutKcal: 0, note: "" };

export function loadActivity(dateISO = todayISO()) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY(dateISO));
    if (!raw) return { ...DEFAULT_ACTIVITY };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ACTIVITY, ...parsed };
  } catch {
    return { ...DEFAULT_ACTIVITY };
  }
}

export function saveActivity(activity, dateISO = todayISO()) {
  try {
    const clean = {
      steps: Math.max(0, Math.round(Number(activity.steps) || 0)),
      workoutMinutes: Math.max(0, Math.round(Number(activity.workoutMinutes) || 0)),
      workoutKcal: Math.max(0, Math.round(Number(activity.workoutKcal) || 0)),
      note: String(activity.note || "").slice(0, 120),
    };
    localStorage.setItem(ACTIVITY_KEY(dateISO), JSON.stringify(clean));
    notifySync();
    return clean;
  } catch {
    return activity;
  }
}

export function insights({ target, actual }) {
  if (!target) return [];
  const tips = [];
  const kcalGap = target.calories - actual.calories;
  const proteinGap = target.proteinG - actual.protein;

  if (kcalGap > 300) {
    tips.push(`You're ${Math.round(kcalGap)} kcal short — a katori dal + roti fits well.`);
  } else if (kcalGap < -200) {
    tips.push(`You're ${Math.abs(Math.round(kcalGap))} kcal over — dial back oil/ghee tomorrow.`);
  }
  if (proteinGap > 20) {
    tips.push(`Protein short by ${Math.round(proteinGap)} g — 2 eggs, 100 g paneer or 1 katori dal each add ~13–20 g.`);
  } else if (proteinGap < -20) {
    tips.push(`Great — protein target met with room to spare (+${Math.abs(Math.round(proteinGap))} g).`);
  }
  const fatPct = actual.calories > 0 ? (actual.fat * 9) / actual.calories : 0;
  if (fatPct > 0.4) {
    tips.push(`Fat is ${(fatPct * 100).toFixed(0)}% of today's calories — most Indian recipes stay healthier at 25–30%.`);
  }
  return tips;
}
