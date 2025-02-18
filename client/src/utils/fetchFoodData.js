export const fetchFoodData = async (foodName) => {
  const API_KEY = "ziQ3fnCsGky3pOU6uLEYBQ==aVoKSZaT7UM0KTFz"; 
  const authToken = localStorage.getItem("authToken"); // Retrieve the token from localStorage (or another storage method)
  const url = `http://localhost:3000/api/food/search?q=${foodName}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY,
        "Authorization": `Bearer ${authToken}`, // Add Authorization token
        "Content-Type": "application/json"
      },
      credentials: "include" // Ensures cookies are sent if required
    });

    console.log("Response Status:", response.status);
    
    if (!response.ok) throw new Error("Failed to fetch data");

    const data = await response.json();
    console.log("API Response:", data);

    if (data.items.length > 0) {
      const foodItem = data.items[0];  

      return {
        name: foodItem.name,
        calories: foodItem.calories,
        protein_g: foodItem.protein_g,
        carbohydrates_total_g: foodItem.carbohydrates_total_g,
        fat_total_g: foodItem.fat_total_g,
      };
    } else {
      return null;  
    }
  } catch (error) {
    console.error("Error fetching food data:", error);
    return null;
  }
};