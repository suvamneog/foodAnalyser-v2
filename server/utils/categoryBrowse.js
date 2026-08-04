/**
 * Browse-by-category: verified IFCT/INDB filters + curated code lists.
 * Rules are explicit and shown to users — no diet prescriptions or inflated counts.
 */

const EXCLUDE_IFCT_GROUPS = new Set([
  "Condiments and Spices",
  "Edible Oils and Fats",
  "Sugars",
  "Miscellaneous Foods",
]);

const ANIMAL_IFCT_GROUPS = new Set([
  "Animal Meat",
  "Poultry",
  "Egg and Egg Products",
  "Fresh Water Fish and Shellfish",
  "Marine Fish",
  "Marine Mollusks",
  "Marine Shellfish",
]);

/** Curated INDB/IFCT codes only — each must exist in datasets when resolved. */
const CURATED = {
  vegetarian: [
    { source: "INDB", code: "ASC215" }, // Palak paneer
    { source: "INDB", code: "ASC191" }, // Matar paneer
    { source: "INDB", code: "ASC195" }, // Paneer curry
    { source: "INDB", code: "ASC165" }, // Rajmah curry
    { source: "INDB", code: "ASC162" }, // Chickpeas curry
    { source: "INDB", code: "ASC161" }, // Black channa curry
    { source: "INDB", code: "ASC151" }, // Dhuli moong dal
    { source: "INDB", code: "ASC167" }, // Sambar
    { source: "INDB", code: "ASC171" }, // Aloo gobhi
    { source: "INDB", code: "ASC177" }, // Baingan bhartha
    { source: "INDB", code: "BFP269" }, // Bhindi sabzi
    { source: "INDB", code: "ASC096" }, // Chapati/Roti
    { source: "INDB", code: "ASC126" }, // Curd rice
    { source: "INDB", code: "BFP144" }, // Plain khichdi
    { source: "IFCT", code: "L003" }, // Paneer
  ],
  vegan: [
    { source: "INDB", code: "ASC162" }, // Chickpeas curry
    { source: "INDB", code: "ASC165" }, // Rajmah curry
    { source: "INDB", code: "ASC161" }, // Black channa curry
    { source: "INDB", code: "ASC151" }, // Moong dal
    { source: "INDB", code: "ASC167" }, // Sambar
    { source: "INDB", code: "BFP176" }, // Rasam
    { source: "INDB", code: "ASC171" }, // Aloo gobhi
    { source: "INDB", code: "ASC177" }, // Baingan bhartha
    { source: "INDB", code: "BFP269" }, // Bhindi
    { source: "INDB", code: "ASC164" }, // Soyabean curry
    { source: "INDB", code: "BFP144" }, // Khichdi
    { source: "INDB", code: "ASC096" }, // Chapati
    { source: "INDB", code: "ASC259" }, // Sprouted moong salad
    { source: "INDB", code: "ASC170" }, // Sprouted moong chat
    { source: "INDB", code: "ASC265" }, // Fruit salad
    { source: "IFCT", code: "C033" }, // Spinach
  ],
  breakfast: [
    { source: "INDB", code: "ASC144" }, // Idli
    { source: "INDB", code: "BFP148" }, // Plain dosa
    { source: "INDB", code: "ASC146" }, // Masala dosa
    { source: "INDB", code: "BFP044" }, // Poha
    { source: "INDB", code: "BFP045" }, // Vegetable poha
    { source: "INDB", code: "BFP039" }, // Suji upma
    { source: "INDB", code: "BFP043" }, // Vegetable upma
    { source: "INDB", code: "BFP152" }, // Uttapam
    { source: "INDB", code: "ASC490" }, // Dalia khichdi
    { source: "INDB", code: "ASC486" }, // Sweet dalia
    { source: "INDB", code: "OSR007" }, // Apple oats smoothie
    { source: "INDB", code: "ASC051" }, // Cornflakes with milk
    { source: "INDB", code: "ASC056" }, // Boiled egg
    { source: "IFCT", code: "M004" }, // Egg boiled whole
  ],
  snacks: [
    { source: "INDB", code: "ASC259" }, // Sprouted moong salad
    { source: "INDB", code: "ASC170" }, // Sprouted moong chat
    { source: "INDB", code: "ASC265" }, // Fruit salad
    { source: "INDB", code: "ASC477" }, // Rice flakes + roasted channa
    { source: "INDB", code: "ASC054" }, // Murmura
    { source: "INDB", code: "BFP303" }, // Cucumber yogurt salad
    { source: "INDB", code: "ASC022" }, // Salted lassi
    { source: "INDB", code: "ASC382" }, // Peanut chikki
    { source: "IFCT", code: "E001" }, // Apple
    { source: "IFCT", code: "E012" }, // Banana robusta
    { source: "IFCT", code: "L003" }, // Paneer
  ],
  "street-food": [
    { source: "INDB", code: "ASC361" }, // Potato samosa
    { source: "INDB", code: "BFP431" }, // Vegetable samosa
    { source: "INDB", code: "BFP436" }, // Medu vada
    { source: "INDB", code: "ASC378" }, // Masala vada
    { source: "INDB", code: "ASC279" }, // Dahi vada
    { source: "INDB", code: "ASC351" }, // Aloo pakoda
    { source: "INDB", code: "OSR112" }, // Pav bhaji
    { source: "INDB", code: "OSR116" }, // Spicy corn chaat
    { source: "INDB", code: "OSR108" }, // Khakhra chaat
    { source: "INDB", code: "ASC146" }, // Masala dosa
    { source: "INDB", code: "BFP044" }, // Poha
  ],
  traditional: [
    { source: "INDB", code: "ASC096" }, // Chapati/Roti
    { source: "INDB", code: "ASC165" }, // Rajmah curry
    { source: "INDB", code: "ASC162" }, // Chickpeas curry
    { source: "INDB", code: "ASC151" }, // Moong dal
    { source: "INDB", code: "ASC167" }, // Sambar
    { source: "INDB", code: "ASC215" }, // Palak paneer
    { source: "INDB", code: "BFP144" }, // Khichdi
    { source: "INDB", code: "ASC126" }, // Curd rice
    { source: "INDB", code: "ASC171" }, // Aloo gobhi
    { source: "INDB", code: "ASC177" }, // Baingan bhartha
    { source: "INDB", code: "ASC144" }, // Idli
    { source: "INDB", code: "BFP148" }, // Plain dosa
    { source: "INDB", code: "ASC191" }, // Matar paneer
  ],
};

const META = {
  "high-protein": {
    id: "high-protein",
    label: "High protein",
    mode: "filter",
    sort: "protein_desc",
    criteria:
      "IFCT & INDB foods with ≥15 g protein per 100 g (oils, sugars & spice powders excluded).",
    disclaimer:
      "Values are lab-published per 100 g edible portion — not a meal plan or muscle-gain claim.",
    examples: ["Dals", "Paneer", "Egg", "Poultry"],
  },
  "high-fibre": {
    id: "high-fibre",
    label: "High fibre",
    mode: "filter",
    sort: "fibre_desc",
    criteria:
      "IFCT & INDB foods with ≥5 g fibre per 100 g (oils, sugars & spice powders excluded).",
    disclaimer:
      "Fibre content only — not a gut-health prescription. Portions still matter.",
    examples: ["Legumes", "Millets", "Vegetables"],
  },
  "low-carb": {
    id: "low-carb",
    label: "Lower carb",
    mode: "filter",
    sort: "protein_desc",
    criteria:
      "≤10 g available carbohydrate and ≥10 g protein per 100 g (oils, sugars & spice powders excluded).",
    disclaimer:
      "Lower carb relative to many staples — not keto advice. Check the full plate.",
    examples: ["Paneer", "Egg", "Meat", "Fish"],
  },
  "lower-calorie": {
    id: "lower-calorie",
    label: "Lower calorie",
    mode: "filter",
    sort: "calories_asc",
    criteria:
      "10–80 kcal per 100 g from IFCT & INDB (oils, sugars & spice powders excluded).",
    disclaimer:
      "Lower energy density per 100 g — not a weight-loss guarantee. Cooking fat changes totals.",
    examples: ["Vegetables", "Salads", "Broths"],
  },
  vegetarian: {
    id: "vegetarian",
    label: "Vegetarian dishes",
    mode: "curated",
    criteria:
      "Curated lacto-vegetarian INDB/IFCT entries (includes dairy like paneer & curd).",
    disclaimer:
      "Hand-picked verified codes only — not every vegetarian food in India.",
    examples: ["Paneer", "Dal", "Sabzi", "Roti"],
  },
  vegan: {
    id: "vegan",
    label: "Plant-based dishes",
    mode: "curated",
    criteria:
      "Curated plant-based INDB/IFCT entries (no meat, egg, or dairy in this list).",
    disclaimer:
      "Based on dish names/ingredients in the databank — recipes at home may differ.",
    examples: ["Chole", "Rajma", "Sabzi", "Sprouts"],
  },
  breakfast: {
    id: "breakfast",
    label: "Breakfast plates",
    mode: "curated",
    criteria: "Common Indian breakfast dishes with verified IFCT/INDB codes.",
    disclaimer:
      "Familiar breakfast items — not ranked as “healthiest”. Compare macros yourself.",
    examples: ["Idli", "Dosa", "Poha", "Upma"],
  },
  snacks: {
    id: "snacks",
    label: "Snacks",
    mode: "curated",
    criteria: "Snack-style IFCT/INDB foods with verified codes.",
    disclaimer:
      "Includes lighter and denser snacks — read kcal/protein before you log.",
    examples: ["Sprouts", "Fruit", "Murmura", "Chikki"],
  },
  "street-food": {
    id: "street-food",
    label: "Street food",
    mode: "curated",
    criteria: "Common street / chaat-style dishes matched in INDB.",
    disclaimer:
      "Many are energy-dense (fried). Values are per 100 g as published — portions vary widely.",
    examples: ["Samosa", "Vada", "Pav bhaji", "Chaat"],
  },
  traditional: {
    id: "traditional",
    label: "Everyday classics",
    mode: "curated",
    criteria: "Homestyle staples with verified IFCT/INDB codes.",
    disclaimer: "A starter set of common plates — not a complete regional encyclopedia.",
    examples: ["Roti", "Dal", "Rajma", "Khichdi"],
  },
};

/** Map old homepage id → current id */
const ALIASES = {
  "weight-loss": "lower-calorie",
};

function ifctKcal(item) {
  return (Number(item.enerc) || 0) / 4.184;
}

function passesExcludeGroup(item) {
  return !EXCLUDE_IFCT_GROUPS.has(item.grup);
}

function filterHighProtein(ifctData, indbData) {
  const out = [];
  for (const item of ifctData) {
    if (!passesExcludeGroup(item)) continue;
    if ((Number(item.protcnt) || 0) < 15) continue;
    out.push({ kind: "IFCT", item, sortKey: Number(item.protcnt) || 0 });
  }
  for (const item of indbData) {
    if ((Number(item.protein_g) || 0) < 15) continue;
    out.push({ kind: "INDB", item, sortKey: Number(item.protein_g) || 0 });
  }
  return out;
}

function filterHighFibre(ifctData, indbData) {
  const out = [];
  for (const item of ifctData) {
    if (!passesExcludeGroup(item)) continue;
    if ((Number(item.fibtg) || 0) < 5) continue;
    out.push({ kind: "IFCT", item, sortKey: Number(item.fibtg) || 0 });
  }
  for (const item of indbData) {
    if ((Number(item.fibre_g) || 0) < 5) continue;
    out.push({ kind: "INDB", item, sortKey: Number(item.fibre_g) || 0 });
  }
  return out;
}

function filterLowCarb(ifctData, indbData) {
  const out = [];
  for (const item of ifctData) {
    if (!passesExcludeGroup(item)) continue;
    const carbs = Number(item.choavldf) || 0;
    const protein = Number(item.protcnt) || 0;
    if (carbs > 10 || protein < 10) continue;
    out.push({ kind: "IFCT", item, sortKey: protein });
  }
  for (const item of indbData) {
    const carbs = Number(item.carb_g) || 0;
    const protein = Number(item.protein_g) || 0;
    if (carbs > 10 || protein < 10) continue;
    out.push({ kind: "INDB", item, sortKey: protein });
  }
  return out;
}

function filterLowerCalorie(ifctData, indbData) {
  const out = [];
  for (const item of ifctData) {
    if (!passesExcludeGroup(item)) continue;
    const kcal = ifctKcal(item);
    if (kcal < 10 || kcal > 80) continue;
    const protein = Number(item.protcnt) || 0;
    const fibre = Number(item.fibtg) || 0;
    if (protein < 0.5 && fibre < 0.5) continue;
    out.push({ kind: "IFCT", item, sortKey: -kcal });
  }
  for (const item of indbData) {
    const kcal = Number(item.energy_kcal) || 0;
    if (kcal < 10 || kcal > 80) continue;
    const protein = Number(item.protein_g) || 0;
    const fibre = Number(item.fibre_g) || 0;
    if (protein < 0.5 && fibre < 0.5) continue;
    out.push({ kind: "INDB", item, sortKey: -kcal });
  }
  return out;
}

function dedupeKey(kind, item) {
  if (kind === "IFCT") return `IFCT:${item.code}`;
  return `INDB:${item.food_code}`;
}

function resolveCurated(list, ifctData, indbData) {
  const ifctByCode = new Map(ifctData.map((i) => [String(i.code), i]));
  const indbByCode = new Map(indbData.map((i) => [String(i.food_code), i]));
  const seen = new Set();
  const out = [];
  for (const ref of list) {
    const key = `${ref.source}:${ref.code}`;
    if (seen.has(key)) continue;
    if (ref.source === "IFCT") {
      const item = ifctByCode.get(String(ref.code));
      if (!item) continue;
      seen.add(key);
      out.push({ kind: "IFCT", item, sortKey: 0 });
    } else if (ref.source === "INDB") {
      const item = indbByCode.get(String(ref.code));
      if (!item) continue;
      seen.add(key);
      out.push({ kind: "INDB", item, sortKey: 0 });
    }
  }
  return out;
}

/**
 * @returns {{ meta, rows } | null}
 */
function browseCategory(id, ifctData, indbData, { limit = 48 } = {}) {
  const resolvedId = ALIASES[id] || id;
  const meta = META[resolvedId];
  if (!meta) return null;

  let rows = [];
  if (meta.mode === "filter") {
    if (resolvedId === "high-protein") rows = filterHighProtein(ifctData, indbData);
    else if (resolvedId === "high-fibre") rows = filterHighFibre(ifctData, indbData);
    else if (resolvedId === "low-carb") rows = filterLowCarb(ifctData, indbData);
    else if (resolvedId === "lower-calorie") rows = filterLowerCalorie(ifctData, indbData);
  } else {
    rows = resolveCurated(CURATED[resolvedId] || [], ifctData, indbData);
  }

  // Deduplicate
  const seen = new Set();
  rows = rows.filter((r) => {
    const k = dedupeKey(r.kind, r.item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  rows.sort((a, b) => b.sortKey - a.sortKey);

  const totalMatching = rows.length;
  const capped = rows.slice(0, Math.min(Math.max(limit, 1), 80));

  return {
    meta: {
      ...meta,
      totalMatching,
      shown: capped.length,
      per: "100g",
      sources: ["IFCT 2017 (ICMR-NIN)", "INDB (Indian Nutrient Databank)"],
    },
    rows: capped,
  };
}

function listCategories() {
  return Object.values(META).map((m) => ({
    id: m.id,
    label: m.label,
    mode: m.mode,
    criteria: m.criteria,
    examples: m.examples,
  }));
}

module.exports = {
  META,
  ALIASES,
  browseCategory,
  listCategories,
  EXCLUDE_IFCT_GROUPS,
  ANIMAL_IFCT_GROUPS,
};
