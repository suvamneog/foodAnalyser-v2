/**
 * Plain-text meal quick-log.
 *
 * Turns "2 rotis, dal 1 katori, 100g paneer, 1 glass milk" into 4 tracker
 * entries in one tap. Uses the same parser as the recipe analyser, then
 * resolves each line via IFCT/INDB (or the local fallback), and batches
 * `addEntry` calls.
 */

import { addEntry } from "./dailyTracker";
import { parseRecipe, resolveIngredient } from "./ingredientParser";

/** Guess a meal slot from the local time of day. */
export function slotByTime(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 19) return "snack";
  return "dinner";
}

/**
 * Parse + resolve without logging (dry run — for a preview list).
 */
export async function previewQuickLog(text) {
  const rows = parseRecipe(text);
  if (rows.length === 0) return { rows: [], totals: emptyTotals() };
  const resolved = await Promise.all(rows.map(resolveIngredient));
  return {
    rows: resolved.filter(Boolean),
    totals: sumTotals(resolved),
  };
}

/**
 * Log every resolved row that has a mass and non-zero kcal. Returns:
 *   { logged, skipped, totals }
 */
export async function logQuickText(text, { slot } = {}) {
  const resolved = await previewQuickLog(text);
  const chosenSlot = slot || slotByTime();
  const logged = [];
  const skipped = [];

  for (const row of resolved.rows) {
    if (!row.grams || row.grams <= 0 || (row.calories || 0) < 1) {
      skipped.push(row);
      continue;
    }
    addEntry({
      name: prettyName(row),
      slot: chosenSlot,
      grams: Math.round(row.grams),
      calories: Math.round(row.calories),
      protein: Math.round(row.protein || 0),
      carbs: Math.round(row.carbs || 0),
      fat: Math.round(row.fat || 0),
      source: row.source || "quick-log",
    });
    logged.push(row);
  }

  return {
    logged,
    skipped,
    totals: sumTotals(logged),
    slot: chosenSlot,
  };
}

function prettyName(row) {
  const base = row.matchedName || row.name || row.raw;
  const grams = Math.round(row.grams || 0);
  return `${base} · ${grams} g`;
}

function sumTotals(rows) {
  return rows.reduce(
    (acc, r) => {
      acc.calories += r?.calories || 0;
      acc.protein += r?.protein || 0;
      acc.carbs += r?.carbs || 0;
      acc.fat += r?.fat || 0;
      return acc;
    },
    emptyTotals()
  );
}

function emptyTotals() {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}
