import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Trash2, Check, Calendar, Search, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { API_ENDPOINTS } from "../utils/apiConfig";

const History = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemId: null,
    query: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Validate individual food data based on your schema
  const isValidFoodData = (food) => {
    if (!food || typeof food !== 'object') return false;
    
    // Required fields from your schema
    if (!food.query || typeof food.query !== 'string') return false;
    if (!food.searchedAt) return false;
    
    // Validate result array exists (can be empty according to your schema)
    if (!Array.isArray(food.result)) return false;
    
    return true;
  };

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
     
      
      const response = await fetch(API_ENDPOINTS.FOOD_HISTORY, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(`Failed to load history (Status: ${response.status})`);
      }

      const data = await response.json();
      
      // Handle different response structures
      let historyData = [];
      if (data.history && Array.isArray(data.history)) {
        historyData = data.history;
      } else if (Array.isArray(data)) {
        historyData = data;
      } else {
        throw new Error("Invalid response format from server");
      }

      // Filter and validate the history items
      const validHistory = historyData.filter(isValidFoodData);

    

      setSearchHistory(validHistory);
      
      if (validHistory.length === 0) {
        setError("No search history found. Start searching for foods to build your history!");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      if (err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please check if the backend is running and try again.");
      } else {
        setError(err.message || "Failed to load search history.");
      }
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const handleDeleteItem = async (itemId) => {
    if (!itemId) {
      setError("Invalid item ID");
      return;
    }

    setDeleteLoading(true);
    const authToken = localStorage.getItem("authToken");

    try {
      const response = await fetch(API_ENDPOINTS.FOOD_HISTORY_ITEM(itemId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(`Failed to delete item (Status: ${response.status})`);
      }

      // Remove item from local state
      setSearchHistory(prev => prev.filter(item => item._id !== itemId));
      setDeleteDialog({ open: false, itemId: null, query: "" });
      
      // Show success message
      setError(null);
      
    } catch (err) {
      console.error("Error deleting history item:", err);
      if (err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError(err.message || "Failed to delete item.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

const handleBulkDelete = async () => {
  if (selectedItems.size === 0) return;

  setDeleteLoading(true);
  const authToken = localStorage.getItem("authToken");

  try {
    // Convert Set to Array and ensure we have valid IDs
    const itemIds = Array.from(selectedItems).filter(id => id && id.trim() !== '');
    
    if (itemIds.length === 0) {
      throw new Error("No valid items selected for deletion");
    }

    console.log("🗑️ Bulk deleting items:", itemIds);

    const response = await fetch(API_ENDPOINTS.FOOD_HISTORY_BULK, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        itemIds: itemIds 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        throw new Error("Your session has expired. Please log in again.");
      }
      
      if (response.status === 400) {
        throw new Error(errorData.error || "Invalid request. Please try selecting items again.");
      }
      
      throw new Error(errorData.error || `Failed to delete items (Status: ${response.status})`);
    }

    const data = await response.json();
    
    // Remove items from local state
    setSearchHistory(prev => prev.filter(item => !selectedItems.has(item._id)));
    setSelectedItems(new Set());
    setBulkDeleteMode(false);
    
    // Show success message
    setError(null);
    console.log(`✅ Deleted ${data.deletedCount} items`);
    
  } catch (err) {
    console.error("Error bulk deleting history:", err);
    if (err.message.includes("Failed to fetch")) {
      setError("Cannot connect to server. Please check your internet connection.");
    } else {
      setError(err.message || "Failed to delete items.");
    }
  } finally {
    setDeleteLoading(false);
  }
};
  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectAllItems = () => {
    if (selectedItems.size === searchHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(searchHistory.map(item => item._id)));
    }
  };

  const clearAllHistory = async () => {
  setDeleteLoading(true);
  const authToken = localStorage.getItem("authToken");

  try {
   
    
    const response = await fetch(API_ENDPOINTS.FOOD_HISTORY_CLEAR, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Try to get more detailed error information
      let errorMessage = `Failed to clear history (Status: ${response.status})`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error("Backend error details:", errorData);
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        errorMessage = "Your session has expired. Please log in again.";
      } else if (response.status === 400) {
        errorMessage = "Invalid request. Please try again.";
      }
      
      throw new Error(errorMessage);
    }

    
    
    setSearchHistory([]);
    setBulkDeleteMode(false);
    setSelectedItems(new Set());
    
    // Show success message
    setError(null);
  
    
  } catch (err) {
    console.error("Error clearing history:", err);
    if (err.message.includes("Failed to fetch")) {
      setError("Cannot connect to server. Please check your connection.");
    } else {
      setError(err.message || "Failed to clear history.");
    }
  } finally {
    setDeleteLoading(false);
  }
};
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNutritionData = (food) => {
    if (!food.result || food.result.length === 0 || !food.result[0]) {
      return (
        <div className="bg-neutral-900 p-4 rounded-lg text-center">
          <p className="text-neutral-400 text-sm">No nutrition data available</p>
        </div>
      );
    }

    const result = food.result[0];
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-900 p-3 rounded-lg text-center">
          <p className="text-sm text-neutral-400">Protein</p>
          <p className="text-lg font-semibold">
            {result.protein_g?.toFixed(1) || '0'}g
          </p>
        </div>
        <div className="bg-neutral-900 p-3 rounded-lg text-center">
          <p className="text-sm text-neutral-400">Carbs</p>
          <p className="text-lg font-semibold">
            {result.carbohydrates_total_g?.toFixed(1) || '0'}g
          </p>
        </div>
        <div className="bg-neutral-900 p-3 rounded-lg text-center">
          <p className="text-sm text-neutral-400">Fats</p>
          <p className="text-lg font-semibold">
            {result.fat_total_g?.toFixed(1) || '0'}g
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center mt-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-white">Loading history...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-10 space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center gap-4">
            <Button
              onClick={fetchSearchHistory}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (searchHistory.length === 0) {
      return (
        <div className="text-center mt-10 space-y-4">
          <Search className="w-16 h-16 text-neutral-600 mx-auto" />
          <h3 className="text-xl font-semibold text-neutral-400">No Search History</h3>
          <p className="text-neutral-500">
            Your food searches will appear here. Start searching to build your history!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Bulk Actions Bar */}
        {bulkDeleteMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between border border-neutral-700"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={selectAllItems}
                className="text-white border-neutral-600 hover:bg-neutral-700"
              >
                {selectedItems.size === searchHistory.length ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-neutral-400 text-sm">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBulkDeleteMode(false);
                  setSelectedItems(new Set());
                }}
                className="text-white border-neutral-600 hover:bg-neutral-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={selectedItems.size === 0 || deleteLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteLoading ? "Deleting..." : `Delete (${selectedItems.size})`}
              </Button>
            </div>
          </motion.div>
        )}

        <ScrollArea className="h-[600px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
            {searchHistory.map((food, index) => (
              <motion.div
                key={food._id || `food-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`bg-neutral-800 text-white border-neutral-700 hover:border-neutral-600 transition-all relative ${
                    bulkDeleteMode ? 'cursor-pointer hover:bg-neutral-750' : ''
                  } ${
                    selectedItems.has(food._id) ? 'ring-2 ring-blue-500 border-blue-500 bg-neutral-750' : ''
                  }`}
                  onClick={() => bulkDeleteMode && toggleItemSelection(food._id)}
                >
                  {/* Selection Checkbox */}
                  {bulkDeleteMode && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedItems.has(food._id) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-neutral-500 bg-neutral-800'
                      }`}>
                        {selectedItems.has(food._id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delete Button (only in normal mode) */}
                  {!bulkDeleteMode && food._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-400 hover:bg-red-950/50 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog({
                          open: true,
                          itemId: food._id,
                          query: food.query,
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-semibold truncate pr-12">
                        {food.query}
                      </h2>
                      {food.result && food.result.length > 0 && food.result[0] && food.result[0].calories && (
                        <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 ml-2">
                          {food.result[0].calories.toFixed(0)} kcal
                        </Badge>
                      )}
                    </div>

                    {renderNutritionData(food)}

                    <div className="mt-4 pt-4 border-t border-neutral-700 flex items-center text-sm text-neutral-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(food.searchedAt)}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950 mt-10">
      <div className="container mx-auto py-8 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <StarsBackground />
          <ShootingStars />
        </div>
        
        {/* Header with Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white text-center sm:text-left">
              Food Search History
            </h1>
            <p className="text-neutral-400 mt-2 text-center sm:text-left">
              {searchHistory.length} search{searchHistory.length !== 1 ? 'es' : ''} recorded
            </p>
          </div>
          
          {searchHistory.length > 0 && !bulkDeleteMode && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setBulkDeleteMode(true)}
                className="text-white border-neutral-600 hover:bg-neutral-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Select Items
              </Button>
              <Button
                variant="destructive"
                onClick={clearAllHistory}
                disabled={deleteLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteLoading ? "Clearing..." : "Clear All"}
              </Button>
            </div>
          )}
        </motion.div>

        {renderContent()}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, itemId: null, query: "" })}>
          <DialogContent className="bg-neutral-800 text-white border-neutral-700">
            <DialogHeader>
              <DialogTitle>Delete Search History</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Are you sure you want to delete the search for &quot;<span className="text-white font-medium">{deleteDialog.query}</span>&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ open: false, itemId: null, query: "" })}
                className="text-white border-neutral-600 hover:bg-neutral-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteItem(deleteDialog.itemId)}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default History;