/**
 * Recent searches store. Client-only (localStorage).
 * Latest first, unique (case-insensitive), capped at MAX.
 */

const KEY = "fa-recent-searches";
const MAX = 8;

function safeParse() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function loadRecentSearches() {
  return safeParse();
}

export function pushRecentSearch(q) {
  const term = String(q || "").trim();
  if (!term || term.length < 2) return safeParse();
  const lower = term.toLowerCase();
  const cur = safeParse().filter((t) => t.toLowerCase() !== lower);
  cur.unshift(term);
  const next = cur.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
