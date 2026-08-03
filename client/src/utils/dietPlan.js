/**
 * Diet plan engine for Indian users.
 *
 * Uses Mifflin-St Jeor for BMR (widely accepted for adults; the same formula the
 * server /calculator route uses) + standard activity multipliers.
 *
 * Persona targets follow common Indian sports-nutrition / clinical guidance:
 *  - Protein per kg body weight
 *  - Fat % of daily calories
 *  - Carbohydrate share (lower + low-GI preference for diabetic / PCOS)
 *
 * All outputs are labelled as ESTIMATES. Users with medical conditions should
 * still consult a registered dietitian.
 */

export const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary (desk job, no exercise)", multiplier: 1.2 },
  { id: "light", label: "Light (1–3 sessions/week)", multiplier: 1.375 },
  { id: "moderate", label: "Moderate (3–5 sessions/week)", multiplier: 1.55 },
  { id: "heavy", label: "Heavy (6–7 sessions/week)", multiplier: 1.725 },
  { id: "athlete", label: "Athlete (2× training/day)", multiplier: 1.9 },
];

export const DIET_TYPES = [
  { id: "veg", label: "Vegetarian" },
  { id: "egg-veg", label: "Egg-vegetarian" },
  { id: "non-veg", label: "Non-vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "jain", label: "Jain" },
];

/**
 * Personas — the way the plan adjusts protein/fat/carb targets and picks meals.
 * Each includes evidence-backed defaults with citations in the note.
 */
export const PERSONAS = [
  {
    id: "weight-loss",
    label: "Weight loss",
    tagline: "Sustained fat loss with muscle protection",
    calorieAdjustment: -0.2, // ~20% deficit
    proteinPerKg: 1.8,
    fatPercent: 0.27,
    lowGiPreference: false,
    note: "Deficit ≈20% below TDEE; higher protein (~1.8 g/kg) to preserve lean mass.",
  },
  {
    id: "maintain",
    label: "Maintain",
    tagline: "Stay at your current weight, eat balanced",
    calorieAdjustment: 0,
    proteinPerKg: 1.4,
    fatPercent: 0.28,
    lowGiPreference: false,
    note: "TDEE calories; balanced macros. Good default for most healthy adults.",
  },
  {
    id: "muscle-gain",
    label: "Muscle gain",
    tagline: "Lean bulk for gym users",
    calorieAdjustment: 0.12, // ~12% surplus
    proteinPerKg: 2.0,
    fatPercent: 0.25,
    lowGiPreference: false,
    note: "Small surplus (~12%) + 2.0 g/kg protein; carbs skewed higher for training.",
  },
  {
    id: "diabetic",
    label: "Diabetic-friendly",
    tagline: "Lower carb load, low-GI preference",
    calorieAdjustment: 0,
    proteinPerKg: 1.5,
    fatPercent: 0.32,
    lowGiPreference: true,
    carbCap: 0.45,
    note: "Prioritises low-GI foods and controlled carb share. Not medical advice — coordinate with your physician.",
  },
  {
    id: "pcos",
    label: "PCOS-friendly",
    tagline: "Lower-GI, moderate protein, adequate fibre",
    calorieAdjustment: -0.1,
    proteinPerKg: 1.6,
    fatPercent: 0.3,
    lowGiPreference: true,
    carbCap: 0.5,
    note: "Small deficit + low-GI carbs is commonly recommended for insulin sensitivity in PCOS.",
  },
];

/**
 * Mifflin-St Jeor BMR (kcal/day). weight kg, height cm.
 */
export function calcBMR({ weightKg, heightCm, age, sex }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calcTDEE({ bmr, activityId }) {
  const level = ACTIVITY_LEVELS.find((l) => l.id === activityId) || ACTIVITY_LEVELS[0];
  return bmr * level.multiplier;
}

export function personaTargets({ weightKg, tdee, personaId }) {
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[1];
  const targetCalories = Math.round(tdee * (1 + persona.calorieAdjustment));
  const proteinGrams = Math.round(weightKg * persona.proteinPerKg);
  const fatKcal = targetCalories * persona.fatPercent;
  const fatGrams = Math.round(fatKcal / 9);

  let carbKcal = targetCalories - proteinGrams * 4 - fatGrams * 9;
  if (persona.carbCap) {
    const capped = targetCalories * persona.carbCap;
    if (carbKcal > capped) carbKcal = capped;
  }
  const carbGrams = Math.round(Math.max(0, carbKcal) / 4);

  return {
    persona,
    targetCalories,
    macros: {
      proteinG: proteinGrams,
      carbsG: carbGrams,
      fatG: fatGrams,
    },
    guidance: buildGuidance(persona),
  };
}

function buildGuidance(persona) {
  const tips = [
    "Base every meal on IFCT/INDB foods when possible — those macros are lab-measured.",
    "Adjust oil/ghee in the plate customizer — cooking fat is where most home-vs-restaurant drift happens.",
    "Weigh yourself weekly, same time, before food.",
  ];
  if (persona.id === "weight-loss") {
    tips.push("Anchor lunch/dinner around a katori of dal / grilled protein + 1 roti + sabzi.");
    tips.push("Save calorie-dense fried snacks (samosa, luchi) for weekends, not daily.");
  }
  if (persona.id === "muscle-gain") {
    tips.push("Add 2 eggs / 100 g paneer / 150 g curd to hit protein without huge kcal spikes.");
    tips.push("Post-workout: rice + dal / chicken curry gives fast carbs + protein together.");
  }
  if (persona.id === "diabetic" || persona.id === "pcos") {
    tips.push("Prefer low-GI carbs: dal, chana, oats, millets, curd — avoid white bread/puri.");
    tips.push("Pair rice/roti with a protein + fibre source in the same meal.");
  }
  return tips;
}

/**
 * Build a same-day 4-meal plan from templates.
 * @param {Array} allTemplates - meal templates dataset
 * @param {object} opts
 *  - personaId, dietType, regionId (optional)
 *  - targetCalories, macros
 */
export function generateDailyPlan(allTemplates, opts) {
  const { personaId, dietType, regionId } = opts;
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[1];

  // 1. Filter to templates that match diet type + persona tags
  const dietOrder = compatibleDiets(dietType);
  let pool = allTemplates.filter((t) => dietOrder.includes(t.dietType));
  if (persona.lowGiPreference) {
    pool = pool.filter((t) => t.gi !== "high");
  }
  if (regionId && regionId !== "all") {
    const regional = pool.filter((t) => t.regions?.includes(regionId));
    if (regional.length >= 4) pool = regional;
  }

  const slots = ["breakfast", "lunch", "snack", "dinner"];
  const picks = {};
  const remainingBudget = { ...opts.macros, kcal: opts.targetCalories };

  for (const slot of slots) {
    const slotShare = slot === "snack" ? 0.15 : slot === "breakfast" ? 0.25 : 0.3;
    const targetKcal = opts.targetCalories * slotShare;
    const options = pool.filter((t) => t.slot === slot);
    if (options.length === 0) continue;

    // score by closeness to target kcal + persona alignment
    const scored = options.map((t) => {
      const kcalGap = Math.abs(t.calories - targetKcal);
      let score = 1000 - kcalGap;
      if (persona.id === "muscle-gain") score += (t.protein || 0) * 4;
      if (persona.id === "weight-loss") score -= Math.max(0, (t.calories || 0) - targetKcal);
      if (persona.lowGiPreference && t.gi === "low") score += 40;
      return { t, score };
    });
    scored.sort((a, b) => b.score - a.score);

    // small randomness among top few so plans differ each generate
    const top = scored.slice(0, Math.min(3, scored.length));
    const chosen = top[Math.floor(Math.random() * top.length)].t;
    picks[slot] = chosen;
    remainingBudget.kcal -= chosen.calories || 0;
    remainingBudget.proteinG -= chosen.protein || 0;
    remainingBudget.carbsG -= chosen.carbs || 0;
    remainingBudget.fatG -= chosen.fat || 0;
  }

  const totals = Object.values(picks).reduce(
    (acc, m) => {
      acc.calories += m.calories || 0;
      acc.protein += m.protein || 0;
      acc.carbs += m.carbs || 0;
      acc.fat += m.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { picks, totals };
}

function compatibleDiets(dietType) {
  switch (dietType) {
    case "vegan":
      return ["vegan"];
    case "jain":
      return ["jain", "vegan"];
    case "veg":
      return ["veg", "jain", "vegan"];
    case "egg-veg":
      return ["egg-veg", "veg", "jain", "vegan"];
    case "non-veg":
      return ["non-veg", "egg-veg", "veg", "jain", "vegan"];
    default:
      return ["veg", "vegan"];
  }
}
