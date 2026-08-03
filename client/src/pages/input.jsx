/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaceholdersAndVanishInput } from "../components/ui/placeholders-and-vanish-input";
import { fetchFoodData } from "../utils/fetchFoodData";
import { SEARCH_PLACEHOLDERS, matchRegionQuery } from "../data/discoveryData";
import { pushRecentSearch } from "../utils/recentSearches";

function PlaceholdersAndVanishInputDemo({
  foodName,
  setFoodName,
  setOutput,
  loading,
  setLoading,
  setOriginalQuery,
  setSearchAttempted,
  onSearchStart,
  compact = false,
  inputId = "food-input",
}) {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const updateVal = (e) => {
    setFoodName(e.target.value);
    setError(null);
  };

  const onSubmit = async () => {
    if (loading) return;

    const trimmedFoodName = foodName.trim();
    if (!trimmedFoodName) {
      setError("Please enter a food name to search.");
      setTimeout(() => document.getElementById(inputId)?.focus(), 100);
      return;
    }

    if (trimmedFoodName.length < 2) {
      setError("Please enter at least 2 characters to search.");
      return;
    }

    // "Assam" / "Punjab" etc. are regions — open cuisine page, not food search
    const regionHit = matchRegionQuery(trimmedFoodName);
    if (regionHit) {
      navigate(`/cuisine/${regionHit.slug}`);
      return;
    }

    onSearchStart?.();
    setLoading(true);
    setError(null);
    setSearchAttempted(true);
    pushRecentSearch(trimmedFoodName);

    try {
      const data = await fetchFoodData(trimmedFoodName);

      if (!data || (Array.isArray(data) && data.length === 0)) {
        setOutput([]);
        setOriginalQuery(trimmedFoodName);
      } else {
        const resultsWithQuery = Array.isArray(data) ? data : [data];
        resultsWithQuery.originalQuery = trimmedFoodName;
        setOutput(resultsWithQuery);
        setFoodName("");
        setOriginalQuery(trimmedFoodName);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to fetch food data. Please try again.");
      setOutput([]);
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
    <div className={`w-full ${compact ? "" : "max-w-2xl mx-auto"}`}>
      <div className="relative">
        <PlaceholdersAndVanishInput
          placeholders={SEARCH_PLACEHOLDERS}
          onChange={updateVal}
          onSubmit={onSubmit}
          onKeyPress={handleKeyPress}
          value={foodName}
          id={inputId}
        />
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-800/60 bg-red-900/20 p-3">
          <p className="text-center text-sm text-red-400">{error}</p>
        </div>
      )}

      {!compact && (
        <div className="mt-4 text-center">
          <p className="text-xs text-white/45">
            Powered by{" "}
            <span className="font-medium text-saffron-300">IFCT 2017</span> +{" "}
            <span className="font-medium text-leaf-400">INDB</span>
            <span className="text-white/30"> · values typically per 100g</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default PlaceholdersAndVanishInputDemo;
