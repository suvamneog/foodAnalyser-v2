/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";
import axios from 'axios';

function logMeals() {
  const [meals, setMeals] = useState([]);
  const [foodItems, setFoodItems] = useState([{
    name: '',
    quantity: ''
  }]);
  const [mealName, setMealName] = useState('');
  const token = localStorage.getItem("authToken");

  const fetchMeals = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/meal/logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeals(response.data);
    } catch (error) {
      console.error("Error fetching meals:", error);
    }
  };

  useEffect(() => {
    if (token) fetchMeals();
  }, [token]);

  const handleFoodItemChange = (index, field, value) => {
    const newFoodItems = [...foodItems];
    newFoodItems[index] = {
      ...newFoodItems[index],
      [field]: field === 'quantity' ? Number(value) : value
    };
    setFoodItems(newFoodItems);
  };

  const addFoodItem = () => {
    setFoodItems([...foodItems, {
      name: '',
      quantity: ''
    }]);
  };

  const removeFoodItem = (index) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newMeal = {
      mealName,
      foodItems: foodItems.map(item => ({
        name: item.name,
        quantity: Number(item.quantity)
      }))
    };

    try {
      await axios.post("http://localhost:3000/api/meal/log", newMeal, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
      setMealName('');
      setFoodItems([{
        name: '',
        quantity: ''
      }]);

      // Fetch updated meals
      await fetchMeals();
    } catch (error) {
      console.error("Error logging meal:", error);
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

    // Format all values to 2 decimal places
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
            <div className="bg-zinc-900 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-2">Log Your Meal</h2>
              <p className="text-gray-400 mb-4">Track your daily nutrition intake</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Meal Name"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full bg-zinc-800 rounded-lg p-3 border border-zinc-700"
                  required
                />
                
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Food Name"
                        value={item.name}
                        onChange={(e) => handleFoodItemChange(index, 'name', e.target.value)}
                        className="bg-zinc-700 rounded-lg p-3 border border-zinc-600"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Quantity (g)"
                        value={item.quantity}
                        onChange={(e) => handleFoodItemChange(index, 'quantity', e.target.value)}
                        className="bg-zinc-700 rounded-lg p-3 border border-zinc-600"
                        required
                      />
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
                  className="w-full bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Log Meal
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
                    <p className="text-2xl font-bold">{totals.calories}</p>
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
                            <h4 className="font-bold">{meal.mealName}</h4>
                            {meal.foodItems.map((food, foodIndex) => (
                              <div key={`${meal._id}-food-${foodIndex}`} className="mt-2">
                                <p className="text-gray-400">{food.name} - {food.quantity}g</p>
                                <div className="grid grid-cols-4 gap-2 mt-1 text-sm">
                                  <p> {formatNumber(food.calories)}</p>
                                  <p>🥩 {formatNumber(food.protein_g)}g</p>
                                  <p>🍚 {formatNumber(food.carbohydrates_g)}g</p>
                                  <p>🥑 {formatNumber(food.fat_g)}g</p>
                                </div>
                              </div>
                            ))}
                            <div className="mt-3 pt-2 border-t border-zinc-700">
                              <p className="font-semibold">Total:</p>
                              <div className="grid grid-cols-4 gap-2 text-sm">
                                <p>🔥 {formatNumber(meal.totalCalories)}</p>
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

export default logMeals;