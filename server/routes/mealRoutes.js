const express = require("express");
const router = express.Router();
const axios = require("axios");
const MealLog = require("../models/mealLog");
const auth = require("../middleware/authMiddleware");

//log food 
router.post("/log", auth, async (req, res) => {
  let { mealName, foodItems } = req.body;
  let userID = req.user.id;
  if (!mealName || !foodItems || foodItems.length === 0) {
    return res
      .status(400)
      .json({ message: "Meal name and food items are required" });
  }
  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFat = 0;
  let enrichedFoodItems = [];
  for (let food of foodItems) {
    const response = await axios.get(
      `https://api.calorieninjas.com/v1/nutrition?query=${food.name}`,
      {
        headers: { "X-Api-Key": process.env.CALORIE_NINJA_API_KEY },
      }
    );

    let foodData = response.data.items[0]; // First item in API response
    let foodEntry = {
      name: food.name,
      quantity: food.quantity,
      calories: parseFloat(((foodData.calories / 100) * food.quantity).toFixed(2)), 
      protein_g: parseFloat(((foodData.protein_g / 100) * food.quantity).toFixed(2)),
      carbohydrates_g: parseFloat(((foodData.carbohydrates_total_g / 100) * food.quantity).toFixed(2)),
      fat_g: parseFloat(((foodData.fat_total_g / 100) * food.quantity).toFixed(2)),
    };

    enrichedFoodItems.push(foodEntry);
    totalCalories += foodEntry.calories;
    totalProtein += foodEntry.protein_g;
    totalCarbs += foodEntry.carbohydrates_g;
    totalFat += foodEntry.fat_g;
  }

  const mealLog = await MealLog.create({
    userID,
    mealName,
    foodItems: enrichedFoodItems,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
  });
  res.status(201).json(mealLog);
});

//show logged food
router.get("/logs", auth, async (req, res) => {
    try {
      const userID= req.user.id;
      const logs = await MealLog.find({ userID }).sort({ loggedAt: -1 });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meal logs", error: error.message });
    }
  });





module.exports = router;