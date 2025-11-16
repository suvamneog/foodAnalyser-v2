const express = require("express");
const router = express.Router();
const axios = require("axios");
const MealLog = require("../models/mealLog");
const auth = require("../middleware/authMiddleware");

// 🔍 Nutrition search endpoint (secure CalorieNinjas proxy)
router.get("/nutrition", auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    console.log(`🔍 Backend CalorieNinjas search for: "${query}"`);

    const response = await axios.get(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
      {
        headers: { 
          "X-Api-Key": process.env.CALORIE_NINJA_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 5000
      }
    );

    if (response.data.items?.length > 0) {
      console.log(`✅ Found ${response.data.items.length} items in CalorieNinjas`);
      return res.json({ items: response.data.items });
    } else {
      console.log(`❌ No results in CalorieNinjas for "${query}"`);
      return res.status(404).json({ error: "No results found" });
    }
  } catch (error) {
    console.error("❌ CalorieNinjas API error:", error.message);
    return res.status(500).json({ error: "Nutrition API unavailable" });
  }
});

// Helper function to parse nutrition values
const parseNutritionValue = (value) => {
  if (value === "N/A" || value === undefined || value === null) return 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return Number(cleaned) || 0;
  }
  return Number(value) || 0;
};

// Log food
router.post("/log", auth, async (req, res) => {
  try {
    const { mealName, foodItems } = req.body;
    const userID = req.user.id;

    console.log(`🍽️ Logging meal for user ${userID}:`, { mealName, foodItems });

    // Enhanced validation
    if (!mealName || !mealName.trim()) {
      return res.status(400).json({ message: "Valid meal name is required" });
    }
    
    if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ message: "At least one food item is required" });
    }

    // Validate each food item
    for (const [index, food] of foodItems.entries()) {
      if (!food.name || !food.name.trim()) {
        return res.status(400).json({ message: `Food item #${index+1} missing name` });
      }
      
      if (food.quantity === undefined || food.quantity === null) {
        return res.status(400).json({ message: `Quantity missing for ${food.name}` });
      }
      
      if (!food.unit) {
        return res.status(400).json({ message: `Unit missing for ${food.name}` });
      }
      
      if (!["g", "pcs"].includes(food.unit)) {
        return res.status(400).json({ 
          message: `Invalid unit for ${food.name}. Use 'g' for grams or 'pcs' for pieces.` 
        });
      }
      
      const quantity = Number(food.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity for ${food.name}. Must be positive number.` });
      }
    }

    let enrichedFoodItems = [];
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    let failedItems = [];

    // Process each food item - use the nutrition data sent from frontend
    for (const food of foodItems) {
      // Use the nutrition data that was already fetched by the frontend
      if (food.calories !== undefined && food.protein_g !== undefined) {
        console.log(`✅ Using pre-fetched data for: ${food.name}`);
        
        const foodEntry = {
          name: food.name,
          quantity: Number(food.quantity),
          unit: food.unit,
          calories: parseNutritionValue(food.calories),
          protein_g: parseNutritionValue(food.protein_g),
          carbohydrates_g: parseNutritionValue(food.carbohydrates_g),
          fat_g: parseNutritionValue(food.fat_g),
          fiber_g: parseNutritionValue(food.fiber_g || 0),
          sugar_g: parseNutritionValue(food.sugar_g || 0),
          data_source: food.data_source || 'unknown',
          source: food.source || 'Unknown'
        };

        enrichedFoodItems.push(foodEntry);
        totalCalories += foodEntry.calories;
        totalProtein += foodEntry.protein_g;
        totalCarbs += foodEntry.carbohydrates_g;
        totalFat += foodEntry.fat_g;
      } else {
        console.log(`❌ No nutrition data for: ${food.name}`);
        failedItems.push(food.name);
      }
    }
    
    // If all items failed, return error
    if (enrichedFoodItems.length === 0) {
      return res.status(400).json({ 
        message: "Could not find nutritional data for any of the food items", 
        failedItems 
      });
    }

    // Round totals to 2 decimal places
    totalCalories = Number(totalCalories.toFixed(2));
    totalProtein = Number(totalProtein.toFixed(2));
    totalCarbs = Number(totalCarbs.toFixed(2));
    totalFat = Number(totalFat.toFixed(2));

    console.log(`📊 Meal totals: ${totalCalories} kcal, ${totalProtein}g protein, ${totalCarbs}g carbs, ${totalFat}g fat`);

    // Create a new meal log
    let mealLog;
    try {
      mealLog = await MealLog.create({
        userID,
        mealName,
        foodItems: enrichedFoodItems,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      });

      console.log(`✅ Meal logged successfully for user ${userID}: ${mealName}`);
    } catch (dbError) {
      console.error("❌ Database error saving meal:", dbError);
      return res.status(500).json({ 
        message: "Error saving meal log to database", 
        error: dbError.message 
      });
    }

    // Return response with warnings if some items failed
    if (failedItems.length > 0) {
      return res.status(201).json({
        mealLog,
        warnings: {
          message: "Some items couldn't be analyzed and were skipped",
          failedItems
        }
      });
    }

    res.status(201).json(mealLog);
  } catch (error) {
    console.error("❌ Error logging meal:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
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
    console.log(`📜 Retrieved ${logs.length} meals for user ${userID}`);
    res.json(logs);
  } catch (error) {
    console.error("❌ Error fetching meal logs:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Delete a logged meal
router.delete("/log/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;

    console.log(`🗑️ Deleting meal ${id} for user ${userID}`);

    const mealLog = await MealLog.findOne({ _id: id, userID });

    if (!mealLog) {
      return res.status(404).json({ message: "Meal log not found or you do not have permission to delete it." });
    }

    await MealLog.deleteOne({ _id: id });

    console.log(`✅ Meal ${id} deleted successfully`);
    res.status(200).json({ message: "Meal log deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting meal log:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;