/* eslint-disable react/prop-types */
import { useState } from "react";
import { PlaceholdersAndVanishInput } from "../components/ui/placeholders-and-vanish-input";
import { fetchFoodData } from "../utils/fetchFoodData";

function PlaceholdersAndVanishInputDemo({ foodName, setFoodName, setOutput, loading, setLoading }) {
  const [error, setError] = useState(null);

  const placeholders = [
    "One whey to a healthy life!",
    "Enter the food name!",
    "Searching for some protein?",
  ];

  const updateVal = (e) => {
    setFoodName(e.target.value);
    setError(null); // Clear error when user starts typing
  };

  const onSubmit = async () => {
    if (loading) return; // Prevent multiple requests
  
    const trimmedFoodName = foodName.trim();
    if (!trimmedFoodName) {
      setError("Please enter a valid food name before searching.");
      setTimeout(() => document.getElementById("food-input")?.focus(), 100);
      return;
    }
  
    setLoading(true); // Set loading before making request
    try {
      const data = await fetchFoodData(trimmedFoodName);
      if (!data || Object.keys(data).length === 0) {
        throw new Error("No data found for the entered food item.");
      }
      
      setOutput([data]);
      console.log("submitted", data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false); // Reset loading state after request
    }
  };

  return (
    <div className="">
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={updateVal}
        onSubmit={onSubmit}
        value={foodName}
      />
      {error && <p className="pl-10 mt-2 text-red-500">{error}</p>}
    </div>
  );
}

export default PlaceholdersAndVanishInputDemo;