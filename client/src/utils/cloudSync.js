/**
 * Cloud sync for tracker + progression.
 * LocalStorage remains source of truth for offline use; when authToken exists
 * we pull-on-login and push after mutations (debounced).
 */

import { API_ENDPOINTS } from "./apiConfig";
import {
  loadActivity,
  loadLog,
  loadTarget,
  loadWater,
  saveActivity,
  saveLog,
  saveTarget,
  saveWater,
  todayISO,
} from "./dailyTracker";
import { loadProgress } from "./progression";

const PROGRESS_KEY = "fa-progress";
const LAST_SYNC_KEY = "fa-last-sync-at";
let pushTimer = null;

function authHeaders() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Collect last N days of local logs/water/activity for upload. */
function collectLocalSnapshot(days = 30) {
  const logsByDate = {};
  const waterByDate = {};
  const activityByDate = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const log = loadLog(iso);
    if (log.length) logsByDate[iso] = log;
    const water = loadWater(iso);
    if (water > 0) waterByDate[iso] = water;
    const activity = loadActivity(iso);
    if (activity.steps || activity.workoutKcal || activity.workoutMinutes) {
      activityByDate[iso] = activity;
    }
  }

  let progress = null;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    progress = raw ? JSON.parse(raw) : loadProgress();
  } catch {
    progress = loadProgress();
  }

  return {
    logsByDate,
    target: loadTarget(),
    waterByDate,
    activityByDate,
    progress,
    clientUpdatedAt: Date.now(),
  };
}

function applyRemote(remote) {
  if (!remote) return;

  if (remote.logsByDate && typeof remote.logsByDate === "object") {
    for (const [iso, entries] of Object.entries(remote.logsByDate)) {
      if (!Array.isArray(entries)) continue;
      const local = loadLog(iso);
      // Prefer the longer / more recent set for that day
      if (entries.length >= local.length) saveLog(entries, iso);
    }
  }

  if (remote.target) saveTarget(remote.target);

  if (remote.waterByDate && typeof remote.waterByDate === "object") {
    for (const [iso, ml] of Object.entries(remote.waterByDate)) {
      if (Number(ml) > loadWater(iso)) saveWater(Number(ml), iso);
    }
  }

  if (remote.activityByDate && typeof remote.activityByDate === "object") {
    for (const [iso, act] of Object.entries(remote.activityByDate)) {
      const local = loadActivity(iso);
      const remoteSteps = Number(act?.steps) || 0;
      if (remoteSteps >= (local.steps || 0)) saveActivity(act, iso);
    }
  }

  if (remote.progress && typeof remote.progress === "object") {
    try {
      const local = loadProgress();
      const remoteXp = Number(remote.progress.totalXp) || 0;
      const localXp = Number(local.totalXp) || 0;
      if (remoteXp >= localXp) {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(remote.progress));
      }
    } catch {
      // ignore
    }
  }
}

export async function pullFromCloud() {
  const headers = authHeaders();
  if (!headers || !API_ENDPOINTS.SYNC) return { ok: false, reason: "no-auth" };

  try {
    const res = await fetch(API_ENDPOINTS.SYNC, { headers });
    if (!res.ok) throw new Error(`pull ${res.status}`);
    const data = await res.json();
    if (data.exists) applyRemote(data);
    // After pull, push local merge so neither side loses data
    await pushToCloud();
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    return { ok: true, exists: !!data.exists };
  } catch (err) {
    console.warn("Cloud pull failed:", err.message);
    return { ok: false, error: err.message };
  }
}

export async function pushToCloud() {
  const headers = authHeaders();
  if (!headers || !API_ENDPOINTS.SYNC) return { ok: false, reason: "no-auth" };

  try {
    const body = collectLocalSnapshot(30);
    const res = await fetch(API_ENDPOINTS.SYNC, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`push ${res.status}`);
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    return { ok: true };
  } catch (err) {
    console.warn("Cloud push failed:", err.message);
    return { ok: false, error: err.message };
  }
}

/** Debounced push after local mutations. */
export function scheduleSyncPush(delayMs = 1200) {
  if (!authHeaders()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushToCloud();
  }, delayMs);
}

export function lastSyncAt() {
  try {
    const n = Number(localStorage.getItem(LAST_SYNC_KEY));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function isLoggedInForSync() {
  return !!localStorage.getItem("authToken");
}

/** Ensure today's date helper is unused-import free for tree-shakers that care. */
export { todayISO };
