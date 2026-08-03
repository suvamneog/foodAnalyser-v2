/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import axios from 'axios';
import ToolPageShell from "../components/ToolPageShell";

function LogMeals() {
  const [meals, setMeals] = useState([]);
  const [foodItems, setFoodItems] = useState([{
    name: '',
    quantity: '',
    unit: 'g'
  }]);
  const [mealName, setMealName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = localStorage.getItem("authToken");

  // Indian food suggestions
  const indianFoodSuggestions = [
    "Roti", "Naan", "Chapati", "Dal", "Rice", "Biryani", "Pulao",
    "Palak Paneer", "Butter Chicken", "Samosa", "Pakora", "Dosa",
    "Idli", "Vada", "Poha", "Upma", "Curd", "Lassi", "Chai"
  ];

  // Indian meal types
  const indianMealTypes = [
    "Breakfast", "Lunch", "Dinner", "Snack"
  ];

  // Parse nutrition values safely
  const parseNutritionValue = (value) => {
    if (value === "N/A" || value === undefined || value === null) return 0;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      return Number(cleaned) || 0;
    }
    return Number(value) || 0;
  };

  // Smart food search with secure backend calls
  const searchFoodData = async (foodName, quantity, unit) => {
    try {
      
      // Step 1: Try CalorieNinjas via secure backend endpoint
      try {
        const query = unit === 'g' 
          ? `${quantity}g ${foodName}`
          : `${quantity} ${foodName}`;
          
        const response = await axios.get(
          `https://foodanalyser.onrender.com/api/meal/nutrition?query=${encodeURIComponent(query)}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            timeout: 5000
          }
        );

        if (response.data.items && response.data.items.length > 0) {
          const item = response.data.items[0];
         
          
          return {
            name: foodName,
            quantity: quantity,
            unit: unit,
            calories: parseNutritionValue(item.calories),
            protein_g: parseNutritionValue(item.protein_g),
            carbohydrates_g: parseNutritionValue(item.carbohydrates_total_g),
            fat_g: parseNutritionValue(item.fat_total_g),
            fiber_g: parseNutritionValue(item.fiber_g),
            sugar_g: parseNutritionValue(item.sugar_g),
            source: "CalorieNinjas (Generic)",
            data_source: 'calorieninjas'
          };
        }
      } catch {
        console.log("⚠️ Backend CalorieNinjas failed, trying unified search...");
      }

      // Step 2: Fallback to unified search (IFCT + INDB) for Indian dishes
      try {
        const unifiedResponse = await axios.get(
          `https://foodanalyser.onrender.com/api/food/search?q=${encodeURIComponent(foodName)}`
        );
        
        if (unifiedResponse.data.items && unifiedResponse.data.items.length > 0) {
          // Find the best match
          let bestMatch = unifiedResponse.data.items[0];
          
          const primaryMatches = unifiedResponse.data.items.filter(item => 
            item.name.toLowerCase().startsWith(foodName.toLowerCase())
          );
          
          if (primaryMatches.length > 0) {
            bestMatch = primaryMatches[0];
          }
          
         
          
          // Calculate nutrition based on quantity and unit
          const baseServing = bestMatch.serving_size_g || 100;
          let multiplier = 1;
          
          if (unit === 'g') {
            multiplier = quantity / baseServing;
          } else if (unit === 'pcs') {
            multiplier = quantity * (baseServing / 100);
          }
          
          return {
            name: bestMatch.name,
            quantity: quantity,
            unit: unit,
            calories: parseNutritionValue(bestMatch.calories * multiplier),
            protein_g: parseNutritionValue(bestMatch.protein_g * multiplier),
            carbohydrates_g: parseNutritionValue(bestMatch.carbohydrates_total_g * multiplier),
            fat_g: parseNutritionValue(bestMatch.fat_total_g * multiplier),
            fiber_g: parseNutritionValue((bestMatch.fiber_g || 0) * multiplier),
            sugar_g: parseNutritionValue((bestMatch.sugar_g || 0) * multiplier),
            source: bestMatch.source,
            data_source: 'indian_db'
          };
        }
      } catch (unifiedError) {
        console.error("Unified search failed:", unifiedError);
      }

      console.log(`❌ No results found for: ${foodName}`);
      return null;
      
    } catch (error) {
      console.error("Error searching food data:", error);
      return null;
    }
  };

  const fetchMeals = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("https://foodanalyser.onrender.com/api/meal/logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeals(response.data);
    } catch (error) {
      console.error("Error fetching meals:", error);
      if (error.response) {
        setError(`Error fetching meals: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMeals();
  }, [token]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleFoodItemChange = (index, field, value) => {
    const newFoodItems = [...foodItems];
    
    if (field === 'quantity') {
      if (value === "") {
        newFoodItems[index] = { ...newFoodItems[index], quantity: "" };
      } else {
        const numValue = Number(value);
        if (numValue >= 0) {
          newFoodItems[index] = { ...newFoodItems[index], quantity: numValue };
        }
      }
    } else {
      newFoodItems[index] = { ...newFoodItems[index], [field]: value };
    }
    
    setFoodItems(newFoodItems);
  };

  const addFoodItem = () => {
    setFoodItems([...foodItems, {
      name: '',
      quantity: '',
      unit: 'g'
    }]);
  };

  const removeFoodItem = (index) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!mealName.trim()) {
      setError("Please enter a meal name");
      return false;
    }

    for (let i = 0; i < foodItems.length; i++) {
      const item = foodItems[i];
      if (!item.name.trim()) {
        setError(`Please enter a name for food item #${i + 1}`);
        return false;
      }

      if (item.quantity === "" || item.quantity <= 0) {
        setError(`Please enter a valid quantity for ${item.name}`);
        return false;
      }

      if (item.unit === 'g' && item.quantity > 5000) {
        setError(`Quantity for ${item.name} (${item.quantity}g) seems too high. Please verify.`);
        return false;
      }
      
      if (item.unit === 'pcs' && item.quantity > 100) {
        setError(`Quantity for ${item.name} (${item.quantity} pieces) seems too high. Please verify.`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      const enrichedFoodItems = [];
      let failedItems = [];

      for (const food of foodItems) {
        const nutritionData = await searchFoodData(food.name, food.quantity, food.unit);
        
        if (nutritionData) {
          enrichedFoodItems.push({
            name: food.name,
            quantity: Number(food.quantity),
            unit: food.unit,
            calories: parseNutritionValue(nutritionData.calories),
            protein_g: parseNutritionValue(nutritionData.protein_g),
            carbohydrates_g: parseNutritionValue(nutritionData.carbohydrates_g),
            fat_g: parseNutritionValue(nutritionData.fat_g),
            fiber_g: parseNutritionValue(nutritionData.fiber_g),
            sugar_g: parseNutritionValue(nutritionData.sugar_g),
            data_source: nutritionData.data_source,
            source: nutritionData.source
          });
        } else {
          failedItems.push(food.name);
        }
      }

      if (enrichedFoodItems.length === 0) {
        setError("Could not find nutritional data for any of the food items. Please check the food names and try again.");
        setLoading(false);
        return;
      }

      const totals = enrichedFoodItems.reduce((acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein_g: acc.protein_g + (item.protein_g || 0),
        carbohydrates_g: acc.carbohydrates_g + (item.carbohydrates_g || 0),
        fat_g: acc.fat_g + (item.fat_g || 0)
      }), { calories: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0 });

      const newMeal = {
        mealName,
        foodItems: enrichedFoodItems,
        totalCalories: Number(totals.calories.toFixed(2)),
        totalProtein: Number(totals.protein_g.toFixed(2)),
        totalCarbs: Number(totals.carbohydrates_g.toFixed(2)),
        totalFat: Number(totals.fat_g.toFixed(2))
      };

      await axios.post("https://foodanalyser.onrender.com/api/meal/log", newMeal, {
        headers: { Authorization: `Bearer ${token}` }
      });

     
      
      if (failedItems.length > 0) {
        setSuccess(`Meal logged successfully! Some items skipped: ${failedItems.join(', ')}`);
      } else {
        setSuccess(`Meal logged successfully!`);
      }

      setMealName('');
      setFoodItems([{ name: '', quantity: '', unit: 'g' }]);
      await fetchMeals();
      
    } catch (error) {
      console.error("Error logging meal:", error);
      
      if (error.response) {
        setError(`Error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (mealId) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`https://foodanalyser.onrender.com/api/meal/log/${mealId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeals(meals.filter(meal => meal._id !== mealId));
      setSuccess("Meal deleted successfully");
    } catch (error) {
      console.error("Error deleting meal:", error);
      
      if (error.response) {
        setError(`Error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyTotals = () => {
    const today = new Date().toISOString().split('T')[0];
  
    const todayMeals = meals.filter(meal => 
      meal.loggedAt && new Date(meal.loggedAt).toISOString().split('T')[0] === today
    );
  
    const totals = todayMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.totalCalories || 0),
      protein_g: acc.protein_g + (meal.totalProtein || 0),
      carbohydrates_g: acc.carbohydrates_g + (meal.totalCarbs || 0),
      fat_g: acc.fat_g + (meal.totalFat || 0)
    }), { calories: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0 });

    return {
      calories: Number(totals.calories.toFixed(2)),
      protein_g: Number(totals.protein_g.toFixed(2)),
      carbohydrates_g: Number(totals.carbohydrates_g.toFixed(2)),
      fat_g: Number(totals.fat_g.toFixed(2))
    };
  };

  const groupMealsByDate = () => {
    if (!meals.length) return [];

    const grouped = meals.reduce((acc, meal) => {
      const date = meal.loggedAt ? new Date(meal.loggedAt).toISOString().split('T')[0] : 'Unknown Date';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(meal);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => {
        if (dateA === 'Unknown Date') return 1;
        if (dateB === 'Unknown Date') return -1;
        return new Date(dateB) - new Date(dateA);
      });
  };

  const totals = calculateDailyTotals();
  const groupedMeals = groupMealsByDate();

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return '0';
    return Number(number.toFixed(2));
  };

  const getSourceBadgeColor = (source) => {
    if (source?.includes('CalorieNinjas')) return 'bg-blue-500 text-white';
    if (source?.includes('IFCT')) return 'bg-purple-500 text-white';
    if (source?.includes('INDB')) return 'bg-green-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getShortSourceName = (source) => {
    if (source?.includes('CalorieNinjas')) return 'Generic';
    if (source?.includes('IFCT')) return 'IFCT';
    if (source?.includes('INDB')) return 'INDB';
    return 'DB';
  };

  return (
    <ToolPageShell
      eyebrow="Tracking"
      title="Log a meal"
      subtitle="Build a meal from database matches and save it to your account."
      icon={ClipboardList}
      maxWidth="max-w-4xl"
    >
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/50 p-4 text-red-100">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 rounded-xl border border-leaf-400/30 bg-leaf-500/15 p-4 text-leaf-100">
                <p>{success}</p>
              </div>
            )}
            
            <div className="fa-card mb-8 p-5 sm:p-6">
              <div className="mb-5 border-b border-white/10 pb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron-300/80">
                  Meal log
                </p>
                <p className="mt-1 text-sm text-white/45">
                  Search Indian food databases and save a meal to your account history.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="meal-name" className="block text-sm font-medium text-white/60 mb-1">
                    Meal Name
                  </label>
                  <input
                    id="meal-name"
                    type="text"
                    list="meal-options"
                    placeholder="e.g., Breakfast, Lunch, Dinner"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.04] p-3 text-white placeholder:text-white/30 focus:border-saffron-400/40 focus:outline-none"
                    required
                  />
                  <datalist id="meal-options">
                    {indianMealTypes.map((mealType, index) => (
                      <option key={`meal-opt-${index}`} value={mealType} />
                    ))}
                  </datalist>
                </div>

                {foodItems.map((item, index) => (
                  <div key={`food-item-${index}`} className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Food Item {index + 1}</h3>
                      {foodItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFoodItem(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`food-name-${index}`} className="block text-sm font-medium text-white/60 mb-1">
                          Food Name
                        </label>
                        <input
                          id={`food-name-${index}`}
                          type="text"
                          list="indian-foods"
                          placeholder="e.g., Roti, Rice, Dal"
                          value={item.name}
                          onChange={(e) => handleFoodItemChange(index, 'name', e.target.value)}
                          className="w-full bg-white/[0.04] rounded-lg p-3 border border-white/10 text-white"
                          required
                        />
                        <datalist id="indian-foods">
                          {indianFoodSuggestions.map((food, i) => (
                            <option key={`food-opt-${i}`} value={food} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label htmlFor={`food-quantity-${index}`} className="block text-sm font-medium text-white/60 mb-1">
                          Quantity
                        </label>
                        <input
                          id={`food-quantity-${index}`}
                          type="number"
                          placeholder={`Amount in ${item.unit}`}
                          value={item.quantity}
                          onChange={(e) => handleFoodItemChange(index, 'quantity', e.target.value)}
                          className="bg-white/[0.04] rounded-lg p-3 border border-white/10 w-full text-white"
                          min="0"
                          step="any"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`food-unit-${index}`} className="block text-sm font-medium text-white/60 mb-1">
                          Unit
                        </label>
                        <select
                          id={`food-unit-${index}`}
                          value={item.unit}
                          onChange={(e) => handleFoodItemChange(index, 'unit', e.target.value)}
                          className="bg-white/[0.04] rounded-lg p-3 border border-white/10 w-full text-white"
                        >
                          <option value="g">grams (g)</option>
                          <option value="pcs">pieces (pcs)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addFoodItem}
                  className="w-full bg-white/[0.04] text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-600 transition-colors mb-4"
                >
                  Add Another Food Item
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging Meal...' : 'Log Meal'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="fa-card rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">Today&apos;s Intake</h2>
                <p className="text-white/45 mb-4">Your nutrition summary for today</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.06] p-4 rounded-lg">
                    <p className="text-white/45">Calories</p>
                    <p className="text-2xl font-bold">{formatNumber(totals.calories)} kcal</p>
                  </div>
                  <div className="bg-white/[0.06] p-4 rounded-lg">
                    <p className="text-white/45">Protein</p>
                    <p className="text-2xl font-bold">{formatNumber(totals.protein_g)} g</p>
                  </div>
                  <div className="bg-white/[0.06] p-4 rounded-lg">
                    <p className="text-white/45">Carbs</p>
                    <p className="text-2xl font-bold">{formatNumber(totals.carbohydrates_g)} g</p>
                  </div>
                  <div className="bg-white/[0.06] p-4 rounded-lg">
                    <p className="text-white/45">Fat</p>
                    <p className="text-2xl font-bold">{formatNumber(totals.fat_g)} g</p>
                  </div>
                </div>
              </div>

              <div className="fa-card rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">Meal History</h2>
                <p className="text-white/45 mb-4">Your logged meals by date</p>
                
                <div className="space-y-6 max-h-[500px] overflow-y-auto">
                  {groupedMeals.length > 0 ? (
                    groupedMeals.map(([date, dateMeals]) => (
                      <div key={date} className="space-y-2">
                        <h3 className="font-semibold text-white/60">
                          {date === 'Unknown Date' ? date : new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <div className="space-y-2">
                          {dateMeals.map((meal) => (
                            <div key={meal._id} className="bg-white/[0.06] p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-lg">{meal.mealName}</h4>
                                <button
                                  onClick={() => deleteMeal(meal._id)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                  disabled={loading}
                                >
                                  Delete
                                </button>
                              </div>
                              {meal.foodItems.map((food, foodIndex) => (
                                <div key={`${meal._id}-food-${foodIndex}`} className="mt-3 p-3 bg-white/[0.04] rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-white/60 font-medium">
                                      {food.name} - {food.quantity}{food.unit}
                                    </p>
                                    {food.source && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${getSourceBadgeColor(food.source)}`}>
                                        {getShortSourceName(food.source)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-sm">
                                    <p>🔥 {formatNumber(food.calories)} kcal</p>
                                    <p>🥩 {formatNumber(food.protein_g)} g</p>
                                    <p>🍚 {formatNumber(food.carbohydrates_g)} g</p>
                                    <p>🥑 {formatNumber(food.fat_g)} g</p>
                                  </div>
                                </div>
                              ))}
                              <div className="mt-4 pt-3 border-t border-white/10">
                                <p className="font-semibold text-white/60 mb-2">Meal Total:</p>
                                <div className="grid grid-cols-4 gap-2 text-sm font-medium">
                                  <p>🔥 {formatNumber(meal.totalCalories)} kcal</p>
                                  <p>🥩 {formatNumber(meal.totalProtein)} g</p>
                                  <p>🍚 {formatNumber(meal.totalCarbs)} g</p>
                                  <p>🥑 {formatNumber(meal.totalFat)} g</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-white/45 py-8">
                      <p>No meals logged yet. Start by logging your first meal above!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
    </ToolPageShell>
  );
}

export default LogMeals;
