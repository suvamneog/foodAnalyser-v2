/**
 * Indian household portion + cooking-fat customization.
 * Base macros stay from IFCT/INDB; oil calories are added on top using
 * standard energy density (~9 kcal/g). Teaspoon/tablespoon masses follow
 * common nutrition references (1 tsp oil ≈ 5 g, 1 tbsp ≈ 15 g).
 */

export const COOKING_FATS = [
  {
    id: "none",
    label: "No extra fat",
    kcalPerTsp: 0,
    note: "Use when dish is steamed/boiled with no added oil",
  },
  {
    id: "mustard",
    label: "Mustard oil",
    kcalPerTsp: 40,
    note: "~40 kcal per tsp (≈5 g)",
  },
  {
    id: "sunflower",
    label: "Sunflower / refined oil",
    kcalPerTsp: 40,
    note: "~40 kcal per tsp",
  },
  {
    id: "groundnut",
    label: "Groundnut oil",
    kcalPerTsp: 40,
    note: "~40 kcal per tsp",
  },
  {
    id: "coconut",
    label: "Coconut oil",
    kcalPerTsp: 40,
    note: "~40 kcal per tsp",
  },
  {
    id: "olive",
    label: "Olive oil",
    kcalPerTsp: 40,
    note: "~40 kcal per tsp",
  },
  {
    id: "ghee",
    label: "Ghee",
    kcalPerTsp: 45,
    note: "~45 kcal per tsp (denser than oil)",
  },
  {
    id: "butter",
    label: "Butter",
    kcalPerTsp: 34,
    note: "~34 kcal per tsp",
  },
];

/** Common Indian serving shortcuts (edible cooked weight estimates). */
export const PORTION_PRESETS = [
  { id: "db", label: "Database serving", grams: null },
  { id: "50", label: "50 g", grams: 50 },
  { id: "100", label: "100 g", grams: 100 },
  { id: "half_katori", label: "½ katori (~75 g)", grams: 75 },
  { id: "katori", label: "1 katori (~150 g)", grams: 150 },
  { id: "cup", label: "1 cup (~180 g)", grams: 180 },
  { id: "roti", label: "1 roti (~40 g)", grams: 40 },
  { id: "custom", label: "Custom grams", grams: "custom" },
];

export const FAT_AMOUNT_PRESETS = [
  { id: "0", label: "None", tsp: 0 },
  { id: "0.5", label: "½ tsp", tsp: 0.5 },
  { id: "1", label: "1 tsp", tsp: 1 },
  { id: "2", label: "2 tsp", tsp: 2 },
  { id: "1tbsp", label: "1 tbsp", tsp: 3 },
  { id: "2tbsp", label: "2 tbsp", tsp: 6 },
];

export const defaultCustomizeState = (baseServingG = 100, preferredGrams = null) => ({
  portionPresetId: preferredGrams ? "custom" : "db",
  customGrams: preferredGrams || baseServingG || 100,
  fatId: "none",
  fatAmountId: "0",
  open: false,
});

export function getCookingFat(fatId) {
  return COOKING_FATS.find((f) => f.id === fatId) || COOKING_FATS[0];
}

export function getFatTsp(fatAmountId) {
  const preset = FAT_AMOUNT_PRESETS.find((f) => f.id === fatAmountId);
  return preset ? preset.tsp : 0;
}

export function resolvePortionGrams(state, baseServingG = 100) {
  const preset = PORTION_PRESETS.find((p) => p.id === state.portionPresetId);
  if (!preset || preset.grams === null) return Number(baseServingG) || 100;
  if (preset.grams === "custom") {
    const g = Number(state.customGrams);
    return Number.isFinite(g) && g > 0 ? Math.min(2000, g) : 100;
  }
  return preset.grams;
}

/**
 * Scale IFCT/INDB serving nutrition to chosen portion, then add cooking fat.
 * @param {object} food - API food item (calories etc. for serving_size_g)
 * @param {object} state - customize state
 */
export function computeCustomNutrition(food, state) {
  const baseServing = Number(food?.serving_size_g) || 100;
  const portionGrams = resolvePortionGrams(state, baseServing);
  const factor = portionGrams / baseServing;

  const scale = (v) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return n * factor;
  };

  const foodCalories = scale(food?.calories);
  const foodProtein = scale(food?.protein_g);
  const foodCarbs = scale(food?.carbohydrates_total_g ?? food?.carbs_g);
  const foodFat = scale(food?.fat_total_g ?? food?.fat_g);
  const foodFiber = scale(food?.fiber_g);
  const foodSugar = scale(food?.sugar_g);
  const foodSatFat = scale(food?.fat_saturated_g);
  const foodSodium = scale(food?.sodium_mg);
  const foodCholesterol = scale(food?.cholesterol_mg);
  const foodCalcium = scale(food?.calcium_mg);
  const foodIron = scale(food?.iron_mg);
  const foodVitC = scale(food?.vitamin_c_mg);
  const foodPotassium = scale(food?.potassium_mg);
  const foodZinc = scale(food?.zinc_mg);

  const fat = getCookingFat(state.fatId);
  const tsp = state.fatId === "none" ? 0 : getFatTsp(state.fatAmountId);
  const oilCalories = fat.kcalPerTsp * tsp;
  // Approximate oil mass: 5 g per tsp; fat grams ≈ oilCalories / 9
  const oilFatGrams = oilCalories > 0 ? oilCalories / 9 : 0;

  const calories =
    foodCalories == null
      ? oilCalories > 0
        ? oilCalories
        : null
      : foodCalories + oilCalories;
  const fatTotal =
    foodFat == null
      ? oilFatGrams > 0
        ? oilFatGrams
        : null
      : foodFat + oilFatGrams;

  return {
    portionGrams,
    baseServing,
    factor,
    foodCalories,
    oilCalories,
    oilFatGrams,
    oilLabel: fat.id === "none" || tsp === 0 ? null : `${fat.label} · ${tsp} tsp`,
    calories,
    protein_g: foodProtein,
    carbohydrates_total_g: foodCarbs,
    fat_total_g: fatTotal,
    fiber_g: foodFiber,
    sugar_g: foodSugar,
    fat_saturated_g: foodSatFat,
    sodium_mg: foodSodium,
    cholesterol_mg: foodCholesterol,
    calcium_mg: foodCalcium,
    iron_mg: foodIron,
    vitamin_c_mg: foodVitC,
    potassium_mg: foodPotassium,
    zinc_mg: foodZinc,
    disclaimer:
      "Base macros from the food database. Extra oil/ghee is added using standard kcal per teaspoon — household recipes still vary.",
  };
}
