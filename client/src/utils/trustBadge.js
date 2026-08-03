/**
 * Honest trust labels for nutrition numbers.
 *
 * Rules (never inflate):
 * - "verified" ONLY for IFCT 2017 lab values or INDB recipe composition
 * - "gi-verified" ONLY when Atkinson status is verified
 * - "gi-reference" for Atkinson reference / caveats
 * - "estimate" for portions, oil, templates, vision grams, local fallbacks
 * - "third-party" for CalorieNinjas / Open Food Facts
 * - "unavailable" when we don't have the fact
 */

export function resolveTrust(input = {}) {
  const source = String(input.source || "").toLowerCase();
  const giStatus = String(input.giStatus || "").toLowerCase();
  const nutritionBasis = String(input.nutritionBasis || "").toLowerCase();
  const kind = input.kind || "macros"; // macros | gi | portion | oil | score

  if (kind === "score" || kind === "xp" || kind === "health-score") {
    return {
      level: "estimate",
      short: "Habit score",
      label: "Not a medical metric",
      detail: "Composite of your logs, water, steps and streak — not a clinical health measure.",
      tone: "muted",
    };
  }

  if (kind === "oil" || kind === "portion-oil") {
    return {
      level: "estimate",
      short: "Household estimate",
      label: "Cooking fat estimate",
      detail: "Oil/ghee calories use standard kcal/g. Household usage varies — adjust the slider.",
      tone: "amber",
    };
  }

  if (kind === "portion" || kind === "vision-portion") {
    return {
      level: "estimate",
      short: "Portion estimate",
      label: "Portion not lab-weighed",
      detail:
        input.detail ||
        "Portion grams are estimated (vision or household units). Weigh for best accuracy.",
      tone: "amber",
    };
  }

  if (kind === "gi") {
    if (giStatus === "verified") {
      return {
        level: "verified",
        short: "Verified GI",
        label: "Atkinson et al. 2021",
        detail: input.giCitation || "Published GI from International tables of GI/GL values.",
        tone: "green",
      };
    }
    if (giStatus === "reference") {
      return {
        level: "reference",
        short: "Reference GI",
        label: "Published with caveats",
        detail:
          input.giNote ||
          "Listed in GI tables but method/population caveats apply. Not a lab retest of your plate.",
        tone: "blue",
      };
    }
    return {
      level: "unavailable",
      short: "GI unavailable",
      label: "No verified GI",
      detail: "We do not invent GI values. No published match for this dish.",
      tone: "muted",
    };
  }

  // Macros / general source
  if (source.includes("ifct")) {
    const portionAdjusted = input.portionAdjusted || nutritionBasis.includes("portion");
    return {
      level: "verified",
      short: "IFCT verified",
      label: "ICMR–NIN IFCT 2017",
      detail: portionAdjusted
        ? "Per-100g macros from IFCT 2017 (lab-measured). Scaled to your portion — grams are an estimate unless you weighed them."
        : "Lab-measured composition from Indian Food Composition Tables 2017 (ICMR–NIN).",
      tone: "green",
      portionNote: portionAdjusted
        ? "Macros verified · portion estimated"
        : null,
    };
  }

  if (source.includes("indb")) {
    return {
      level: "verified",
      short: "INDB verified",
      label: "Indian Nutrient Databank",
      detail:
        "Recipe-level composition from the Indian Nutrient Databank. Scaled to serving size; home recipes may differ.",
      tone: "green",
    };
  }

  if (
    source.includes("assam") ||
    source.includes("manipur") ||
    source.includes("meghalaya") ||
    source.includes("nagaland") ||
    source.includes("northeast")
  ) {
    const region =
      source.includes("manipur")
        ? "Manipur"
        : source.includes("meghalaya")
        ? "Meghalaya"
        : source.includes("nagaland")
        ? "Nagaland"
        : source.includes("assam")
        ? "Assam"
        : "Northeast";
    return {
      level: "estimate",
      short: `${region} estimate`,
      label: "Not IFCT/INDB",
      detail:
        `${region} regional estimate (not ICMR–NIN IFCT/INDB). Approximate; recipes vary. Only available nutrients are shown — gaps are not filled with zeros.`,
      tone: "amber",
    };
  }

  if (
    source.includes("calorieninjas") ||
    source.includes("open food") ||
    source.includes("openfoodfacts")
  ) {
    return {
      level: "third-party",
      short: "Third-party",
      label: source.includes("open") ? "Open Food Facts" : "CalorieNinjas",
      detail:
        "Not an ICMR–NIN lab value. Useful fallback for packaged/global foods; weaker for Indian home cooking.",
      tone: "blue",
    };
  }

  if (
    source.includes("local") ||
    source.includes("estimate") ||
    source.includes("fallback") ||
    source.includes("template") ||
    source.includes("quick-log") ||
    source.includes("recipe")
  ) {
    return {
      level: "estimate",
      short: "Estimate",
      label: "Not lab-verified",
      detail:
        "Approximate values from a small local table or household template. Prefer an IFCT/INDB match when available.",
      tone: "amber",
    };
  }

  if (!source || source.includes("unknown")) {
    return {
      level: "unavailable",
      short: "Unverified",
      label: "Source unknown",
      detail: "We could not attribute this number to IFCT, INDB, or a named third-party source.",
      tone: "muted",
    };
  }

  return {
    level: "estimate",
    short: "Unverified",
    label: input.source || "Unknown source",
    detail: "Treat as an estimate unless the source is IFCT 2017 or INDB.",
    tone: "amber",
  };
}
