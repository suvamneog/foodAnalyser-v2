const express = require("express");
const router = express.Router();
const axios = require("axios");
const MealLog = require("../models/mealLog");
const auth = require("../middleware/authMiddleware");

// Log food
router.post("/log", auth, async (req, res) => {
  try {
    const { mealName, foodItems } = req.body;
    const userID = req.user.id;

    // Validate input
    if (!mealName || !foodItems || foodItems.length === 0) {
      return res.status(400).json({ message: "Meal name and food items are required" });
    }

    // Validate each food item
    for (const food of foodItems) {
      if (!food.name || !food.quantity || !food.unit) {
        return res.status(400).json({ message: "Each food item must have a name, quantity, and unit" });
      }
      if (!["g", "pcs"].includes(food.unit)) {
        return res.status(400).json({ message: "Invalid unit. Use 'g' for grams or 'pcs' for quantity." });
      }
      if (isNaN(food.quantity) || Number(food.quantity) <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
    }

    // Get today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let enrichedFoodItems = [];
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

    // Fetch nutrition data for each food item
    for (const food of foodItems) {
      const response = await axios.get(
        `https://api.calorieninjas.com/v1/nutrition?query=${food.quantity} ${food.unit} ${food.name}`,
        {
          headers: { "X-Api-Key": process.env.CALORIE_NINJA_API_KEY },
        }
      );

      if (!response.data.items || response.data.items.length === 0) {
        return res.status(400).json({ message: `No data found for ${food.name}` });
      }

      const foodData = response.data.items[0];
      const foodEntry = {
        name: food.name,
        quantity: Number(food.quantity),
        unit: food.unit,
        calories: Number(foodData.calories.toFixed(2)),
        protein_g: Number(foodData.protein_g.toFixed(2)),
        carbohydrates_g: Number(foodData.carbohydrates_total_g.toFixed(2)),
        fat_g: Number(foodData.fat_total_g.toFixed(2)),
      };

      enrichedFoodItems.push(foodEntry);
      totalCalories += foodEntry.calories;
      totalProtein += foodEntry.protein_g;
      totalCarbs += foodEntry.carbohydrates_g;
      totalFat += foodEntry.fat_g;
    }

    // Round totals to 2 decimal places
    totalCalories = Number(totalCalories.toFixed(2));
    totalProtein = Number(totalProtein.toFixed(2));
    totalCarbs = Number(totalCarbs.toFixed(2));
    totalFat = Number(totalFat.toFixed(2));

    // Check if a meal with the same name exists for the user today
    let existingMeal = await MealLog.findOne({
      userID,
      mealName,
      loggedAt: { $gte: today, $lt: tomorrow },
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
      // Create a new meal log
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
  } catch (error) {
    console.error("Error logging meal:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Fetch logged meals
router.get("/logs", auth, async (req, res) => {
  try {
    const userID = req.user.id;
    const { startDate, endDate, mealType, calories } = req.query;

    let filter = { userID };

    // Validate and apply date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: "Invalid start date" });
      }
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid end date" });
      }
      filter.loggedAt = { $gte: start, $lte: end };
    }

    // Apply meal type filter
    if (mealType) {
      filter.mealName = mealType;
    }

    // Apply calories filter
    if (calories) {
      const targetCalories = Number(calories);
      if (isNaN(targetCalories)) {
        return res.status(400).json({ message: "Invalid calories value" });
      }
      filter.totalCalories = { 
        $gte: targetCalories - 10,
        $lte: targetCalories + 10 
      };
    }

    // Fetch meal logs
    const logs = await MealLog.find(filter).sort({ loggedAt: -1 });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Delete a logged meal
router.delete("/log/:id", auth, async (req, res) => {
  try {
    const { id } = req.params; // Meal log ID
    const userID = req.user.id; // Authenticated user's ID

    // Find the meal log by ID and userID
    const mealLog = await MealLog.findOne({ _id: id, userID });

    if (!mealLog) {
      return res.status(404).json({ message: "Meal log not found or you do not have permission to delete it." });
    }

    // Delete the meal log
    await MealLog.deleteOne({ _id: id });

    res.status(200).json({ message: "Meal log deleted successfully" });
  } catch (error) {
    console.error("Error deleting meal log:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;