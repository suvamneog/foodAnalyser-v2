/**
 * Parse a user's recipe text into structured ingredient rows and resolve each
 * one to nutrition (via IFCT/INDB search, with a small local fallback for
 * common Indian kitchen items).
 */

import { fetchFoodData } from "./fetchFoodData";

// Grams for common Indian units / countable ingredients
const UNIT_GRAMS = {
  g: 1,
  gm: 1,
  gms: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  ml: 1, // approx for water-like liquids
  l: 1000,
  tsp: 5,
  teaspoon: 5,
  tbsp: 15,
  tablespoon: 15,
  cup: 200,
  bowl: 150,
  katori: 150,
  glass: 240,
};

const COUNT_MASS = {
  onion: { small: 60, medium: 110, large: 180 },
  tomato: { small: 70, medium: 100, large: 150 },
  potato: { small: 80, medium: 150, large: 220 },
  egg: { small: 45, medium: 50, large: 60 },
  roti: { small: 30, medium: 40, large: 55 },
  chapati: { small: 30, medium: 40, large: 55 },
  paratha: { small: 60, medium: 80, large: 110 },
  idli: { small: 25, medium: 35, large: 45 },
  dosa: { small: 60, medium: 100, large: 140 },
  banana: { small: 90, medium: 120, large: 150 },
  apple: { small: 130, medium: 180, large: 220 },
  lemon: { small: 40, medium: 60, large: 80 },
  chili: { small: 3, medium: 5, large: 8 },
  chilli: { small: 3, medium: 5, large: 8 },
  garlic: { small: 3, medium: 5, large: 8 },
  clove: { small: 2, medium: 3, large: 4 },
};

// Approx per-100 g for common raw ingredients when IFCT lookup fails
// (values aligned with IFCT / USDA raw entries).
const FALLBACK_PER_100 = {
  oil: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  ghee: { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  butter: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
  sugar: { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
  jaggery: { calories: 383, protein: 0.4, carbs: 98, fat: 0.1, fiber: 0 },
  salt: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  water: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  milk: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  curd: { calories: 60, protein: 3.1, carbs: 4.7, fat: 3.3, fiber: 0 },
  paneer: { calories: 296, protein: 18, carbs: 4, fat: 22, fiber: 0 },
  onion: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  atta: { calories: 340, protein: 12, carbs: 71, fat: 1.7, fiber: 11 },
  flour: { calories: 340, protein: 12, carbs: 71, fat: 1.7, fiber: 11 },
  dal: { calories: 343, protein: 24, carbs: 60, fat: 1.1, fiber: 11 },
  moong: { calories: 347, protein: 23, carbs: 63, fat: 1.2, fiber: 16 },
  chana: { calories: 364, protein: 19, carbs: 61, fat: 6, fiber: 17 },
  chickpea: { calories: 364, protein: 19, carbs: 61, fat: 6, fiber: 17 },
  egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  fish: { calories: 130, protein: 22, carbs: 0, fat: 4, fiber: 0 },
  mutton: { calories: 258, protein: 25, carbs: 0, fat: 17, fiber: 0 },
  cheese: { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
  peanut: { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5 },
  almond: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 },
  banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
};

const SIZE_WORDS = ["small", "medium", "large", "big"];

/**
 * Parse a free-form recipe line into { qty, unit, size, name, grams? }.
 * Handles:
 *   "250g paneer", "2 tbsp oil", "1 medium onion", "1 katori dal", "2 eggs"
 */
export function parseLine(rawLine) {
  const line = rawLine.trim().toLowerCase();
  if (!line) return null;

  // 1. number + unit (g/kg/ml/tsp/…)
  const unitMatch = line.match(
    /^(\d+(?:\.\d+)?)\s*(kg|g|gm|gms|gram|grams|ml|l|tsp|teaspoons?|tbsp|tablespoons?|cup|bowl|katori|glass)s?\s+(?:of\s+)?(.+)$/
  );
  if (unitMatch) {
    const qty = parseFloat(unitMatch[1]);
    const unit = unitMatch[2].replace(/s$/, "");
    const key = unit === "teaspoon" ? "tsp" : unit === "tablespoon" ? "tbsp" : unit;
    const grams = qty * (UNIT_GRAMS[key] || 1);
    const name = cleanName(unitMatch[3]);
    return { raw: rawLine, qty, unit: key, name, grams };
  }

  // 2. number + size + item (e.g. "1 medium onion", "2 large eggs")
  const countMatch = line.match(
    /^(\d+(?:\.\d+)?)\s+(small|medium|large|big)?\s*([a-z][a-z\s-]+)$/
  );
  if (countMatch) {
    const qty = parseFloat(countMatch[1]);
    const size = countMatch[2] || "medium";
    const nameRaw = cleanName(countMatch[3]);
    const key = matchCountable(nameRaw);
    if (key) {
      const grams = qty * (COUNT_MASS[key][size] || COUNT_MASS[key].medium);
      return { raw: rawLine, qty, unit: "piece", size, name: nameRaw, grams };
    }
    // fallback: unknown countable -> assume 60 g per piece
    return { raw: rawLine, qty, unit: "piece", size, name: nameRaw, grams: qty * 60 };
  }

  // 3. plain "onion", "salt to taste" — skip zero-mass items
  return { raw: rawLine, qty: null, unit: null, name: cleanName(line), grams: 0 };
}

export function parseRecipe(text) {
  return text
    .split(/[\n,]+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map(parseLine)
    .filter(Boolean);
}

function cleanName(s) {
  return s
    .replace(/^of\s+/, "")
    .replace(/[.]+$/g, "")
    .trim();
}

function matchCountable(name) {
  const keys = Object.keys(COUNT_MASS);
  return keys.find((k) => name.includes(k)) || null;
}

function pickFallback(name) {
  const keys = Object.keys(FALLBACK_PER_100);
  const hit = keys.find((k) => name.includes(k));
  return hit ? { key: hit, per100: FALLBACK_PER_100[hit] } : null;
}

/**
 * Resolve one parsed ingredient row to nutrition (per portion) using
 * IFCT/INDB first, then local fallback.
 */
export async function resolveIngredient(row) {
  if (!row) return null;
  if (!row.grams || row.grams <= 0) {
    return { ...row, source: "skipped", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  }

  // Try live IFCT/INDB
  try {
    const items = await fetchFoodData(row.name);
    const first = Array.isArray(items) ? items[0] : items;
    if (first) {
      const factor = row.grams / (first.serving_size_g || 100);
      return {
        ...row,
        source: first.source || "IFCT/INDB",
        matchedName: first.displayName || first.name,
        calories: (first.calories || 0) * factor,
        protein: (first.protein_g || 0) * factor,
        carbs: (first.carbohydrates_total_g || 0) * factor,
        fat: (first.fat_total_g || 0) * factor,
        fiber: (first.fiber_g || 0) * factor,
      };
    }
  } catch {
    // fall through to local
  }

  const fallback = pickFallback(row.name);
  if (fallback) {
    const f = row.grams / 100;
    return {
      ...row,
      source: "Local estimate",
      matchedName: fallback.key,
      calories: fallback.per100.calories * f,
      protein: fallback.per100.protein * f,
      carbs: fallback.per100.carbs * f,
      fat: fallback.per100.fat * f,
      fiber: (fallback.per100.fiber || 0) * f,
    };
  }

  return { ...row, source: "unresolved", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
}

export async function resolveRecipe(rows) {
  const resolved = await Promise.all(rows.map(resolveIngredient));
  const totals = resolved.reduce(
    (acc, r) => {
      if (!r) return acc;
      acc.calories += r.calories || 0;
      acc.protein += r.protein || 0;
      acc.carbs += r.carbs || 0;
      acc.fat += r.fat || 0;
      acc.fiber += r.fiber || 0;
      acc.grams += r.grams || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, grams: 0 }
  );
  return { rows: resolved, totals };
}
