export const fetchFoodData = async (foodName) => {
  const API_KEY = "ziQ3fnCsGky3pOU6uLEYBQ==aVoKSZaT7UM0KTFz"; 
  const authToken = localStorage.getItem("authToken");
  const url = `http://localhost:3000/api/food/search?q=${foodName}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY,
        ...(authToken && { "Authorization": `Bearer ${authToken}` }), // Only include auth token if it exists
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.error("Server response not ok:", response.status);
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    console.log("API Response:", data);
    
    if (data.items && data.items.length > 0) {
      const foodItem = data.items[0];
      return {
        name: foodItem.name,
        calories: foodItem.calories,
        protein_g: foodItem.protein_g,
        carbohydrates_total_g: foodItem.carbohydrates_total_g,
        fat_total_g: foodItem.fat_total_g,
      };
    } else {
      console.log("No items found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching food data:", error);
    return null;
  }
};