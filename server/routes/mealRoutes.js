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

  // Get today's date boundaries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let enrichedFoodItems = [];
  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFat = 0;

  // Process new food items
  for (let food of foodItems) {
    const response = await axios.get(
      `https://api.calorieninjas.com/v1/nutrition?query=${food.name}`,
      {
        headers: { "X-Api-Key": process.env.CALORIE_NINJA_API_KEY },
      }
    );

    let foodData = response.data.items[0];
    let foodEntry = {
      name: food.name,
      quantity: Number(food.quantity),
      calories: Number(((foodData.calories / 100) * food.quantity).toFixed(2)),
      protein_g: Number(((foodData.protein_g / 100) * food.quantity).toFixed(2)),
      carbohydrates_g: Number(((foodData.carbohydrates_total_g / 100) * food.quantity).toFixed(2)),
      fat_g: Number(((foodData.fat_total_g / 100) * food.quantity).toFixed(2)),
    };

    enrichedFoodItems.push(foodEntry);
    totalCalories += foodEntry.calories;
    totalProtein += foodEntry.protein_g;
    totalCarbs += foodEntry.carbohydrates_g;
    totalFat += foodEntry.fat_g;
  }

  // Format totals to 2 decimal places
  totalCalories = Number(totalCalories.toFixed(2));
  totalProtein = Number(totalProtein.toFixed(2));
  totalCarbs = Number(totalCarbs.toFixed(2));
  totalFat = Number(totalFat.toFixed(2));

  // Check if meal already exists for today
  let existingMeal = await MealLog.findOne({
    userID,
    mealName,
    loggedAt: {
      $gte: today,
      $lt: tomorrow
    }
  });

  let mealLog;
  if (existingMeal) {
    // Update existing meal
    existingMeal.foodItems.push(...enrichedFoodItems);
    existingMeal.totalCalories = Number((existingMeal.totalCalories + totalCalories).toFixed(2));
    existingMeal.totalProtein = Number((existingMeal.totalProtein + totalProtein).toFixed(2));
    existingMeal.totalCarbs = Number((existingMeal.totalCarbs + totalCarbs).toFixed(2));
    existingMeal.totalFat = Number((existingMeal.totalFat + totalFat).toFixed(2));
    
    mealLog = await existingMeal.save();
  } else {
    // Create new meal
    mealLog = await MealLog.create({
      userID,
      mealName,
      foodItems: enrichedFoodItems,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    });
  }

  res.status(201).json(mealLog);
});

//show logged food
router.get("/logs", auth, async (req, res) => {
  try {
    const userID = req.user.id;
    const { startDate, endDate, mealType, calories } = req.query;

    let filter = { userID };

    if (startDate && endDate) {
      filter.loggedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (mealType) {
      filter.mealName = mealType;
    }
    if (calories) {
      const targetCalories = Number(calories);
      filter.totalCalories = { 
        $gte: targetCalories - 10,
        $lte: targetCalories + 10 
      };
    }
    const logs = await MealLog.find(filter).sort({ loggedAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meal logs", error: error.message });
  }
});

module.exports = router;