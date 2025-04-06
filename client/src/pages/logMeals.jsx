/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";
import axios from 'axios';

function LogMeals() {
  const [meals, setMeals] = useState([]);
  const [foodItems, setFoodItems] = useState([{
    name: '',
    quantity: '',
    unit: 'g'
  }]);
  const [mealName, setMealName] = useState('');
  const [loading, setLoading] = useState(false);
  // New state for error handling
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = localStorage.getItem("authToken");

  // Indian food suggestions
  const indianFoodSuggestions = [
    "Roti", "Naan", "ou tenga curry",
    "Dal", "Palak Paneer", "Butter Chicken", 
    "Gulab Jamun", "Samosa", "Pakora", "Paneer Tikka"
  ];

  // Indian meal types
  const indianMealTypes = [
    "Breakfast", "Lunch", "Dinner", "Snack"
  ];

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
        // The request was made and the server responded with an error status
        setError(`Error fetching meals: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        setError("Network error. Please check your connection and try again.");
      } else {
        // Something else happened while setting up the request
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
    
    // Validation for quantity field
    if (field === 'quantity') {
      // Allow empty string for user typing
      if (value === "") {
        newFoodItems[index] = { ...newFoodItems[index], quantity: "" };
      } else {
        const numValue = Number(value);
        // Prevent negative values
        if (numValue >= 0) {
          newFoodItems[index] = { ...newFoodItems[index], quantity: numValue };
        }
      }
    } else {
      // For other fields
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
    // Basic validation
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

      // Check for reasonable limits
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
    
    // Clear previous messages
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!validateForm()) return;
  
    setLoading(true);
  
    const newMeal = {
      mealName,
      foodItems: foodItems.map(item => ({
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit
      }))
    };
  
    try {
      const response = await axios.post("https://foodanalyser.onrender.com/api/meal/log", newMeal, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Check for warnings in response
      if (response.data && response.data.warnings) {
        setSuccess(`Meal logged with some items skipped: ${response.data.warnings.failedItems.join(', ')}`);
      } else {
        setSuccess("Meal logged successfully!");
      }
  
      // Reset form
      setMealName('');
      setFoodItems([{ name: '', quantity: '', unit: 'g' }]);
  
      // Fetch updated meals
      await fetchMeals();
      
    } catch (error) {
      console.error("Error logging meal:", error);
      
      if (error.response) {
        // Server returned an error
        setError(`Error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // Network error
        setError("Network error. Please check your connection and try again.");
      } else {
        // Other error
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

  // Rest of the functions remain the same

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

  const formatNumber = (num) => Number(num.toFixed(2));

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 pointer-events-none">
        <StarsBackground />
        <ShootingStars />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="min-h-screen p-8 mt-20">
          <div className="max-w-4xl mx-auto">
            {/* Error/Success Alert */}
            {error && (
              <div className="bg-red-600 text-white p-4 rounded-lg mb-6 shadow-lg">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-600 text-white p-4 rounded-lg mb-6 shadow-lg">
                <p>{success}</p>
              </div>
            )}
            
            <div className="bg-zinc-900 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-2">Log Your Meal</h2>
              <p className="text-gray-400 mb-4">Track your daily nutrition intake</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="meal-name" className="block text-sm font-medium text-gray-300 mb-1">
                    Meal Name
                  </label>
                  <input
                    id="meal-name"
                    type="text"
                    list="meal-options"
                    placeholder="e.g., Breakfast, Lunch, Dinner"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="w-full bg-zinc-800 rounded-lg p-3 border border-zinc-700"
                    required
                  />
                  <datalist id="meal-options">
                    {indianMealTypes.map((mealType, index) => (
                      <option key={`meal-opt-${index}`} value={mealType} />
                    ))}
                  </datalist>
                </div>

                {foodItems.map((item, index) => (
                  <div key={`food-item-${index}`} className="space-y-4 p-4 bg-zinc-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Food Item {index + 1}</h3>
                      {foodItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFoodItem(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`food-name-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Food Name
                        </label>
                        <input
                          id={`food-name-${index}`}
                          type="text"
                          list="indian-foods"
                          placeholder="e.g., Roti, Rice, Dal"
                          value={item.name}
                          onChange={(e) => handleFoodItemChange(index, 'name', e.target.value)}
                          className="w-full bg-zinc-700 rounded-lg p-3 border border-zinc-600"
                          required
                        />
                        <datalist id="indian-foods">
                          {indianFoodSuggestions.map((food, i) => (
                            <option key={`food-opt-${i}`} value={food} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label htmlFor={`food-quantity-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Quantity
                        </label>
                        <input
                          id={`food-quantity-${index}`}
                          type="number"
                          placeholder={`Amount in ${item.unit}`}
                          value={item.quantity}
                          onChange={(e) => handleFoodItemChange(index, 'quantity', e.target.value)}
                          className="bg-zinc-700 rounded-lg p-3 border border-zinc-600 w-full"
                          min="0"
                          step="any"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`food-unit-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Unit
                        </label>
                        <select
                          id={`food-unit-${index}`}
                          value={item.unit}
                          onChange={(e) => handleFoodItemChange(index, 'unit', e.target.value)}
                          className="bg-zinc-700 rounded-lg p-3 border border-zinc-600 w-full"
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
                  className="w-full bg-zinc-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-600 transition-colors mb-4"
                >
                  Add Another Food Item
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Logging...' : 'Log Meal'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">Today&apos;s Intake</h2>
                <p className="text-gray-400 mb-4">Your nutrition summary for today</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="text-gray-400">Calories</p>
                    <p className="text-2xl font-bold">{totals.calories}kcal</p>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="text-gray-400">Protein</p>
                    <p className="text-2xl font-bold">{totals.protein_g}g</p>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="text-gray-400">Carbs</p>
                    <p className="text-2xl font-bold">{totals.carbohydrates_g}g</p>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="text-gray-400">Fat</p>
                    <p className="text-2xl font-bold">{totals.fat_g}g</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">Meal History</h2>
                <p className="text-gray-400 mb-4">Your logged meals by date</p>
                
                <div className="space-y-6 max-h-[500px] overflow-y-auto">
                  {groupedMeals.map(([date, dateMeals]) => (
                    <div key={date} className="space-y-2">
                      <h3 className="font-semibold text-gray-300">
                        {date === 'Unknown Date' ? date : new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <div className="space-y-2">
                        {dateMeals.map((meal) => (
                          <div key={meal._id} className="bg-zinc-800 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold">{meal.mealName}</h4>
                              <button
                                onClick={() => deleteMeal(meal._id)}
                                className="text-red-400 hover:text-red-300"
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                            {meal.foodItems.map((food, foodIndex) => (
                              <div key={`${meal._id}-food-${foodIndex}`} className="mt-2">
                                <p className="text-gray-400">
                                  {food.name} - {food.quantity}{food.unit}
                                </p>
                                <div className="grid grid-cols-4 gap-2 mt-1 text-sm">
                                  <p>🔥 {formatNumber(food.calories)}kcal</p>
                                  <p>🥩 {formatNumber(food.protein_g)}g</p>
                                  <p>🍚 {formatNumber(food.carbohydrates_g)}g</p>
                                  <p>🥑 {formatNumber(food.fat_g)}g</p>
                                </div>
                              </div>
                            ))}
                            <div className="mt-3 pt-2 border-t border-zinc-700">
                              <p className="font-semibold">Total:</p>
                              <div className="grid grid-cols-4 gap-2 text-sm">
                                <p>🔥 {formatNumber(meal.totalCalories)}kcal</p>
                                <p>🥩 {formatNumber(meal.totalProtein)}g</p>
                                <p>🍚 {formatNumber(meal.totalCarbs)}g</p>
                                <p>🥑 {formatNumber(meal.totalFat)}g</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LogMeals;