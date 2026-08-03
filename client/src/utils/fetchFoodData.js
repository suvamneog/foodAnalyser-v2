import axios from "axios";
import { API_ENDPOINTS } from "./apiConfig";

export const fetchFoodData = async (foodName) => {
  const url = `${API_ENDPOINTS.FOOD_SEARCH}?q=${encodeURIComponent(
    foodName.trim()
  )}`;

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.get(url, { headers });

    // ✅ Handle response format
    let foodItems = [];
    
    if (response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
      foodItems = response.data.items;
    }
    else if (response.data && typeof response.data === 'object' && response.data.name) {
      foodItems = [response.data];
    }
    else {
      throw new Error(`No results found for "${foodName}" in our databases.`);
    }

    if (!foodItems || foodItems.length === 0) {
      throw new Error(`No results found for "${foodName}" in our databases.`);
    }

    // ✅ Map all items with enhanced information
    const mappedItems = foodItems.map(foodItem => {
      return {
        name: foodItem.name || "Unknown Food",
        displayName: foodItem.displayName || foodItem.name || "Unknown Food",
        calories: parseNutritionValue(foodItem.calories),
        protein_g: parseNutritionValue(foodItem.protein_g),
        carbohydrates_total_g: parseNutritionValue(foodItem.carbs_g || foodItem.carbohydrates_total_g),
        fat_total_g: parseNutritionValue(foodItem.fat_g || foodItem.fat_total_g),
        fiber_g: parseNutritionValue(foodItem.fiber_g),
        sugar_g: parseNutritionValue(foodItem.sugar_g),
        fat_saturated_g: parseNutritionValue(foodItem.fat_saturated_g),
        sodium_mg: parseNutritionValue(foodItem.sodium_mg),
        cholesterol_mg: parseNutritionValue(foodItem.cholesterol_mg),
        serving_size_g: foodItem.serving_size_g || 100,
        serving_description: foodItem.serving_description || "per 100g",
        source: foodItem.source || "Unknown Source",
        // 🆕 Enhanced fields for differentiation
        cut: foodItem.cut || null,
        preparation: foodItem.preparation || null,
        isRaw: foodItem.isRaw || false,
        isCooked: foodItem.isCooked || false,
      };
    });

    return mappedItems;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data || {};
      const message = data.error;

      const withMeta = (msg) => {
        const e = new Error(msg);
        if (Array.isArray(data.suggestions)) e.suggestions = data.suggestions;
        if (Array.isArray(data.hints)) e.hints = data.hints;
        e.status = status;
        return e;
      };

      switch (status) {
        case 400:
          throw withMeta("Please enter a food name to search.");
        case 404:
          throw withMeta(message || `No results found for "${foodName}" in Indian food databases.`);
        case 500:
          throw withMeta("Food database is temporarily unavailable. Please try again later.");
        default:
          throw withMeta(message || "Failed to fetch food data. Please try again.");
      }
    }
    throw error;
  }
};

// Helper function to handle "N/A" values and convert to numbers
function parseNutritionValue(value) {
  if (value === "N/A" || value === undefined || value === null) return 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return Number(cleaned) || 0;
  }
  return Number(value) || 0;
}