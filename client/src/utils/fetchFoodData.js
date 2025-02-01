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

      // Extract first item from "items" array
      return data.items.length > 0 ? data.items[0] : null;
    } catch (error) {
      console.error("Error fetching food data:", error);
      return null;
    }
};