/**
 * Regional Indian staple variants.
 *
 * Base macros should still come from IFCT/INDB via searchQuery when possible.
 * portionGrams + fat presets encode typical household differences across regions
 * (e.g. dry Punjabi phulka vs deep-fried Bengali luchi).
 *
 * Labels are "typical household estimates" — not lab measurements of every home.
 */

export const REGION_OPTIONS = [
  { id: "all", label: "All India", short: "India" },
  { id: "punjab", label: "Punjab", short: "Punjab", cuisineSlug: "punjab" },
  { id: "bengal", label: "Kolkata / Bengal", short: "Bengal", cuisineSlug: "west-bengal" },
  { id: "maharashtra", label: "Maharashtra", short: "MH", cuisineSlug: "maharashtra" },
  { id: "rajasthan", label: "Rajasthan", short: "RJ", cuisineSlug: "rajasthan" },
  { id: "gujarat", label: "Gujarat", short: "GJ", cuisineSlug: "gujarat" },
  { id: "tamil-nadu", label: "Tamil Nadu", short: "TN", cuisineSlug: "tamil-nadu" },
  { id: "kerala", label: "Kerala", short: "KL", cuisineSlug: "kerala" },
  { id: "odisha", label: "Odisha", short: "OD", cuisineSlug: "odisha" },
  { id: "assam", label: "Assam", short: "AS", cuisineSlug: "assam" },
];

export const STAPLE_FAMILIES = [
  {
    id: "roti",
    label: "Roti & breads",
    blurb: "Phulka, luchi, bhakri, thepla — same idea, different kitchens",
    keywords: [
      "roti",
      "chapati",
      "chapatti",
      "phulka",
      "paratha",
      "parantha",
      "luchi",
      "bhakri",
      "thepla",
      "roomali",
      "naan",
    ],
  },
  {
    id: "rice",
    label: "Rice",
    blurb: "How a plate of rice is usually served across India",
    keywords: ["rice", "chawal", "bhat", "bhaat", "pulao", "biryani"],
  },
  {
    id: "dal",
    label: "Dal",
    blurb: "From tadka dal to sambar and dalma",
    keywords: ["dal", "dhal", "sambar", "sambhar", "dalma", "rajma", "chole"],
  },
  {
    id: "breakfast",
    label: "Breakfast",
    blurb: "Idli, dosa, poha, paratha mornings",
    keywords: ["idli", "dosa", "poha", "upma", "paratha", "parantha", "puri", "poori"],
  },
];

/**
 * fallbackPer100: IFCT/INDB-aligned approximate cooked/ingredient values used
 * when live search is unavailable (compare page offline fallback).
 */
export const REGIONAL_VARIANTS = [
  // ——— ROTI ———
  {
    id: "punjab-phulka",
    family: "roti",
    regionId: "punjab",
    localName: "Phulka / tawa roti",
    searchQuery: "roti",
    portionGrams: 40,
    fatId: "ghee",
    fatAmountId: "0.5",
    cookingNote:
      "Soft whole-wheat roti, often dry or with a light smear of ghee after cooking.",
    fallbackPer100: { calories: 297, protein: 11, carbs: 46, fat: 7.5 },
    sourceNote: "Wheat roti base (IFCT-aligned) + ½ tsp ghee typical finish",
  },
  {
    id: "bengal-luchi",
    family: "roti",
    regionId: "bengal",
    localName: "Luchi",
    searchQuery: "luchi",
    portionGrams: 35,
    fatId: "mustard",
    fatAmountId: "1tbsp",
    cookingNote:
      "Deep-fried refined-flour bread common in Kolkata homes and festive meals — fat is the big calorie driver.",
    fallbackPer100: { calories: 330, protein: 6, carbs: 40, fat: 16 },
    sourceNote: "Fried bread base + ~1 tbsp oil absorbed (household estimate)",
  },
  {
    id: "bengal-ruti",
    family: "roti",
    regionId: "bengal",
    localName: "Ruti (tawa)",
    searchQuery: "roti",
    portionGrams: 40,
    fatId: "mustard",
    fatAmountId: "0.5",
    cookingNote: "Plain tawa ruti; mustard oil sometimes brushed lightly.",
    fallbackPer100: { calories: 297, protein: 11, carbs: 46, fat: 7.5 },
    sourceNote: "Wheat roti base + ½ tsp mustard oil",
  },
  {
    id: "maharashtra-bhakri",
    family: "roti",
    regionId: "maharashtra",
    localName: "Bhakri (jowar/bajra)",
    searchQuery: "bhakri",
    portionGrams: 55,
    fatId: "none",
    fatAmountId: "0",
    cookingNote: "Millet flatbread, usually dry on tawa — denser portion than phulka.",
    fallbackPer100: { calories: 280, protein: 8, carbs: 55, fat: 3 },
    sourceNote: "Millet bread estimate; confirm with IFCT millet roti when matched",
  },
  {
    id: "rajasthan-bajra",
    family: "roti",
    regionId: "rajasthan",
    localName: "Bajra roti",
    searchQuery: "bajra",
    portionGrams: 50,
    fatId: "ghee",
    fatAmountId: "1",
    cookingNote: "Pearl-millet roti, often eaten with ghee — especially in winter.",
    fallbackPer100: { calories: 286, protein: 8, carbs: 54, fat: 4 },
    sourceNote: "Bajra roti base + 1 tsp ghee",
  },
  {
    id: "gujarat-thepla",
    family: "roti",
    regionId: "gujarat",
    localName: "Thepla",
    searchQuery: "thepla",
    portionGrams: 45,
    fatId: "groundnut",
    fatAmountId: "1",
    cookingNote: "Spiced methi flatbread; oil in dough and on tawa.",
    fallbackPer100: { calories: 310, protein: 8, carbs: 42, fat: 12 },
    sourceNote: "Thepla-style base + 1 tsp oil for the serving",
  },
  {
    id: "punjab-paratha",
    family: "roti",
    regionId: "punjab",
    localName: "Paratha",
    searchQuery: "paratha",
    portionGrams: 80,
    fatId: "ghee",
    fatAmountId: "2",
    cookingNote: "Layered / stuffed breakfast bread — ghee on tawa adds most calories.",
    fallbackPer100: { calories: 320, protein: 7, carbs: 40, fat: 14 },
    sourceNote: "Paratha base + ~2 tsp ghee",
  },

  // ——— RICE ———
  {
    id: "punjab-chawal",
    family: "rice",
    regionId: "punjab",
    localName: "Jeera / plain chawal",
    searchQuery: "rice",
    portionGrams: 180,
    fatId: "ghee",
    fatAmountId: "0.5",
    cookingNote: "One cup steamed rice; ghee optional on top in many homes.",
    fallbackPer100: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    sourceNote: "Cooked white rice (IFCT-aligned) + ½ tsp ghee",
  },
  {
    id: "bengal-bhat",
    family: "rice",
    regionId: "bengal",
    localName: "Bhaat",
    searchQuery: "rice",
    portionGrams: 200,
    fatId: "none",
    fatAmountId: "0",
    cookingNote: "Larger plain rice serving with fish/dal — usually no oil on the rice itself.",
    fallbackPer100: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    sourceNote: "Cooked white rice, ~200 g plate",
  },
  {
    id: "tamil-sadam",
    family: "rice",
    regionId: "tamil-nadu",
    localName: "Sadam",
    searchQuery: "rice",
    portionGrams: 180,
    fatId: "none",
    fatAmountId: "0",
    cookingNote: "Steamed rice for sambar/rasam meals; fat comes from the curry, not the rice.",
    fallbackPer100: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    sourceNote: "Cooked white rice base",
  },
  {
    id: "kerala-matta",
    family: "rice",
    regionId: "kerala",
    localName: "Matta / boiled rice",
    searchQuery: "rice",
    portionGrams: 180,
    fatId: "coconut",
    fatAmountId: "0.5",
    cookingNote: "Often paired with coconut-based sides; small oil/coconut fat on plate.",
    fallbackPer100: { calories: 120, protein: 2.5, carbs: 26, fat: 0.4 },
    sourceNote: "Parboiled/matta-style rice estimate + ½ tsp coconut oil",
  },
  {
    id: "assam-bhat",
    family: "rice",
    regionId: "assam",
    localName: "Bhaat",
    searchQuery: "rice",
    portionGrams: 200,
    fatId: "mustard",
    fatAmountId: "0",
    cookingNote: "Rice-forward Assamese plate; mustard oil usually in the accompanying curry.",
    fallbackPer100: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    sourceNote: "Cooked white rice, ~200 g",
  },
  {
    id: "odisha-pakhala-base",
    family: "rice",
    regionId: "odisha",
    localName: "Rice (pakhala base)",
    searchQuery: "rice",
    portionGrams: 200,
    fatId: "none",
    fatAmountId: "0",
    cookingNote: "Fermented/water rice meals start from plain cooked rice — very light on added fat.",
    fallbackPer100: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    sourceNote: "Cooked rice base for pakhala-style meals",
  },

  // ——— DAL ———
  {
    id: "punjab-dal-tadka",
    family: "dal",
    regionId: "punjab",
    localName: "Dal tadka / dal fry",
    searchQuery: "dal",
    portionGrams: 150,
    fatId: "ghee",
    fatAmountId: "1",
    cookingNote: "One katori; tadka in ghee is common and raises calories fast.",
    fallbackPer100: { calories: 116, protein: 7, carbs: 16, fat: 1.5 },
    sourceNote: "Cooked dal base + 1 tsp ghee tadka",
  },
  {
    id: "bengal-musur-dal",
    family: "dal",
    regionId: "bengal",
    localName: "Musur dal",
    searchQuery: "dal",
    portionGrams: 150,
    fatId: "mustard",
    fatAmountId: "1",
    cookingNote: "Thin masoor dal with mustard-oil phoron (tempering).",
    fallbackPer100: { calories: 110, protein: 7, carbs: 15, fat: 1.2 },
    sourceNote: "Cooked masoor-style dal + 1 tsp mustard oil",
  },
  {
    id: "tamil-sambar",
    family: "dal",
    regionId: "tamil-nadu",
    localName: "Sambar",
    searchQuery: "sambar",
    portionGrams: 180,
    fatId: "sunflower",
    fatAmountId: "0.5",
    cookingNote: "Larger ladle with vegetables; oil mostly in tempering.",
    fallbackPer100: { calories: 75, protein: 3.5, carbs: 12, fat: 2 },
    sourceNote: "Sambar-style stew + ½ tsp tempering oil",
  },
  {
    id: "gujarat-dal",
    family: "dal",
    regionId: "gujarat",
    localName: "Gujarati dal",
    searchQuery: "dal",
    portionGrams: 150,
    fatId: "groundnut",
    fatAmountId: "0.5",
    cookingNote: "Slightly sweet-sour dal; moderate oil in tempering.",
    fallbackPer100: { calories: 120, protein: 6, carbs: 18, fat: 2 },
    sourceNote: "Cooked dal + ½ tsp groundnut oil",
  },
  {
    id: "odisha-dalma",
    family: "dal",
    regionId: "odisha",
    localName: "Dalma",
    searchQuery: "dal",
    portionGrams: 160,
    fatId: "mustard",
    fatAmountId: "0.5",
    cookingNote: "Dal cooked with vegetables; mustard tempering.",
    fallbackPer100: { calories: 95, protein: 5, carbs: 14, fat: 2 },
    sourceNote: "Dalma-style dal-veg + ½ tsp mustard oil",
  },
  {
    id: "rajasthan-dal",
    family: "dal",
    regionId: "rajasthan",
    localName: "Panchmel / dal",
    searchQuery: "dal",
    portionGrams: 150,
    fatId: "ghee",
    fatAmountId: "1",
    cookingNote: "Often richer ghee tadka with bajra roti meals.",
    fallbackPer100: { calories: 116, protein: 7, carbs: 16, fat: 1.5 },
    sourceNote: "Cooked dal + 1 tsp ghee",
  },

  // ——— BREAKFAST ———
  {
    id: "tamil-idli",
    family: "breakfast",
    regionId: "tamil-nadu",
    localName: "Idli (2 pcs)",
    searchQuery: "idli",
    portionGrams: 80,
    fatId: "none",
    fatAmountId: "0",
    cookingNote: "Steamed — very little added fat unless chutney/sambar oil is counted separately.",
    fallbackPer100: { calories: 110, protein: 3.5, carbs: 22, fat: 0.5 },
    sourceNote: "Idli IFCT/INDB-aligned, 2-piece serving",
  },
  {
    id: "tamil-dosa",
    family: "breakfast",
    regionId: "tamil-nadu",
    localName: "Plain dosa",
    searchQuery: "dosa",
    portionGrams: 100,
    fatId: "sunflower",
    fatAmountId: "1",
    cookingNote: "Tawa crepe; oil on the pan is the main add-on.",
    fallbackPer100: { calories: 170, protein: 4, carbs: 28, fat: 5 },
    sourceNote: "Dosa base + 1 tsp tawa oil",
  },
  {
    id: "maharashtra-poha",
    family: "breakfast",
    regionId: "maharashtra",
    localName: "Kanda poha",
    searchQuery: "poha",
    portionGrams: 150,
    fatId: "groundnut",
    fatAmountId: "1",
    cookingNote: "Flattened rice tempered with oil, peanuts, onion.",
    fallbackPer100: { calories: 150, protein: 3, carbs: 28, fat: 4 },
    sourceNote: "Poha base + 1 tsp oil",
  },
  {
    id: "punjab-paratha-bf",
    family: "breakfast",
    regionId: "punjab",
    localName: "Aloo paratha",
    searchQuery: "paratha",
    portionGrams: 120,
    fatId: "ghee",
    fatAmountId: "1tbsp",
    cookingNote: "Stuffed paratha with generous ghee — one of the densest North Indian breakfasts.",
    fallbackPer100: { calories: 260, protein: 6, carbs: 35, fat: 11 },
    sourceNote: "Stuffed paratha estimate + 1 tbsp ghee",
  },
  {
    id: "gujarat-thepla-bf",
    family: "breakfast",
    regionId: "gujarat",
    localName: "Thepla + chutney plate",
    searchQuery: "thepla",
    portionGrams: 90,
    fatId: "groundnut",
    fatAmountId: "2",
    cookingNote: "Travel/breakfast staple; oil in dough + tawa.",
    fallbackPer100: { calories: 310, protein: 8, carbs: 42, fat: 12 },
    sourceNote: "Thepla base + ~2 tsp oil",
  },
  {
    id: "kerala-appam",
    family: "breakfast",
    regionId: "kerala",
    localName: "Appam",
    searchQuery: "appam",
    portionGrams: 90,
    fatId: "coconut",
    fatAmountId: "0.5",
    cookingNote: "Fermented rice hopper; light oil in the pan.",
    fallbackPer100: { calories: 140, protein: 2.5, carbs: 28, fat: 2 },
    sourceNote: "Appam estimate + ½ tsp coconut oil",
  },
  {
    id: "bengal-puri-bf",
    family: "breakfast",
    regionId: "bengal",
    localName: "Luchi / puri breakfast",
    searchQuery: "poori",
    portionGrams: 70,
    fatId: "mustard",
    fatAmountId: "1tbsp",
    cookingNote: "Fried bread breakfast — count absorbed oil, not just flour.",
    fallbackPer100: { calories: 330, protein: 6, carbs: 40, fat: 16 },
    sourceNote: "Puri/luchi + ~1 tbsp frying fat",
  },
];

export function getRegion(regionId) {
  return REGION_OPTIONS.find((r) => r.id === regionId);
}

export function getFamily(familyId) {
  return STAPLE_FAMILIES.find((f) => f.id === familyId);
}

export function getVariantsByFamily(familyId) {
  return REGIONAL_VARIANTS.filter((v) => v.family === familyId);
}

export function getVariantsByRegion(regionId) {
  return REGIONAL_VARIANTS.filter((v) => v.regionId === regionId);
}

/** Detect staple family from search query + food name. */
export function detectStapleFamily(query = "", foodName = "") {
  const text = `${query} ${foodName}`.toLowerCase();
  for (const family of STAPLE_FAMILIES) {
    if (family.keywords.some((k) => text.includes(k))) return family;
  }
  return null;
}

/** Variants relevant to current search, optionally filtered by region. */
export function getMatchingVariants(query = "", foodName = "", regionId = "all") {
  const family = detectStapleFamily(query, foodName);
  if (!family) return { family: null, variants: [] };
  let variants = getVariantsByFamily(family.id);
  if (regionId && regionId !== "all") {
    variants = variants.filter((v) => v.regionId === regionId);
  }
  return { family, variants };
}

/** Regions that have at least one variant in this family. */
export function getRegionsForFamily(familyId) {
  const ids = new Set(
    getVariantsByFamily(familyId).map((v) => v.regionId)
  );
  return REGION_OPTIONS.filter((r) => r.id === "all" || ids.has(r.id));
}

export function customizeStateFromVariant(variant, { open = true } = {}) {
  return {
    portionPresetId: "custom",
    customGrams: variant.portionGrams,
    fatId: variant.fatId || "none",
    fatAmountId: variant.fatId === "none" ? "0" : variant.fatAmountId || "0",
    open,
  };
}

/**
 * Estimate plate calories using fallbackPer100 + fat presets
 * (used on compare page before/without live API).
 */
export function estimateVariantFromFallback(variant) {
  const per100 = variant.fallbackPer100 || {
    calories: 150,
    protein: 5,
    carbs: 20,
    fat: 3,
  };
  const food = {
    serving_size_g: 100,
    calories: per100.calories,
    protein_g: per100.protein,
    carbohydrates_total_g: per100.carbs,
    fat_total_g: per100.fat,
  };
  return {
    food,
    customize: customizeStateFromVariant(variant),
  };
}
