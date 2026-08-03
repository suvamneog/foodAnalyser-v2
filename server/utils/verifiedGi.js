/**
 * Curated glycemic index values from published tables.
 * Prefer healthy-subject entries from Atkinson et al. 2021 International Tables
 * (glucose = 100). Do not invent clinical GI values.
 *
 * Status:
 * - verified: healthy subjects, cited in Atkinson 2021 (or ISO-aligned study)
 * - reference: published in Atkinson 2021 but method caveats (e.g. T2 subjects, SEM)
 * - unavailable: no trustworthy published match for this query
 *
 * Citation: Atkinson FS, Brand-Miller JC, Foster-Powell K, Buyken AE, Goletzke J.
 * International tables of glycemic index and glycemic load values 2021.
 * Am J Clin Nutr. 2021;114(4):1625-1632. Supplemental tables.
 */

const SOURCE =
  "Atkinson et al. 2021 International tables of GI/GL values";

/** @type {Array<{ keys: string[], gi: number, status: 'verified'|'reference', label: string, note: string, citation: string }>} */
const GI_ENTRIES = [
  {
    keys: ["chapatti", "chapati", "whole wheat chapati", "whole wheat chapatti"],
    gi: 54,
    status: "verified",
    label: "Whole wheat chapatti",
    note: "Unleavened whole wheat flatbread (UK, healthy subjects).",
    citation: `${SOURCE}, item #2194`,
  },
  {
    keys: ["roti", "wheat roti", "phulka"],
    gi: 59,
    status: "reference",
    label: "Roti / chapatti",
    note: "Roti/chapatti (Fiji). Wheat chapatti values commonly range ~54–69.",
    citation: `${SOURCE}, item #2252 (also #2194 chapatti GI 54)`,
  },
  {
    keys: ["idli"],
    gi: 60,
    status: "verified",
    label: "Idli (rice + black gram, steamed)",
    note: "Served with chutney; healthy subjects. Brown idli + sambar reported GI 48.",
    citation: `${SOURCE}, item #3863 (also #3862 GI 48)`,
  },
  {
    keys: ["dosa", "dosai", "masala dosa", "plain dosa"],
    gi: 55,
    status: "verified",
    label: "Dosa (rice + black gram)",
    note: "Rice and black gram dosa; healthy subjects. Values vary with millet blends and accompaniments.",
    citation: `${SOURCE}, item #3856 (also #3858 GI 55±2)`,
  },
  {
    keys: ["dhokla"],
    gi: 35,
    status: "verified",
    label: "Dhokla (chickpea + semolina, steamed)",
    note: "Fermented steamed cake; healthy subjects.",
    citation: `${SOURCE}, item #3850`,
  },
  {
    keys: ["poha", "rice flakes"],
    gi: 43,
    status: "verified",
    label: "Poha (rice flakes)",
    note: "Rice flakes with ground nuts; healthy subjects.",
    citation: `${SOURCE}, item #3877`,
  },
  {
    keys: ["pongal"],
    gi: 45,
    status: "verified",
    label: "Pongal (rice + green gram)",
    note: "Pressure-cooked rice and roasted green gram; healthy subjects.",
    citation: `${SOURCE}, item #3878`,
  },
  {
    keys: ["poori", "puri"],
    gi: 57,
    status: "verified",
    label: "Poori with potato palya",
    note: "Deep-fried wheat dough with mashed potato; healthy subjects.",
    citation: `${SOURCE}, item #3880`,
  },
  {
    keys: ["basmati", "basmati rice"],
    gi: 52,
    status: "verified",
    label: "Basmati rice, white, boiled",
    note: "Boiled ~12 min (UK). Cooking method and variety change GI substantially.",
    citation: `${SOURCE}, item #2609`,
  },
  {
    keys: ["white rice", "boiled rice", "steamed rice", "rice"],
    gi: 73,
    status: "verified",
    label: "White rice, boiled",
    note: "India study (boiled with salt). Category mean white rice ≈73 in Atkinson 2021.",
    citation: `${SOURCE}, item #2646; category mean white rice ≈73`,
  },
  {
    keys: ["brown rice"],
    gi: 65,
    status: "reference",
    label: "Brown rice (category average)",
    note: "Category average for brown rice in Atkinson 2021 (~65); variety-dependent.",
    citation: `${SOURCE}, rice category summary`,
  },
  {
    keys: ["dal", "dhal", "lentil", "lentils", "masoor", "red lentil"],
    gi: 29,
    status: "verified",
    label: "Lentils, boiled",
    note: "Boiled lentils; healthy subjects. Legumes are typically low-GI.",
    citation: `${SOURCE}, item #3135`,
  },
  {
    keys: ["chana dal", "bengal gram", "bengal gram dhal", "chickpea dal"],
    gi: 11,
    status: "reference",
    label: "Bengal gram dhal, boiled",
    note: "India 1981; listed with method caveats in supplemental tables.",
    citation: `${SOURCE}, item #3111`,
  },
  {
    keys: ["rajma", "rajmah", "kidney bean", "kidney beans"],
    gi: 19,
    status: "reference",
    label: "Rajmah (kidney beans), boiled",
    note: "India 1981; listed with method caveats in supplemental tables.",
    citation: `${SOURCE}, item #3891`,
  },
  {
    keys: ["chickpea", "chickpeas", "chole", "chana"],
    gi: 28,
    status: "reference",
    label: "Chickpeas / Bengal gram (legume category)",
    note: "Legumes average low GI; use boiled chickpea/Bengal gram entries as guide.",
    citation: `${SOURCE}, chickpea/Bengal gram section (e.g. #3111)`,
  },
  {
    keys: ["bajra", "pearl millet"],
    gi: 55,
    status: "reference",
    label: "Bajra roasted bread",
    note: "Roasted bajra flour bread; SEM wide (±13).",
    citation: `${SOURCE}, item #3824`,
  },
  {
    keys: ["jowar", "sorghum"],
    gi: 77,
    status: "reference",
    label: "Sorghum roti (literature)",
    note: "Atkinson 2008/related sorghum roti reports ~77; preparation-sensitive.",
    citation: `${SOURCE} / Atkinson 2008 sorghum roti reports`,
  },
  {
    keys: ["upma", "broken wheat upma"],
    gi: 40,
    status: "reference",
    label: "Broken wheat upma (category)",
    note: "Broken wheat + green gram preparations appear low–medium GI in Indian studies.",
    citation: `${SOURCE}, item #3828 region; Shobana et al. ICMR-aligned Indian GI work`,
  },
  {
    keys: ["apple"],
    gi: 36,
    status: "verified",
    label: "Apple",
    note: "Typical fresh apple values cluster low-GI in international tables.",
    citation: `${SOURCE}, fruit category (apple entries)`,
  },
  {
    keys: ["milk", "cow milk"],
    gi: 31,
    status: "verified",
    label: "Milk",
    note: "Dairy foods are usually low-GI.",
    citation: `${SOURCE}, dairy category`,
  },
  {
    keys: ["yogurt", "curd", "dahi"],
    gi: 27,
    status: "verified",
    label: "Yogurt / curd",
    note: "Plain yogurt typically low-GI.",
    citation: `${SOURCE}, dairy category`,
  },
];

// Prefer longer key matches first
const SORTED_ENTRIES = [...GI_ENTRIES].sort(
  (a, b) =>
    Math.max(...b.keys.map((k) => k.length)) -
    Math.max(...a.keys.map((k) => k.length))
);

/**
 * Look up a published GI for a food name. Returns unavailable rather than guessing.
 * @param {string} foodName
 */
function lookupGlycemicIndex(foodName) {
  const query = (foodName || "").toLowerCase().trim();
  if (!query) {
    return {
      gi: null,
      status: "unavailable",
      label: null,
      note: "No food name provided for GI lookup.",
      citation: null,
      matchedKey: null,
    };
  }

  // Protein-only foods have no meaningful GI
  const proteinOnly = [
    "chicken",
    "egg",
    "fish",
    "mutton",
    "lamb",
    "beef",
    "paneer",
    "tofu",
    "shrimp",
    "prawn",
  ];
  if (proteinOnly.some((p) => query === p || query.startsWith(`${p} `) || query.endsWith(` ${p}`))) {
    // Allow compounds like "butter chicken" / "egg curry" that contain carbs via gravy/sides
    const likelyCarbDish = /\b(curry|biryani|fried|butter|masala|rice|roti|naan|gravy)\b/.test(query);
    if (!likelyCarbDish) {
      return {
        gi: null,
        status: "unavailable",
        label: null,
        note: "GI applies to carbohydrate-containing foods; this item is primarily protein/fat.",
        citation: null,
        matchedKey: null,
      };
    }
  }

  for (const entry of SORTED_ENTRIES) {
    for (const key of entry.keys) {
      if (query === key || query.includes(key)) {
        return {
          gi: entry.gi,
          status: entry.status,
          label: entry.label,
          note: entry.note,
          citation: entry.citation,
          matchedKey: key,
        };
      }
    }
  }

  return {
    gi: null,
    status: "unavailable",
    label: null,
    note: "No published GI match in our verified table for this dish. GI varies with recipe and cooking method.",
    citation: null,
    matchedKey: null,
  };
}

function classifyGi(gi) {
  if (gi == null) return null;
  if (gi <= 55) return "Low";
  if (gi <= 69) return "Medium";
  return "High";
}

module.exports = {
  lookupGlycemicIndex,
  classifyGi,
  SOURCE,
};
