import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";

function History() {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchHistory = async () => {
      setLoading(true);
      setError(null);

      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/food/history", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Data:", data);

        if (Array.isArray(data)) {
          setSearchHistory(data);
        } else if (data.history && Array.isArray(data.history)) {
          setSearchHistory(data.history);
        } else {
          setSearchHistory([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load search history.");
        setSearchHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchHistory();
  }, []);

  if (loading) {
    return <p className="text-white text-center mt-10">Loading...</p>;
  }

  if (error) {
    return <p className="text-white text-center mt-10">{error}</p>;
  }

  if (searchHistory.length === 0) {
    return <p className="text-white text-center mt-10">No search history available.</p>;
  }

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
          <ScrollArea className="h-[800px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchHistory.map((food, index) => (
                <Card
                  key={index}
                  className="bg-neutral-800 text-white border-neutral-700 hover:border-neutral-600 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">{food.query}</h2>
                      <Badge variant="secondary" className="bg-neutral-700">
                        {food.result?.[0]?.calories ?? "No data"} kcal
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-neutral-900 p-3 rounded-lg text-center">
                        <p className="text-sm text-neutral-400">Protein</p>
                        <p className="text-lg font-semibold">
                          {food.result?.[0]?.protein_g ?? "N/A"}g
                        </p>
                      </div>
                      <div className="bg-neutral-900 p-3 rounded-lg text-center">
                        <p className="text-sm text-neutral-400">Carbs</p>
                        <p className="text-lg font-semibold">
                          {food.result?.[0]?.carbohydrates_total_g ?? "N/A"}g
                        </p>
                      </div>
                      <div className="bg-neutral-900 p-3 rounded-lg text-center">
                        <p className="text-sm text-neutral-400">Fats</p>
                        <p className="text-lg font-semibold">
                          {food.result?.[0]?.fat_total_g ?? "N/A"}g
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-700">
                      <p className="text-sm text-neutral-400">
                        Searched on{" "}
                        {food.searchedAt
                          ? new Date(food.searchedAt).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}

export default History;