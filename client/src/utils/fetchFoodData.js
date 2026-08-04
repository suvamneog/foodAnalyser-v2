import axios from "axios";
import { API_ENDPOINTS } from "./apiConfig";
import { findDishByMatch, foodItemFromDish } from "../data/discoveryData";

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  const authToken = localStorage.getItem("authToken");
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

function mapFoodItems(foodItems) {
  return foodItems.map((foodItem) => {
    const availableFields = Array.isArray(foodItem.availableFields)
      ? foodItem.availableFields
      : null;
    const nullable = availableFields != null;

    return {
      name: foodItem.name || "Unknown Food",
      displayName: foodItem.displayName || foodItem.name || "Unknown Food",
      requestedName: foodItem.requestedName || null,
      food_code: foodItem.food_code || null,
      calories: parseNutritionValue(foodItem.calories, { nullable }),
      protein_g: parseNutritionValue(foodItem.protein_g, { nullable }),
      carbohydrates_total_g: parseNutritionValue(
        foodItem.carbs_g || foodItem.carbohydrates_total_g,
        { nullable }
      ),
      fat_total_g: parseNutritionValue(foodItem.fat_g || foodItem.fat_total_g, {
        nullable,
      }),
      fiber_g: parseNutritionValue(foodItem.fiber_g, { nullable }),
      sugar_g: parseNutritionValue(foodItem.sugar_g, { nullable }),
      fat_saturated_g: parseNutritionValue(foodItem.fat_saturated_g, {
        nullable,
      }),
      sodium_mg: parseNutritionValue(foodItem.sodium_mg, { nullable }),
      cholesterol_mg: parseNutritionValue(foodItem.cholesterol_mg, {
        nullable,
      }),
      calcium_mg: parseNutritionValue(foodItem.calcium_mg, { nullable }),
      iron_mg: parseNutritionValue(foodItem.iron_mg, { nullable }),
      potassium_mg: parseNutritionValue(foodItem.potassium_mg, { nullable }),
      zinc_mg: parseNutritionValue(foodItem.zinc_mg, { nullable }),
      vitamin_c_mg: parseNutritionValue(foodItem.vitamin_c_mg, { nullable }),
      beta_carotene_ug: parseNutritionValue(foodItem.beta_carotene_ug, {
        nullable,
      }),
      retinol_ug: parseNutritionValue(foodItem.retinol_ug, { nullable }),
      availableFields,
      citation: null,
      notes: foodItem.notes || null,
      region: foodItem.region || null,
      serving_size_g: foodItem.serving_size_g || 100,
      serving_description: foodItem.serving_description || "per 100g",
      source: foodItem.source || "Unknown Source",
      sourceShort: foodItem.sourceShort || null,
      food_group: foodItem.food_group || null,
      cut: foodItem.cut || null,
      preparation: foodItem.preparation || null,
      isRaw: foodItem.isRaw || false,
      isCooked: foodItem.isCooked || false,
    };
  });
}

function attachAxiosMeta(error) {
  if (!axios.isAxiosError(error)) throw error;
  const status = error.response?.status;
  const data = error.response?.data || {};
  const message = data.error;

  const withMeta = (msg) => {
    const e = new Error(msg);
    if (Array.isArray(data.suggestions)) e.suggestions = data.suggestions;
    if (Array.isArray(data.hints)) e.hints = data.hints;
    if (Array.isArray(data.related)) e.related = data.related;
    e.status = status;
    e.confident = data.confident;
    return e;
  };

  switch (status) {
    case 400:
      throw withMeta("Please enter a food name to search.");
    case 404:
      throw withMeta(message || "No results found in Indian food databases.");
    case 500:
      throw withMeta(
        "Food database is temporarily unavailable. Please try again later."
      );
    default:
      throw withMeta(message || "Failed to fetch food data. Please try again.");
  }
}

/** Exact IFCT/INDB/ASSAM lookup for Discover cards */
export const fetchFoodById = async ({ source, code, label }) => {
  if (!source || !code) {
    throw new Error("Missing food source or code");
  }
  const params = new URLSearchParams({
    source: String(source).toUpperCase(),
    code: String(code).toUpperCase(),
  });
  if (label) params.set("label", label);

  try {
    const response = await axios.get(
      `${API_ENDPOINTS.FOOD_BY_ID}?${params.toString()}`,
      { headers: authHeaders() }
    );
    const foodItems = response.data?.items;
    if (!Array.isArray(foodItems) || foodItems.length === 0) {
      throw new Error(`No exact match for ${label || code}`);
    }
    return mapFoodItems(foodItems);
  } catch (error) {
    // Production API may be missing /by-id — use on-device discovery catalog.
    const localDish = findDishByMatch(source, code);
    const localItem = foodItemFromDish(localDish, label);
    if (localItem && (localItem.calories != null || localItem.protein_g != null)) {
      return [localItem];
    }
    attachAxiosMeta(error);
  }
};

/**
 * Browse a verified category list (macro filter or curated codes).
 * Results are cached in-memory so revisits don't flash an empty grid.
 */
const categoryCache = new Map();

function categoryCacheKey(id, limit) {
  return `${String(id || "").toLowerCase()}::${limit}`;
}

export function peekFoodCategory(id, { limit = 48 } = {}) {
  return categoryCache.get(categoryCacheKey(id, limit)) || null;
}

export const fetchFoodCategory = async (id, { limit = 48 } = {}) => {
  const key = categoryCacheKey(id, limit);
  const cached = categoryCache.get(key);
  if (cached) return cached;

  const url = `${API_ENDPOINTS.FOOD_CATEGORY(id)}?limit=${encodeURIComponent(limit)}`;
  try {
    const response = await axios.get(url, {
      headers: authHeaders(),
      timeout: 25000,
    });
    const data = response.data || {};
    const items = mapFoodItems(Array.isArray(data.items) ? data.items : []);
    const payload = {
      id: data.id,
      label: data.label,
      mode: data.mode,
      criteria: data.criteria,
      disclaimer: data.disclaimer,
      examples: data.examples || [],
      per: data.per || "100g",
      sources: data.sources || [],
      totalMatching: data.totalMatching ?? items.length,
      shown: data.shown ?? items.length,
      items,
    };
    categoryCache.set(key, payload);
    return payload;
  } catch (error) {
    attachAxiosMeta(error);
  }
};

/** Warm the cache without blocking UI (e.g. home tile hover). */
export function prefetchFoodCategory(id, opts) {
  const key = categoryCacheKey(id, opts?.limit ?? 48);
  if (categoryCache.has(key)) return;
  fetchFoodCategory(id, opts).catch(() => {});
}

export const fetchFoodData = async (foodName) => {
  const url = `${API_ENDPOINTS.FOOD_SEARCH}?q=${encodeURIComponent(
    foodName.trim()
  )}`;

  try {
    const response = await axios.get(url, { headers: authHeaders() });

    let foodItems = [];

    if (
      response.data.items &&
      Array.isArray(response.data.items) &&
      response.data.items.length > 0
    ) {
      foodItems = response.data.items;
    } else if (
      response.data &&
      typeof response.data === "object" &&
      response.data.name
    ) {
      foodItems = [response.data];
    } else {
      throw new Error(`No results found for "${foodName}" in our databases.`);
    }

    const mappedItems = mapFoodItems(foodItems);
    mappedItems.confident = response.data.confident !== false;
    mappedItems.related = Array.isArray(response.data.related)
      ? mapFoodItems(response.data.related)
      : [];
    return mappedItems;
  } catch (error) {
    attachAxiosMeta(error);
  }
};

function parseNutritionValue(value, { nullable = false } = {}) {
  if (value === "N/A" || value === undefined || value === null) {
    return nullable ? null : 0;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    if (cleaned === "" || cleaned === "-" || cleaned === ".") {
      return nullable ? null : 0;
    }
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return nullable ? null : 0;
    return n;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return nullable ? null : 0;
  return n;
}
