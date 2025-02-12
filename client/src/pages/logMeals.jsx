/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from 'react';
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";

function logMeals() {
  const [meals, setMeals] = useState([]);
  const [formData, setFormData] = useState({
    mealName: '',
    name: '',
    quantity: '',
    calories: '',
    protein_g: '',
    carbohydrates_g: '',
    fat_g: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMeal = {
      ...formData,
      id: Date.now(),
      quantity: Number(formData.quantity),
      calories: Number(formData.calories),
      protein_g: Number(formData.protein_g),
      carbohydrates_g: Number(formData.carbohydrates_g),
      fat_g: Number(formData.fat_g)
    };
    setMeals(prev => [...prev, newMeal]);
    setFormData({
      mealName: '',
      name: '',
      quantity: '',
      calories: '',
      protein_g: '',
      carbohydrates_g: '',
      fat_g: ''
    });
  };

  const calculateDailyTotals = () => {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein_g: acc.protein_g + meal.protein_g,
      carbohydrates_g: acc.carbohydrates_g + meal.carbohydrates_g,
      fat_g: acc.fat_g + meal.fat_g
    }), { calories: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0 });
  };

  const totals = calculateDailyTotals();

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-6">
    <div className="absolute inset-0 pointer-events-none">
    <StarsBackground />
    <ShootingStars />
</div>
    <div className="min-h-screen p-8 mt-20">
      <div className="max-w-4xl mx-auto">

        <div className="bg-zinc-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Log Your Meal</h2>
          <p className="text-gray-400 mb-4">Track your daily nutrition intake</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="mealName"
              placeholder="Meal Name"
              value={formData.mealName}
              onChange={handleInputChange}
              className="w-full bg-zinc-800 rounded-lg p-3 border border-zinc-700"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Food Name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-zinc-800 rounded-lg p-3 border border-zinc-700"
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity (g)"
                value={formData.quantity}
                onChange={handleInputChange}
                className="bg-zinc-800 rounded-lg p-3 border border-zinc-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="number"
                name="calories"
                placeholder="Calories"
                value={formData.calories}
                onChange={handleInputChange}
                className="bg-zinc-800 rounded-lg p-3 border border-zinc-700"
                required
              />
              <input
                type="number"
                name="protein_g"
                placeholder="Protein (g)"
                value={formData.protein_g}
                onChange={handleInputChange}
                className="bg-zinc-800 rounded-lg p-3 border border-zinc-700"
                required
              />
              <input
                type="number"
                name="carbohydrates_g"
                placeholder="Carbs (g)"
                value={formData.carbohydrates_g}
                onChange={handleInputChange}
                className="bg-zinc-800 rounded-lg p-3 border border-zinc-700"
                required
              />
              <input
                type="number"
                name="fat_g"
                placeholder="Fat (g)"
                value={formData.fat_g}
                onChange={handleInputChange}
                className="bg-zinc-800 rounded-lg p-3 border border-zinc-700"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Log Meal
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">Daily Intake</h2>
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
            <h2 className="text-2xl font-bold mb-2">Recent Meals</h2>
            <p className="text-gray-400 mb-4">Your logged meals</p>
            
            <div className="space-y-4">
              {meals.length === 0 ? (
                <p className="text-gray-400">No meal logs available</p>
              ) : (
                meals.map(meal => (
                  <div key={meal.id} className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-bold">{meal.mealName}</h3>
                    <p className="text-gray-400">{meal.name} - {meal.quantity}g</p>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                      <p>🔥 {meal.calories}</p>
                      <p>🥩 {meal.protein_g}g</p>
                      <p>🍚 {meal.carbohydrates_g}g</p>
                      <p>🥑 {meal.fat_g}g</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default logMeals;