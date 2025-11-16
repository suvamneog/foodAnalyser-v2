
import axios from "axios";

export const fetchFoodData = async (foodName) => {
  // ✅ Local development
  const url = `http://localhost:3000/api/food/search?q=${encodeURIComponent(
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

    

    // ✅ Handle ANY response format
    let foodItems = [];
    
    if (response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
      foodItems = response.data.items;
    }
    else if (response.data && typeof response.data === 'object' && response.data.name) {
      foodItems = [response.data];
    }
    else if (response.data.direct) {
      foodItems = [response.data.direct];
    }
    else if (response.data.withSource) {
      foodItems = [response.data.withSource];
    }
    else {
      throw new Error(`No results found for "${foodName}" in our databases.`);
    }

    if (!foodItems || foodItems.length === 0) {
      throw new Error(`No results found for "${foodName}" in our databases.`);
    }

    // ✅ Map all items (no source detection needed - backend handles it)
    const mappedItems = foodItems.map(foodItem => {
      return {
        name: foodItem.name || "Unknown Food",
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
        source: foodItem.source || "Unknown Source", // Trust backend source
      };
    });

   
    
    return mappedItems;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error;

      switch (status) {
        case 400:
          throw new Error("Please enter a food name to search.");
        case 404:
          throw new Error(message || `No results found for "${foodName}" in Indian food databases.`);
        case 500:
          throw new Error("Food database is temporarily unavailable. Please try again later.");
        default:
          throw new Error(message || "Failed to fetch food data. Please try again.");
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
