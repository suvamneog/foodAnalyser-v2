
/* eslint-disable react/prop-types */
import { useState } from "react";
import { PlaceholdersAndVanishInput } from "../components/ui/placeholders-and-vanish-input";
import { fetchFoodData } from "../utils/fetchFoodData";

function PlaceholdersAndVanishInputDemo({
  foodName,
  setFoodName,
  setOutput,
  loading,
  setLoading,
  setOriginalQuery,
  setSearchAttempted // Add this prop to track search attempts
}) {
  const [error, setError] = useState(null);

  const placeholders = [
    "Search Indian foods like 'roti', 'dal', 'paneer'",
    "Looking for 'chicken curry' or 'biryani'?",
    "Try 'samosa', 'idli', or 'butter chicken'",
    "Search IFCT 2017 + INDB Indian food databases",
  ];

  const updateVal = (e) => {
    setFoodName(e.target.value);
    setError(null);
  };

  const onSubmit = async () => {
    if (loading) return;

    const trimmedFoodName = foodName.trim();
    if (!trimmedFoodName) {
      setError("Please enter a food name to search.");
      setTimeout(() => document.getElementById("food-input")?.focus(), 100);
      return;
    }

    if (trimmedFoodName.length < 2) {
      setError("Please enter at least 2 characters to search.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchAttempted(true); // Mark that a search has been attempted
    try {
      const data = await fetchFoodData(trimmedFoodName);

      if (!data || (Array.isArray(data) && data.length === 0)) {
        // Instead of throwing error, set empty output and let FoodAnalyzer handle the error
        setOutput([]);
        setOriginalQuery(trimmedFoodName);
      } else {
        // ✅ Pass the original query to adjust nutrition values
        const resultsWithQuery = Array.isArray(data) ? data : [data];
        resultsWithQuery.originalQuery = trimmedFoodName; // Attach original query
        
        setOutput(resultsWithQuery);
        setFoodName("");
        setOriginalQuery(trimmedFoodName);
      }
      
    } catch (err) {
      console.log(err);
      setError("Failed to fetch food data. Please try again.");
      setOutput([]); // Set empty output on error
      setOriginalQuery(trimmedFoodName);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={updateVal}
          onSubmit={onSubmit}
          onKeyPress={handleKeyPress}
          value={foodName}
          id="food-input"
        />
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm text-center">{error}</p>
          <p className="text-red-300/70 text-xs text-center mt-1">
            💡 Try common Indian foods like roti, dal, rice, biryani, etc.
          </p>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">
          🔍 Powered by{" "}
          <span className="text-blue-400 font-medium">IFCT 2017</span> +{" "}
          <span className="text-green-400 font-medium">INDB</span> +{" "}
          <span className="text-yellow-400 font-medium">Global dataset</span>
        </p>
        <p className="text-gray-500 text-xs mt-1">
          All nutrition values are per 100g serving for accurate comparison
        </p>
      </div>
    </div>
  );
}

export default PlaceholdersAndVanishInputDemo;
