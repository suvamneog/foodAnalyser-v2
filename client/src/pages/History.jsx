import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "../components/ui/alert";

const History = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate individual food data
  const isValidFoodData = (food) => {
    if (!food || typeof food !== 'object') return false;
    
    // Required fields
    if (!food.query || typeof food.query !== 'string') return false;
    if (!food.searchedAt) return false;
    
    // Validate result array
    if (!Array.isArray(food.result) || food.result.length === 0) return false;
    
    // Validate first result item
    const result = food.result[0];
    if (!result || typeof result !== 'object') return false;
    
    // Validate numeric fields (allow 0 but not null/undefined)
    const numericFields = [
      'calories',
      'protein_g',
      'carbohydrates_total_g',
      'fat_total_g'
    ];
    
    return numericFields.every(field => 
      typeof result[field] === 'number' && !isNaN(result[field])
    );
  };

  useEffect(() => {
    const fetchSearchHistory = async () => {
      setLoading(true);
      setError(null);

      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setError("Please log in to view your search history.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://foodanalyser.onrender.com/api/food/history", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401 
              ? "Your session has expired. Please log in again."
              : `Failed to load history (Status: ${response.status})`
          );
        }

        const data = await response.json();
        
        // Validate the response structure
        if (!data) {
          throw new Error("Invalid response from server");
        }

        // Filter and validate the history items
        const validHistory = Array.isArray(data.history) 
          ? data.history.filter(isValidFoodData)
          : Array.isArray(data) 
            ? data.filter(isValidFoodData)
            : [];

        if (validHistory.length === 0 && (Array.isArray(data) || Array.isArray(data.history))) {
          setError("No food history!");
        }

        setSearchHistory(validHistory);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err.message || "Failed to load search history.");
        setSearchHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchHistory();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className="text-white text-center mt-10">Loading...</p>;
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-10">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (searchHistory.length === 0) {
      return (
        <Alert className="mt-10">
          <AlertDescription>No search history available.</AlertDescription>
        </Alert>
      );
    }

    return (
      <ScrollArea className="h-[800px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchHistory.map((food, index) => (
            <Card
              key={`${food.query}-${food.searchedAt}-${index}`}
              className="bg-neutral-800 text-white border-neutral-700 hover:border-neutral-600 transition-all"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold truncate">
                    {food.query}
                  </h2>
                  <Badge variant="secondary" className="bg-neutral-700">
                    {food.result[0].calories.toFixed(1)} kcal
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-neutral-900 p-3 rounded-lg text-center">
                    <p className="text-sm text-neutral-400">Protein</p>
                    <p className="text-lg font-semibold">
                      {food.result[0].protein_g.toFixed(1)}g
                    </p>
                  </div>
                  <div className="bg-neutral-900 p-3 rounded-lg text-center">
                    <p className="text-sm text-neutral-400">Carbs</p>
                    <p className="text-lg font-semibold">
                      {food.result[0].carbohydrates_total_g.toFixed(1)}g
                    </p>
                  </div>
                  <div className="bg-neutral-900 p-3 rounded-lg text-center">
                    <p className="text-sm text-neutral-400">Fats</p>
                    <p className="text-lg font-semibold">
                      {food.result[0].fat_total_g.toFixed(1)}g
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <p className="text-sm text-neutral-400">
                    Searched on{" "}
                    {new Date(food.searchedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950 mt-10">
      <div className="container mx-auto py-8 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <StarsBackground />
          <ShootingStars />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold mb-8 text-white text-center">
            Food Search History
          </h1>
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default History;