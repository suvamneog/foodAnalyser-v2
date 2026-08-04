// ------------------------------
// 🇮🇳 Unified Indian Food Search API
// IFCT 2017 + INDB + CalorieNinjas Fallback - OPTIMIZED FOR SWIPING
// ------------------------------

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mongoose = require("mongoose");
const auth = require("../middleware/authMiddleware");
const FoodSearch = require("../models/foodSearch");
const { expandQuery } = require("../utils/foodAliases");
const { scoreName, rankCandidates, isDishQuery } = require("../utils/searchRanking");
const { browseCategory, listCategories } = require("../utils/categoryBrowse");
require("dotenv").config();

// 🥗 Load IFCT dataset
let ifctData = [];
try {
  const ifctPath = path.resolve(__dirname, "../data/ifct_dataset.json");
  console.log("📄 Loading IFCT data from:", ifctPath);
  ifctData = JSON.parse(fs.readFileSync(ifctPath, "utf-8"));
  console.log(`✅ IFCT dataset loaded (${ifctData.length} Indian foods)`);
} catch (err) {
  console.error("❌ Error loading IFCT dataset:", err.message);
}

// 🍛 Load INDB dataset
let indbData = [];
try {
  const indbPath = path.resolve(__dirname, "../data/indb_dataset.json");
  console.log("📄 Loading INDB data from:", indbPath);
  indbData = JSON.parse(fs.readFileSync(indbPath, "utf-8"));
  console.log(`✅ INDB dataset loaded (${indbData.length} Indian recipes)`);
} catch (err) {
  console.error("❌ Error loading INDB dataset:", err.message);
}

// 🌿 Assam regional research recipes (lab papers — not IFCT/INDB)
let assamData = [];
try {
  const assamPath = path.resolve(__dirname, "../data/assam_dataset.json");
  console.log("📄 Loading Assam research recipes from:", assamPath);
  assamData = JSON.parse(fs.readFileSync(assamPath, "utf-8"));
  console.log(`✅ Assam research recipes loaded (${assamData.length})`);
} catch (err) {
  console.error("❌ Error loading Assam dataset:", err.message);
}

// 🌿 Manipur / Meghalaya / Nagaland research foods
let northeastData = [];
try {
  const nePath = path.resolve(__dirname, "../data/northeast_dataset.json");
  console.log("📄 Loading Northeast research recipes from:", nePath);
  northeastData = JSON.parse(fs.readFileSync(nePath, "utf-8"));
  console.log(`✅ Northeast research recipes loaded (${northeastData.length})`);
} catch (err) {
  console.error("❌ Error loading Northeast dataset:", err.message);
}

const REGIONAL_SOURCES = new Set(["ASSAM", "MANIPUR", "MEGHALAYA", "NAGALAND"]);
const allRegionalData = () => [...assamData, ...northeastData];

// Helper function to parse nutrition values
function parseNutritionValue(value) {
  if (value === "N/A" || value === undefined || value === null) return 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return Number(cleaned) || 0;
  }
  return Number(value) || 0;
}

function formatIfctItem(item, score = null) {
  const enhanced = addChickenSpecificity(item.name, "IFCT 2017", item);
  const row = {
    source: "IFCT 2017 (ICMR-NIN)",
    sourceShort: "IFCT",
    food_code: item.code || null,
    name: enhanced.displayName,
    displayName: enhanced.displayName,
    cut: enhanced.cut,
    preparation: enhanced.preparation,
    isRaw: enhanced.isRaw,
    isCooked: enhanced.isCooked,
    calories: parseFloat((item.enerc / 4.184).toFixed(1)),
    protein_g: parseFloat((item.protcnt || 0).toFixed(2)),
    carbohydrates_total_g: parseFloat((item.choavldf || 0).toFixed(2)),
    fat_total_g: parseFloat((item.fatce || 0).toFixed(2)),
    fiber_g: parseFloat((item.fibtg || 0).toFixed(2)),
    serving_size_g: 100,
    serving_description: "per 100g edible portion",
  };
  if (score != null) row.search_score = score;
  return row;
}

function formatIndbItem(item, score = null) {
  const enhanced = addChickenSpecificity(item.food_name, "INDB", item);
  const row = {
    source: "INDB (Indian Nutrient Databank)",
    sourceShort: "INDB",
    food_code: item.food_code || null,
    name: enhanced.displayName,
    displayName: enhanced.displayName,
    cut: enhanced.cut,
    preparation: enhanced.preparation,
    isRaw: enhanced.isRaw,
    isCooked: enhanced.isCooked,
    calories: parseNutritionValue(item.energy_kcal || item["energy (kcal)"]),
    protein_g: parseNutritionValue(item.protein_g || item["protein (g)"]),
    carbohydrates_total_g: parseNutritionValue(item.carb_g || item["carbohydrates (g)"]),
    fat_total_g: parseNutritionValue(item.fat_g || item["fat (g)"]),
    fiber_g: parseNutritionValue(item.fibre_g || item["fibre (g)"]),
    serving_size_g: 100,
    serving_description: "per 100g",
  };
  if (score != null) row.search_score = score;
  return row;
}

function formatRegionalResearchItem(item, score = null) {
  const availableFields = [];
  const pick = (key, value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
    availableFields.push(key);
    return Number(Number(value).toFixed(2));
  };

  const region = item.region || "Northeast";
  const sourceShort = String(item.source_short || "NE").toUpperCase();
  const displayName = item.display_name || item.food_name;
  const row = {
    source: `${region} regional data`,
    sourceShort,
    food_code: item.food_code || null,
    name: displayName,
    displayName,
    region,
    isRaw: false,
    isCooked: true,
    // Do not expose paper citations to clients
    citation: null,
    notes:
      "Approximate regional estimate. Only available nutrients are shown; home recipes may differ.",
    calories: pick("calories", item.energy_kcal),
    protein_g: pick("protein_g", item.protein_g),
    carbohydrates_total_g: pick("carbohydrates_total_g", item.carb_g),
    fat_total_g: pick("fat_total_g", item.fat_g),
    fiber_g: pick("fiber_g", item.fibre_g),
    calcium_mg: pick("calcium_mg", item.calcium_mg),
    iron_mg: pick("iron_mg", item.iron_mg),
    sodium_mg: pick("sodium_mg", item.sodium_mg),
    potassium_mg: pick("potassium_mg", item.potassium_mg),
    zinc_mg: pick("zinc_mg", item.zinc_mg),
    vitamin_c_mg: pick("vitamin_c_mg", item.vitamin_c_mg),
    beta_carotene_ug: pick("beta_carotene_ug", item.beta_carotene_ug),
    retinol_ug: pick("retinol_ug", item.retinol_ug),
    availableFields,
    serving_size_g: 100,
    serving_description: "per 100g",
  };
  if (score != null) row.search_score = score;
  return row;
}

function formatAssamItem(item, score = null) {
  return formatRegionalResearchItem(
    { ...item, region: item.region || "Assam", source_short: "ASSAM" },
    score
  );
}

function searchRegionalPool(query, pool) {
  return rankCandidates(query, pool, {
    source: "INDB",
    getName: (item) =>
      [item.food_name, item.display_name, ...(item.aliases || [])]
        .filter(Boolean)
        .join(" "),
    limit: 20,
    minScore: 8,
    preferCooked: true,
  }).map(({ item, name, score }) => ({
    item,
    name: item.display_name || item.food_name || name,
    score,
  }));
}

function searchAssam(query) {
  return searchRegionalPool(query, assamData);
}

function searchNortheast(query) {
  return searchRegionalPool(query, northeastData);
}

function regionalBoostForQuery(query) {
  const q = String(query || "");
  if (/\b(assam|axomiya|tenga|pitika|khorisa|khar|pitha|xaak|lai sak|dhekia|kalmou|masor|masar)\b/i.test(q)) {
    return { regions: ["Assam"], boost: 80 };
  }
  if (/\b(manipur|hawaijar|hentak|ngari|soibum|soidon|meitei)\b/i.test(q)) {
    return { regions: ["Manipur"], boost: 80 };
  }
  if (/\b(meghalaya|khasi|tungrymbai|tungtap|lungsiej|sohiong)\b/i.test(q)) {
    return { regions: ["Meghalaya"], boost: 80 };
  }
  if (/\b(nagaland|hungrii|rhujuk|bastanga|bastenga|tsutuocie|anishi|axone|akhuni)\b/i.test(q)) {
    return { regions: ["Nagaland"], boost: 80 };
  }
  return { regions: [], boost: 0 };
}

// 🆕 Enhanced naming function for Indian foods
function enhanceFoodName(foodItem, source, originalName) {
  const baseName = originalName || foodItem.name || foodItem.food_name || "Unknown Food";
  const lowerName = baseName.toLowerCase();
  
  // Common Indian food variations
  const variations = {
    'idli': ['idly', 'iddly'],
    'puri': ['poori', 'puri'],
    'sambar': ['sambhar', 'sambhar'],
    'dal': ['daal', 'dhal'],
    'roti': ['rotti', 'chapati']
  };
  
  // Standardize names
  let enhancedName = baseName;
  Object.entries(variations).forEach(([standard, alts]) => {
    alts.forEach(alt => {
      if (lowerName.includes(alt)) {
        enhancedName = baseName.replace(new RegExp(alt, 'gi'), standard);
      }
    });
  });
  
  // Add specificity for chicken and meats
  if (lowerName.includes('chicken')) {
    enhancedName = addChickenSpecificity(enhancedName, source, foodItem);
  }
  
  // Add preparation info for INDB items
  if (source.includes('INDB') && foodItem.preparation_method) {
    enhancedName = `${enhancedName} (${foodItem.preparation_method})`;
  }
  
  return enhancedName;
}

// 🆕 Add specificity for chicken results
function addChickenSpecificity(baseName, source, foodItem) {
  const lowerName = baseName.toLowerCase();
  
  // Chicken cuts and parts
  const cuts = {
    'breast': 'Breast', 'thigh': 'Thigh', 'leg': 'Leg', 'wing': 'Wing',
    'drumstick': 'Drumstick', 'whole': 'Whole', 'mince': 'Minced', 'keema': 'Keema',
    'boneless': 'Boneless', 'with bone': 'With Bone', 'skinless': 'Skinless'
  };
  
  // Preparation styles
  const preparations = {
    'curry': 'Curry', 'masala': 'Masala', 'biryani': 'Biryani', 'tandoori': 'Tandoori',
    'fried': 'Fried', 'roast': 'Roasted', 'grilled': 'Grilled', 'stew': 'Stew',
    'butter': 'Butter', 'kadhai': 'Kadhai', 'handi': 'Handi', 'korma': 'Korma'
  };
  
  let specificName = baseName;
  let foundCut = '';
  let foundPrep = '';
  
  // Identify cut/part
  Object.entries(cuts).forEach(([key, value]) => {
    if (lowerName.includes(key)) {
      foundCut = value;
      // Only modify if not already descriptive
      if (!specificName.includes(value)) {
        specificName = specificName.replace(/chicken/gi, `Chicken ${value}`);
      }
    }
  });
  
  // Identify preparation style
  Object.entries(preparations).forEach(([key, value]) => {
    if (lowerName.includes(key) && !specificName.includes(value)) {
      foundPrep = value;
      specificName = `${specificName} ${value}`;
    }
  });
  
  // Add source context
  if (source.includes('IFCT') && !foundPrep) {
    specificName = `${specificName} (Raw)`;
  } else if (source.includes('INDB') && !foundPrep) {
    specificName = `${specificName} (Prepared)`;
  }
  
  return {
    displayName: specificName.trim(),
    cut: foundCut,
    preparation: foundPrep,
    isRaw: source.includes('IFCT') && !foundPrep,
    isCooked: source.includes('INDB') || !!foundPrep
  };
}

// 🆕 Smart grouping to avoid duplicate chicken results
function groupAndDiversifyResults(results, query) {
  const byScore = (a, b) => (b.search_score || 0) - (a.search_score || 0);

  if (results.length <= 6) {
    return results.slice().sort(byScore);
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Only group for generic queries like "chicken", "rice", etc.
  const shouldGroup = lowerQuery.includes('chicken') || 
                     lowerQuery.includes('rice') || 
                     lowerQuery.includes('dal') ||
                     lowerQuery.includes('paneer');
  
  if (!shouldGroup) {
    return results.slice().sort(byScore).slice(0, 6);
  }
  
  const groups = {
    raw: [],
    curry: [],
    fried: [],
    grilled: [],
    biryani: [],
    traditional: [],
    assam: [],
    other: []
  };
  
  results.forEach(result => {
    const name = result.displayName.toLowerCase();
    const source = result.source || '';
    const short = String(result.sourceShort || "").toUpperCase();
    
    if (
      REGIONAL_SOURCES.has(short) ||
      source.toLowerCase().includes("assam") ||
      source.toLowerCase().includes("manipur") ||
      source.toLowerCase().includes("meghalaya") ||
      source.toLowerCase().includes("nagaland")
    ) {
      groups.assam.push(result);
    } else if (name.includes('raw') || (source.includes('IFCT') && !name.includes('curry'))) {
      groups.raw.push(result);
    } else if (name.includes('curry') || name.includes('masala') || name.includes('gravy')) {
      groups.curry.push(result);
    } else if (name.includes('fried')) {
      groups.fried.push(result);
    } else if (name.includes('grilled') || name.includes('roast') || name.includes('tandoori')) {
      groups.grilled.push(result);
    } else if (name.includes('biryani') || name.includes('pulao')) {
      groups.biryani.push(result);
    } else if (name.includes('butter') || name.includes('kadhai') || name.includes('korma')) {
      groups.traditional.push(result);
    } else {
      groups.other.push(result);
    }
  });
  
  // Take best from each group
  const finalResults = [];
  Object.values(groups).forEach(group => {
    if (group.length > 0) {
      // Sort by search score and take the best one
      const bestInGroup = group.sort(byScore)[0];
      finalResults.push(bestInGroup);
    }
  });
  
  // Sort final results by search score
  return finalResults.sort(byScore).slice(0, 6);
}

// Ranking-backed IFCT search (typo-tolerant + Indian relevance)
function searchIFCT(query, preferCooked) {
  const ranked = rankCandidates(query, ifctData, {
    source: "IFCT",
    getName: (item) => item.name,
    limit: 40,
    minScore: 6,
    preferCooked,
  });
  return ranked.map(({ item, name, score }) => ({ item, name, score }));
}

// Ranking-backed INDB search
function searchINDB(query, preferCooked) {
  const ranked = rankCandidates(query, indbData, {
    source: "INDB",
    getName: (item) => item.food_name,
    limit: 40,
    minScore: 6,
    preferCooked,
  });
  return ranked.map(({ item, name, score }) => ({ item, name, score }));
}

// ------------------------------------
// 🗂️ Browse by category (verified macro filters + curated codes)
// GET /api/food/category/:id?limit=48
// GET /api/food/categories
// ------------------------------------
router.get("/categories", (_req, res) => {
  res.json({ categories: listCategories() });
});

router.get("/category/:id", (req, res) => {
  try {
    const id = String(req.params.id || "").trim().toLowerCase();
    const limit = Math.min(80, Math.max(1, Number(req.query.limit) || 48));
    const result = browseCategory(id, ifctData, indbData, { limit });
    if (!result) {
      return res.status(404).json({
        error: "Unknown category",
        categories: listCategories().map((c) => c.id),
      });
    }

    const items = result.rows.map(({ kind, item }) => {
      if (kind === "IFCT") {
        const row = formatIfctItem(item);
        row.food_group = item.grup || null;
        return row;
      }
      return formatIndbItem(item);
    });

    return res.json({
      id: result.meta.id,
      label: result.meta.label,
      mode: result.meta.mode,
      criteria: result.meta.criteria,
      disclaimer: result.meta.disclaimer,
      examples: result.meta.examples,
      per: result.meta.per,
      sources: result.meta.sources,
      totalMatching: result.meta.totalMatching,
      shown: result.meta.shown,
      items,
    });
  } catch (err) {
    console.error("❌ /category error:", err.message);
    return res.status(500).json({ error: "Failed to load category foods" });
  }
});

// ------------------------------------
// 🎯 Exact lookup by dataset code (Discover cards)
// GET /api/food/by-id?source=INDB&code=ASC242
// ------------------------------------
router.get("/by-id", (req, res) => {
  try {
    const source = String(req.query.source || "").trim().toUpperCase();
    const code = String(req.query.code || "").trim().toUpperCase();
    const label = String(req.query.label || "").trim();

    if (!source || !code) {
      return res.status(400).json({ error: "Missing source or code" });
    }

    let item = null;
    if (source === "INDB") {
      item = indbData.find(
        (f) => String(f.food_code || "").toUpperCase() === code
      );
      if (!item) {
        return res.status(404).json({ error: `No INDB food with code ${code}` });
      }
      const formatted = formatIndbItem(item);
      if (label) formatted.requestedName = label;
      saveSearch(req, label || formatted.displayName, formatted);
      return res.json({ items: [formatted], exact: true });
    }

    if (source === "IFCT") {
      item = ifctData.find((f) => String(f.code || "").toUpperCase() === code);
      if (!item) {
        return res.status(404).json({ error: `No IFCT food with code ${code}` });
      }
      const formatted = formatIfctItem(item);
      if (label) formatted.requestedName = label;
      saveSearch(req, label || formatted.displayName, formatted);
      return res.json({ items: [formatted], exact: true });
    }

    if (source === "ASSAM") {
      item = assamData.find(
        (f) => String(f.food_code || "").toUpperCase() === code
      );
      if (!item) {
        return res.status(404).json({ error: `No Assam research food with code ${code}` });
      }
      const formatted = formatAssamItem(item);
      if (label) formatted.requestedName = label;
      saveSearch(req, label || formatted.displayName, formatted);
      return res.json({ items: [formatted], exact: true });
    }

    if (REGIONAL_SOURCES.has(source) || source === "NE" || source === "NORTHEAST") {
      const pool =
        source === "ASSAM"
          ? assamData
          : source === "NE" || source === "NORTHEAST"
          ? allRegionalData()
          : northeastData.filter(
              (f) => String(f.source_short || "").toUpperCase() === source
            );
      item = pool.find((f) => String(f.food_code || "").toUpperCase() === code);
      if (!item) {
        // Also allow looking up any NE code regardless of source filter
        item = allRegionalData().find(
          (f) => String(f.food_code || "").toUpperCase() === code
        );
      }
      if (!item) {
        return res.status(404).json({
          error: `No regional research food with code ${code}`,
        });
      }
      const formatted = formatRegionalResearchItem({
        ...item,
        source_short: item.source_short || source,
      });
      if (label) formatted.requestedName = label;
      saveSearch(req, label || formatted.displayName, formatted);
      return res.json({ items: [formatted], exact: true });
    }

    return res.status(400).json({
      error: "source must be IFCT, INDB, ASSAM, MANIPUR, MEGHALAYA, or NAGALAND",
    });
  } catch (err) {
    console.error("❌ /by-id error:", err.message);
    return res.status(500).json({ error: "Lookup failed" });
  }
});

// ------------------------------------
// ⚡ Fast Autocomplete: /api/food/suggest?q=...
// Name-only, in-memory, typo-tolerant. Returns up to 8 items.
// ------------------------------------
router.get("/suggest", (req, res) => {
  try {
    const raw = (req.query.q || "").toString().trim();
    if (!raw || raw.length < 2) {
      return res.json({ items: [] });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 15);
    const variants = expandQuery(raw);

    // Score IFCT
    const ifctScored = new Map();
    for (const qv of variants) {
      for (const it of ifctData) {
        const name = it.name;
        if (!name) continue;
        const s = scoreName(qv, name, {
          source: "IFCT",
          preferCooked: isDishQuery(raw),
        });
        if (s < 10) continue;
        const key = name.toLowerCase();
        const prev = ifctScored.get(key);
        if (!prev || s > prev.score)
          ifctScored.set(key, {
            name,
            score: s,
            source: "IFCT",
            food_code: it.code || null,
          });
      }
    }

    // Score INDB
    const indbScored = new Map();
    for (const qv of variants) {
      for (const it of indbData) {
        const name = it.food_name;
        if (!name) continue;
        const s = scoreName(qv, name, {
          source: "INDB",
          preferCooked: isDishQuery(raw),
        });
        if (s < 10) continue;
        const key = name.toLowerCase();
        const prev = indbScored.get(key);
        if (!prev || s > prev.score)
          indbScored.set(key, {
            name,
            score: s,
            source: "INDB",
            food_code: it.food_code || null,
          });
      }
    }

    // Score Assam + Northeast research recipes
    const regionalScored = new Map();
    for (const qv of variants) {
      for (const it of allRegionalData()) {
        const name = it.display_name || it.food_name;
        const hay = [it.food_name, it.display_name, ...(it.aliases || [])]
          .filter(Boolean)
          .join(" ");
        if (!hay) continue;
        const s = scoreName(qv, hay, {
          source: "INDB",
          preferCooked: isDishQuery(raw),
        });
        if (s < 10) continue;
        const key = name.toLowerCase();
        const prev = regionalScored.get(key);
        if (!prev || s > prev.score)
          regionalScored.set(key, {
            name,
            score: s,
            source: String(it.source_short || "NE").toUpperCase(),
            food_code: it.food_code || null,
          });
      }
    }

    // Merge: dedupe by lowercase name, prefer higher score
    const merged = new Map();
    const push = (row) => {
      const key = row.name.toLowerCase();
      const prev = merged.get(key);
      if (!prev || row.score > prev.score) merged.set(key, row);
    };
    for (const row of ifctScored.values()) push(row);
    for (const row of indbScored.values()) push(row);
    for (const row of regionalScored.values()) push(row);

    const sourceLabel = {
      IFCT: "IFCT 2017 (ICMR-NIN)",
      INDB: "INDB (Indian Nutrient Databank)",
      ASSAM: "Assam regional data",
      MANIPUR: "Manipur regional data",
      MEGHALAYA: "Meghalaya regional data",
      NAGALAND: "Nagaland regional data",
    };

    const items = Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => ({
        name: r.name,
        displayName: r.name,
        food_code: r.food_code,
        source: sourceLabel[r.source] || `${r.source} research`,
        sourceShort: r.source,
      }));

    return res.json({ items, query: raw });
  } catch (err) {
    console.error("❌ /suggest error:", err.message);
    return res.status(500).json({ items: [], error: "Suggest failed" });
  }
});

// ------------------------------------
// 🔍 Enhanced Search Endpoint
// ------------------------------------
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) {
      return res.status(400).json({ error: "Missing 'q' parameter" });
    }

    console.log(`\n🔍 MAIN SEARCH for: "${query}"`);

    let allResults = [];
    const preferCooked = isDishQuery(query);

    // Expand multilingual / transliteration aliases (recall only — not a nutrition claim)
    const queryVariants = expandQuery(query);
    console.log(`🌐 Alias expansions: ${queryVariants.join(" | ")}`);
    console.log(`🍳 Dish intent: ${preferCooked ? "cooked/INDB preferred" : "ingredient/IFCT preferred"}`);

    // 🔹 Step 1 — Search IFCT (original + alias expansions)
    console.log(`🔍 STEP 1: Searching IFCT database...`);
    const ifctByName = new Map();
    for (const qv of queryVariants) {
      for (const match of searchIFCT(qv, preferCooked)) {
        const key = (match.name || "").toLowerCase();
        const prev = ifctByName.get(key);
        if (!prev || match.score > prev.score) ifctByName.set(key, match);
      }
    }
    const ifctResults = Array.from(ifctByName.values()).sort((a, b) => b.score - a.score);

    if (ifctResults.length > 0) {
      console.log(`✅ STEP 1 RESULT: Found ${ifctResults.length} items in IFCT`);
      
      const topIfctResults = ifctResults
        .slice(0, preferCooked ? 2 : 4)
        .map((match) => formatIfctItem(match.item, match.score));

      allResults = [...allResults, ...topIfctResults];
    }

    // 🔹 Step 2 — Search INDB (original + alias expansions)
    console.log(`🔍 STEP 2: Searching INDB database...`);
    const indbByName = new Map();
    for (const qv of queryVariants) {
      for (const match of searchINDB(qv, preferCooked)) {
        const key = (match.name || "").toLowerCase();
        const prev = indbByName.get(key);
        if (!prev || match.score > prev.score) indbByName.set(key, match);
      }
    }
    const indbResults = Array.from(indbByName.values()).sort((a, b) => b.score - a.score);

    if (indbResults.length > 0) {
      console.log(`✅ STEP 2 RESULT: Found ${indbResults.length} items in INDB`);
      
      const topIndbResults = indbResults
        .slice(0, preferCooked ? 5 : 3)
        .map((match) => formatIndbItem(match.item, match.score));

      allResults = [...allResults, ...topIndbResults];
    }

    // 🔹 Step 2b — Assam + Northeast regional research recipes
    console.log(`🔍 STEP 2b: Searching regional research recipes...`);
    const regionalByName = new Map();
    for (const qv of queryVariants) {
      for (const match of [...searchAssam(qv), ...searchNortheast(qv)]) {
        const key = (match.name || "").toLowerCase();
        const prev = regionalByName.get(key);
        if (!prev || match.score > prev.score) regionalByName.set(key, match);
      }
    }
    const regionalResults = Array.from(regionalByName.values()).sort(
      (a, b) => b.score - a.score
    );

    if (regionalResults.length > 0) {
      console.log(`✅ STEP 2b RESULT: Found ${regionalResults.length} regional research items`);
      const { regions: boostRegions, boost } = regionalBoostForQuery(query);
      const topRegional = regionalResults
        .slice(0, boost > 0 ? 5 : 3)
        .map((match) => {
          const row = formatRegionalResearchItem(
            {
              ...match.item,
              source_short:
                match.item.source_short ||
                (match.item.region === "Assam" ? "ASSAM" : "NE"),
            },
            match.score
          );
          if (
            boost > 0 &&
            (boostRegions.length === 0 ||
              boostRegions.includes(match.item.region) ||
              boostRegions.includes(row.region))
          ) {
            row.search_score = (row.search_score || 0) + boost;
          }
          return row;
        });
      allResults = [...allResults, ...topRegional];
    }

    // 🔹 Step 3 — Global fallback (ONLY if no Indian database matches)
    if (allResults.length === 0) {
      console.log(`🔍 STEP 3: Trying CalorieNinjas fallback...`);
      try {
        const calorieNinjaKey = process.env.CALORIE_NINJA_API_KEY;
        
        const response = await axios.get(
          `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
          {
            headers: { 
              "X-Api-Key": calorieNinjaKey,
              "Content-Type": "application/json"
            },
            timeout: 5000
          }
        );

        if (response.data.items?.length > 0) {
          const calorieNinjasResults = response.data.items.slice(0, 3).map(item => ({
            source: "CalorieNinjas (Global Fallback)",
            name: item.name,
            displayName: item.name,
            calories: item.calories,
            protein_g: item.protein_g,
            carbohydrates_total_g: item.carbohydrates_total_g,
            fat_total_g: item.fat_total_g,
            fiber_g: item.fiber_g || 0,
            sugar_g: item.sugar_g || 0,
            fat_saturated_g: item.fat_saturated_g || 0,
            sodium_mg: item.sodium_mg || 0,
            cholesterol_mg: item.cholesterol_mg || 0,
            serving_size_g: 100,
            serving_description: "per 100g",
            search_score: 1
          }));

          allResults = [...allResults, ...calorieNinjasResults];
        }
      } catch (err) {
        console.error("STEP 3 ERROR: CalorieNinjas API failed:", err.message);
      }
    }

    // Final result processing
    if (allResults.length > 0) {
      // Remove duplicates based on display name
      const uniqueResults = allResults.filter((result, index, self) =>
        index === self.findIndex(r => 
          r.displayName.toLowerCase() === result.displayName.toLowerCase()
        )
      );

      // Smart grouping for diverse results
      const diversifiedResults = groupAndDiversifyResults(uniqueResults, query);

      // Sort by search score
      diversifiedResults.sort((a, b) => (b.search_score || 0) - (a.search_score || 0));

      const topScore = diversifiedResults[0]?.search_score || 0;
      const confident = topScore >= 40;

      // Keep related alternatives when confidence is middling
      const related = diversifiedResults
        .slice(1, 5)
        .map(({ search_score, ...rest }) => rest);

      // Remove search_score from final response
      const finalResults = diversifiedResults.map(({ search_score, ...rest }) => rest);

      console.log(`🏁 FINAL: Returning ${finalResults.length} diverse results (top=${topScore}, confident=${confident})`);
      console.log("🏁 Results:", finalResults.map(r => `${r.displayName} (${r.source})`));
      
      saveSearch(req, query, finalResults[0]);
      return res.json({
        items: finalResults,
        query,
        confident,
        related,
      });
    } else {
      console.log(`💀 FINAL RESULT: No results found for "${query}"`);

      // Try lower-bar "did you mean" suggestions — same scorer, lower minScore.
      const guessSet = new Map();
      for (const qv of queryVariants) {
        for (const it of ifctData) {
          const name = it.name;
          if (!name) continue;
          const s = scoreName(qv, name, { source: "IFCT" });
          if (s < 4) continue;
          const key = name.toLowerCase();
          const prev = guessSet.get(key);
          if (!prev || s > prev.score) guessSet.set(key, { name, score: s, source: "IFCT 2017 (ICMR-NIN)" });
        }
        for (const it of indbData) {
          const name = it.food_name;
          if (!name) continue;
          const s = scoreName(qv, name, { source: "INDB" });
          if (s < 4) continue;
          const key = name.toLowerCase();
          const prev = guessSet.get(key);
          if (!prev || s > prev.score) guessSet.set(key, { name, score: s, source: "INDB (Indian Nutrient Databank)" });
        }
        for (const it of allRegionalData()) {
          const name = it.display_name || it.food_name;
          const hay = [it.food_name, it.display_name, ...(it.aliases || [])]
            .filter(Boolean)
            .join(" ");
          if (!hay) continue;
          const s = scoreName(qv, hay, { source: "INDB" });
          if (s < 4) continue;
          const key = name.toLowerCase();
          const prev = guessSet.get(key);
          const label = `${it.region || "Northeast"} regional data`;
          if (!prev || s > prev.score)
            guessSet.set(key, {
              name,
              score: s,
              source: label,
              sourceShort: String(it.source_short || "NE").toUpperCase(),
            });
        }
      }
      const suggestions = Array.from(guessSet.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((g) => ({ name: g.name, displayName: g.name, source: g.source }));

      return res.status(404).json({
        error: `No results found for "${query}" in our databases.`,
        suggestions,
        hints: [
          "Try the Hindi/regional name (e.g. rajma, kadhi, moong dal).",
          "Add the dish name instead of ingredients (e.g. 'chicken curry' vs 'chicken').",
          "Check spelling — 'panner' → 'paneer', 'chiken' → 'chicken'.",
        ],
      });
    }
  } catch (error) {
    console.error("❌ UNEXPECTED ERROR in /api/search:", error.message);
    res.status(500).json({ error: "Server error while searching datasets." });
  }
});
// ------------------------------------
// HISTORY ENDPOINTS (FIXED VERSION)
// ------------------------------------

// 📜 Get Search History
router.get("/history", auth, async (req, res) => {
  try {
    console.log(`📜 Fetching history for user: ${req.user.id}`);
    
    const history = await FoodSearch.find({ userID: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(50);

    console.log(`✅ Retrieved ${history.length} history items for user ${req.user.id}`);
    res.json({ history });
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch search history" });
  }
});

// ------------------------------------
// HISTORY ENDPOINTS (FIXED VERSION - REORDERED)
// ------------------------------------

// 🗑️ Clear All History (MOVE THIS BEFORE :id)
router.delete("/history/clear", auth, async (req, res) => {
  try {
    console.log(`🗑️ Clearing all history for user: ${req.user.id}`);
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database connection not ready');
      return res.status(503).json({ error: "Database connection unavailable" });
    }

    // Use deleteMany to delete all user's history
    const result = await FoodSearch.deleteMany({
      userID: req.user.id
    });

    console.log(`✅ Cleared all history for user ${req.user.id}: ${result.deletedCount} items deleted`);
    res.json({ 
      message: "All history cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("❌ Error clearing history:", error);
    
    let errorMessage = "Failed to clear history";
    
    if (error.name === 'MongoError') {
      errorMessage = "Database error occurred while clearing history";
    } else if (error.name === 'CastError') {
      errorMessage = "Invalid user ID format";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🗑️ Bulk Delete History Items (MOVE THIS BEFORE :id TOO)
router.delete("/history/bulk", auth, async (req, res) => {
  try {
    const { itemIds } = req.body;

    console.log(`🗑️ Bulk delete request for user ${req.user.id}:`, itemIds);

    // Validate request body
    if (!itemIds) {
      return res.status(400).json({ error: "Missing itemIds in request body" });
    }

    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ error: "itemIds must be an array" });
    }

    if (itemIds.length === 0) {
      return res.status(400).json({ error: "No items specified for deletion" });
    }

    // Validate all IDs are valid MongoDB ObjectIds
    const validIds = itemIds.filter(id => {
      if (!id || typeof id !== 'string') {
        console.log(`❌ Invalid ID format: ${id} (type: ${typeof id})`);
        return false;
      }
      
      const isValid = mongoose.Types.ObjectId.isValid(id);
      if (!isValid) {
        console.log(`❌ Invalid ObjectId: ${id}`);
      }
      return isValid;
    });
    
    console.log(`✅ Valid IDs for deletion:`, validIds);

    if (validIds.length === 0) {
      return res.status(400).json({ 
        error: "No valid item IDs provided",
        receivedIds: itemIds,
        validIds: validIds
      });
    }

    // Convert string IDs to ObjectIds for the query
    const objectIds = validIds.map(id => new mongoose.Types.ObjectId(id));

    // Perform the deletion
    const result = await FoodSearch.deleteMany({
      _id: { $in: objectIds },
      userID: req.user.id
    });

    console.log(`✅ Bulk deleted ${result.deletedCount} items for user ${req.user.id}`);
    res.json({ 
      message: `${result.deletedCount} items deleted successfully`,
      deletedCount: result.deletedCount,
      requestedCount: itemIds.length,
      validCount: validIds.length
    });
  } catch (error) {
    console.error("❌ Error bulk deleting history:", error);
    res.status(500).json({ 
      error: "Failed to delete history items",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 📜 Get Search History (KEEP THIS BEFORE :id)
router.get("/history", auth, async (req, res) => {
  try {
    console.log(`📜 Fetching history for user: ${req.user.id}`);
    
    const history = await FoodSearch.find({ userID: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(50);

    console.log(`✅ Retrieved ${history.length} history items for user ${req.user.id}`);
    res.json({ history });
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch search history" });
  }
});

// 🗑️ Delete Single History Item (THIS SHOULD BE LAST)
router.delete("/history/:id", auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    
    console.log(`🗑️ Attempting to delete history item: ${itemId} for user: ${req.user.id}`);
    
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      console.log(`❌ Invalid history item ID format: ${itemId}`);
      return res.status(400).json({ 
        error: "Invalid history item ID format",
        receivedId: itemId
      });
    }

    const deletedItem = await FoodSearch.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(itemId),
      userID: req.user.id
    });

    if (!deletedItem) {
      console.log(`❌ History item not found: ${itemId}`);
      return res.status(404).json({ 
        error: "History item not found",
        itemId: itemId
      });
    }

    console.log(`✅ Deleted history item for user ${req.user.id}: ${deletedItem.query}`);
    res.json({ 
      message: "History item deleted successfully",
      deletedItem: {
        id: deletedItem._id,
        query: deletedItem.query
      }
    });
  } catch (error) {
    console.error("❌ Error deleting history item:", error);
    res.status(500).json({ 
      error: "Failed to delete history item",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🧪 Test endpoint to verify backend functionality
router.get("/history/test", auth, (req, res) => {
  console.log("✅ History test endpoint hit for user:", req.user.id);
  res.json({ 
    message: "History endpoint working",
    userId: req.user.id,
    timestamp: new Date().toISOString(),
    databaseConnected: mongoose.connection.readyState === 1
  });
});

// 🧾 Helper: search history UI removed — no longer persist FoodSearch rows
async function saveSearch() {
  return;
}

module.exports = router;