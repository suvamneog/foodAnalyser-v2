export const fetchFoodData = async (foodName) => {
  const API_KEY = "ziQ3fnCsGky3pOU6uLEYBQ==aVoKSZaT7UM0KTFz"; 
  const url = `https://api.calorieninjas.com/v1/nutrition?query=${foodName}`;

  try {
    const response = await fetch(url, {
      headers: { "X-Api-Key": API_KEY },
    });

    console.log("Response Status:", response.status);
    
    if (!response.ok) throw new Error("Failed to fetch data");

    const data = await response.json();
    console.log("API Response:", data);

    // Check if the items array contains data and extract it
    if (data.items.length > 0) {
      const foodItem = data.items[0];  // First item in the array

      return {
        name: foodItem.name,
        calories: foodItem.calories,
        protein_g: foodItem.protein_g,
        carbohydrates_total_g: foodItem.carbohydrates_total_g,
        fat_total_g: foodItem.fat_total_g,
      };
    } else {
      return null;  // No results found
    }
  } catch (error) {
    console.error("Error fetching food data:", error);
    return null;  // Return null in case of error
  }
};