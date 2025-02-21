import axios from 'axios';

export const fetchFoodData = async (foodName) => {
  const API_KEY = "ziQ3fnCsGky3pOU6uLEYBQ==aVoKSZaT7UM0KTFz";
  const url = `http://localhost:3000/api/food/search?q=${encodeURIComponent(foodName.trim())}`;

  try {
    const headers = {
      "X-Api-Key": API_KEY,
      "Content-Type": "application/json",
    };

    // Only add auth header if user is logged in
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.get(url, { headers });
    
    if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
      throw new Error("Invalid response format from server");
    }

    if (response.data.items.length === 0) {
      throw new Error(`No results found for "${foodName}"`);
    }

    const foodItem = response.data.items[0];

    // Validate required fields
    const requiredFields = ["name", "calories", "protein_g", "carbohydrates_total_g", "fat_total_g"];
    const missingFields = requiredFields.filter(field => {
      const value = foodItem[field];
      return value === undefined || value === null || (typeof value === "number" && isNaN(value));
    });

    if (missingFields.length > 0) {
      throw new Error(`Incomplete data: missing ${missingFields.join(", ")}`);
    }

    return {
      name: foodItem.name,
      calories: Number(foodItem.calories),
      protein_g: Number(foodItem.protein_g || 0),
      carbohydrates_total_g: Number(foodItem.carbohydrates_total_g || 0),
      fat_total_g: Number(foodItem.fat_total_g || 0),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      switch (error.response?.status) {
        case 401:
          throw new Error("Session expired. Please log in again.");
        case 403:
          throw new Error("Access denied. Please check your permissions.");
        case 404:
          throw new Error(`No data found for "${foodName}". Please try another food item.`);
        case 429:
          throw new Error("Too many requests. Please try again later.");
        case 500:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(error.response?.data?.message || "Failed to fetch food data");
      }
    }
    throw error;
  }
};