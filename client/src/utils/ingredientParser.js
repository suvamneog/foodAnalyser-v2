/**
 * Parse a user's recipe / quick-log text into structured ingredient rows and
 * resolve each one to nutrition (via IFCT/INDB search, with a local fallback
 * for common Indian kitchen items).
 *
 * Supports portion orderings people actually type:
 *   "1 katori dal"  ·  "dal 1 katori"  ·  "100g paneer"  ·  "paneer 100g"
 *   "2 roti"        ·  "sabzi" (default portion)
 */

import { fetchFoodData } from "./fetchFoodData";

const UNIT_ALIASES = {
  g: "g",
  gm: "g",
  gms: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  ml: "ml",
  l: "l",
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  cup: "cup",
  cups: "cup",
  bowl: "bowl",
  bowls: "bowl",
  katori: "katori",
  katoris: "katori",
  glass: "glass",
  glasses: "glass",
};

const UNIT_GRAMS = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  tsp: 5,
  tbsp: 15,
  cup: 200,
  bowl: 150,
  katori: 150,
  glass: 240,
};

const UNIT_GROUP =
  "kg|g|gm|gms|gram|grams|ml|l|tsp|teaspoons?|tbsp|tablespoons?|cups?|bowls?|katoris?|glasses?";

const COUNT_MASS = {
  onion: { small: 60, medium: 110, large: 180 },
  tomato: { small: 70, medium: 100, large: 150 },
  potato: { small: 80, medium: 150, large: 220 },
  egg: { small: 45, medium: 50, large: 60 },
  roti: { small: 30, medium: 40, large: 55 },
  chapati: { small: 30, medium: 40, large: 55 },
  phulka: { small: 25, medium: 35, large: 45 },
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
  almond: { small: 1, medium: 1.2, large: 1.5 },
};

/**
 * When someone types a bare Indian dish with no portion, assume a typical
 * home serving so quick-log doesn't land on 0 g / 0 kcal.
 */
const DEFAULT_PORTIONS = {
  dal: { grams: 150, label: "1 katori" },
  daldaal: { grams: 150, label: "1 katori" },
  sambar: { grams: 150, label: "1 bowl" },
  sambhar: { grams: 150, label: "1 bowl" },
  sabzi: { grams: 150, label: "1 katori" },
  sabji: { grams: 150, label: "1 katori" },
  subzi: { grams: 150, label: "1 katori" },
  curry: { grams: 150, label: "1 katori" },
  chutney: { grams: 30, label: "2 tbsp" },
  raita: { grams: 100, label: "½ bowl" },
  curd: { grams: 100, label: "½ bowl" },
  dahi: { grams: 100, label: "½ bowl" },
  rice: { grams: 150, label: "1 bowl" },
  chawal: { grams: 150, label: "1 bowl" },
  roti: { grams: 40, label: "1 piece" },
  chapati: { grams: 40, label: "1 piece" },
  phulka: { grams: 35, label: "1 piece" },
  paratha: { grams: 80, label: "1 piece" },
  dosa: { grams: 100, label: "1 piece" },
  idli: { grams: 35, label: "1 piece" },
  poha: { grams: 150, label: "1 bowl" },
  upma: { grams: 150, label: "1 bowl" },
  chai: { grams: 150, label: "1 cup" },
  tea: { grams: 150, label: "1 cup" },
  milk: { grams: 240, label: "1 glass" },
  egg: { grams: 50, label: "1 piece" },
  eggs: { grams: 50, label: "1 piece" },
  paneer: { grams: 100, label: "100 g" },
};

// Cooked / plated estimates when IFCT lookup fails (per 100 g as eaten).
const FALLBACK_PER_100 = {
  oil: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  ghee: { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  butter: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
  sugar: { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
  jaggery: { calories: 383, protein: 0.4, carbs: 98, fat: 0.1, fiber: 0 },
  salt: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  water: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  milk: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  chai: { calories: 45, protein: 1.5, carbs: 6, fat: 1.5, fiber: 0 },
  tea: { calories: 45, protein: 1.5, carbs: 6, fat: 1.5, fiber: 0 },
  curd: { calories: 60, protein: 3.1, carbs: 4.7, fat: 3.3, fiber: 0 },
  dahi: { calories: 60, protein: 3.1, carbs: 4.7, fat: 3.3, fiber: 0 },
  raita: { calories: 55, protein: 2.5, carbs: 4, fat: 2.5, fiber: 0.4 },
  paneer: { calories: 296, protein: 18, carbs: 4, fat: 22, fiber: 0 },
  onion: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  chawal: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  atta: { calories: 340, protein: 12, carbs: 71, fat: 1.7, fiber: 11 },
  flour: { calories: 340, protein: 12, carbs: 71, fat: 1.7, fiber: 11 },
  // Cooked dal / lentils as served (not dry)
  dal: { calories: 110, protein: 7, carbs: 15, fat: 2.5, fiber: 4 },
  sambar: { calories: 70, protein: 3.5, carbs: 10, fat: 1.5, fiber: 2.5 },
  sambhar: { calories: 70, protein: 3.5, carbs: 10, fat: 1.5, fiber: 2.5 },
  // Mixed vegetable sabzi as served
  sabzi: { calories: 85, protein: 2.5, carbs: 10, fat: 4, fiber: 3 },
  sabji: { calories: 85, protein: 2.5, carbs: 10, fat: 4, fiber: 3 },
  subzi: { calories: 85, protein: 2.5, carbs: 10, fat: 4, fiber: 3 },
  curry: { calories: 120, protein: 6, carbs: 8, fat: 7, fiber: 2 },
  chutney: { calories: 120, protein: 2, carbs: 12, fat: 7, fiber: 2 },
  roti: { calories: 264, protein: 9, carbs: 46, fat: 4.5, fiber: 6 },
  chapati: { calories: 264, protein: 9, carbs: 46, fat: 4.5, fiber: 6 },
  phulka: { calories: 250, protein: 8, carbs: 48, fat: 2.5, fiber: 6 },
  paratha: { calories: 320, protein: 7, carbs: 40, fat: 14, fiber: 4 },
  dosa: { calories: 170, protein: 4, carbs: 28, fat: 4.5, fiber: 1.5 },
  idli: { calories: 140, protein: 4, carbs: 28, fat: 0.5, fiber: 1.5 },
  poha: { calories: 150, protein: 3, carbs: 28, fat: 3.5, fiber: 1.5 },
  upma: { calories: 140, protein: 3.5, carbs: 22, fat: 4, fiber: 2 },
  moong: { calories: 110, protein: 7, carbs: 15, fat: 2, fiber: 4 },
  chana: { calories: 140, protein: 7, carbs: 18, fat: 4, fiber: 5 },
  chickpea: { calories: 140, protein: 7, carbs: 18, fat: 4, fiber: 5 },
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


function normalizeUnit(raw) {
  const key = String(raw || "")
    .toLowerCase()
    .replace(/s$/, "");
  return UNIT_ALIASES[raw] || UNIT_ALIASES[key] || key;
}

function gramsFromUnit(qty, unitRaw) {
  const unit = normalizeUnit(unitRaw);
  return qty * (UNIT_GRAMS[unit] || 1);
}

/**
 * Parse a free-form recipe / quick-log line into { qty, unit, size, name, grams }.
 */
export function parseLine(rawLine) {
  let line = rawLine.trim().toLowerCase();
  if (!line) return null;

  // Drop trailing filler words
  line = line
    .replace(/\s+to\s+taste$/i, "")
    .replace(/\s+as\s+needed$/i, "")
    .trim();
  if (!line) return null;

  // 1. qty + unit + name  →  "1 katori dal", "100g paneer", "2 tbsp oil"
  const unitFirst = line.match(
    new RegExp(
      `^(\\d+(?:\\.\\d+)?)\\s*(${UNIT_GROUP})\\s+(?:of\\s+)?(.+)$`,
      "i"
    )
  );
  if (unitFirst) {
    const qty = parseFloat(unitFirst[1]);
    const unit = normalizeUnit(unitFirst[2]);
    const name = cleanName(unitFirst[3]);
    return {
      raw: rawLine,
      qty,
      unit,
      name,
      grams: gramsFromUnit(qty, unit),
    };
  }

  // 2. name + qty + unit  →  "dal 1 katori", "paneer 100g", "milk 1 glass"
  const nameThenUnit = line.match(
    new RegExp(
      `^([a-z][a-z\\s-]{0,40}?)\\s+(\\d+(?:\\.\\d+)?)\\s*(${UNIT_GROUP})$`,
      "i"
    )
  );
  if (nameThenUnit) {
    const name = cleanName(nameThenUnit[1]);
    const qty = parseFloat(nameThenUnit[2]);
    const unit = normalizeUnit(nameThenUnit[3]);
    return {
      raw: rawLine,
      qty,
      unit,
      name,
      grams: gramsFromUnit(qty, unit),
    };
  }

  // 3. qty + size? + countable  →  "2 roti", "1 medium onion", "2 large eggs"
  const countMatch = line.match(
    /^(\d+(?:\.\d+)?)\s+(small|medium|large|big)?\s*([a-z][a-z\s-]+)$/
  );
  if (countMatch) {
    const qty = parseFloat(countMatch[1]);
    const sizeRaw = countMatch[2] || "medium";
    const size = sizeRaw === "big" ? "large" : sizeRaw;
    const nameRaw = cleanName(countMatch[3]);
    const key = matchCountable(nameRaw);
    if (key) {
      const grams = qty * (COUNT_MASS[key][size] || COUNT_MASS[key].medium);
      return { raw: rawLine, qty, unit: "piece", size, name: nameRaw, grams };
    }
    return {
      raw: rawLine,
      qty,
      unit: "piece",
      size,
      name: nameRaw,
      grams: qty * 60,
    };
  }

  // 4. bare dish name  →  "dal", "sabzi", "sambar" with a default home portion
  const name = cleanName(line);
  const defaultPortion = pickDefaultPortion(name);
  if (defaultPortion) {
    return {
      raw: rawLine,
      qty: 1,
      unit: "serving",
      name,
      grams: defaultPortion.grams,
      assumedPortion: defaultPortion.label,
    };
  }

  // Unknown bare word — leave at 0 g so UI can warn
  return { raw: rawLine, qty: null, unit: null, name, grams: 0 };
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
    .replace(/\b(and|&)\b/g, " ")
    .replace(/[.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchCountable(name) {
  const keys = Object.keys(COUNT_MASS);
  // Prefer longer keys first (chapati before cha…)
  return (
    keys
      .slice()
      .sort((a, b) => b.length - a.length)
      .find((k) => name.includes(k)) || null
  );
}

function pickDefaultPortion(name) {
  const n = name.toLowerCase();
  const keys = Object.keys(DEFAULT_PORTIONS).sort((a, b) => b.length - a.length);
  const hit = keys.find((k) => n === k || n.includes(k));
  return hit ? DEFAULT_PORTIONS[hit] : null;
}

function pickFallback(name) {
  const n = name.toLowerCase();
  const keys = Object.keys(FALLBACK_PER_100).sort((a, b) => b.length - a.length);
  const hit = keys.find((k) => n === k || n.includes(k));
  return hit ? { key: hit, per100: FALLBACK_PER_100[hit] } : null;
}

/**
 * Prefer everyday wheat roti / cooked dal over obscure first-hit DB rows
 * (e.g. "Makki ki roti" for a plain "roti" query).
 */
function pickBestMatch(items, query) {
  if (!Array.isArray(items) || items.length === 0) return null;
  if (items.length === 1) return items[0];

  const q = String(query || "").toLowerCase().trim();
  const scored = items.map((item, index) => {
    const name = String(item.displayName || item.name || "").toLowerCase();
    let score = 100 - index; // keep API order as a weak prior

    if (name === q) score += 80;
    if (name.startsWith(q + " ") || name.startsWith(q + "(")) score += 40;
    if (name.includes(q)) score += 20;

    // Everyday wheat flatbreads beat maize / specialty rotis for "roti"
    if (q === "roti" || q === "chapati" || q === "phulka") {
      if (/\b(makki|maize|corn|bajra|jowar|ragi|missi)\b/.test(name)) score -= 60;
      if (/\b(wheat|atta|phulka|chapati|tandoori)\b/.test(name)) score += 35;
      if (name === "roti" || name.includes("roti (prepared)") || name.includes("chapati"))
        score += 25;
    }

    // Prefer cooked / prepared dal over raw pulse for "dal"
    if (q === "dal" || q.includes("dal")) {
      if (/\b(raw|dried|dry)\b/.test(name)) score -= 40;
      if (/\b(cooked|prepared|curry|fry)\b/.test(name)) score += 30;
    }

    // Prefer mixed veg / sabzi-like cooked dishes
    if (q === "sabzi" || q === "sabji" || q === "subzi") {
      if (/\b(vegetable|sabzi|sabji|mixed)\b/.test(name)) score += 40;
      if (/\b(raw)\b/.test(name)) score -= 30;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].item;
}

function scaleFromPer100(per100, grams, meta) {
  const f = grams / 100;
  return {
    ...meta,
    calories: (per100.calories || 0) * f,
    protein: (per100.protein || 0) * f,
    carbs: (per100.carbs || 0) * f,
    fat: (per100.fat || 0) * f,
    fiber: (per100.fiber || 0) * f,
  };
}

/**
 * Resolve one parsed ingredient row to nutrition (per portion) using
 * IFCT/INDB first, then local fallback.
 */
export async function resolveIngredient(row) {
  if (!row) return null;
  if (!row.grams || row.grams <= 0) {
    return {
      ...row,
      source: "skipped",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };
  }

  // Prefer search terms that match Indian plated foods
  const searchName = rewriteSearchQuery(row.name);

  try {
    const items = await fetchFoodData(searchName);
    const first = pickBestMatch(
      Array.isArray(items) ? items : items ? [items] : [],
      row.name
    );
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
    return scaleFromPer100(fallback.per100, row.grams, {
      ...row,
      source: "Local estimate",
      matchedName: fallback.key,
    });
  }

  return {
    ...row,
    source: "unresolved",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };
}

/** Map casual names to search queries that rank better in IFCT/INDB. */
function rewriteSearchQuery(name) {
  const n = String(name || "").toLowerCase().trim();
  if (n === "roti" || n === "chapati" || n === "phulka") return "chapati";
  if (n === "sabzi" || n === "sabji" || n === "subzi") return "mixed vegetable";
  if (n === "dal" || n === "daal") return "dal cooked";
  if (n === "chawal") return "rice cooked";
  return name;
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
