const express = require("express");
const router = express.Router();
const axios = require("axios");
const MealLog = require("../models/mealLog");
const auth = require("../middleware/authMiddleware");

// Indian food dataset with nutritional values per 100g
const indianFoodDataset = {
  // Breads (existing)
  "chapati": { calories: 297, protein_g: 9.6, carbohydrates_g: 46, fat_g: 9.1 },
  "naan": { calories: 317, protein_g: 9.6, carbohydrates_g: 50, fat_g: 10 },
  "paratha": { calories: 326, protein_g: 6, carbohydrates_g: 46, fat_g: 12 },
  "ragi roti": { calories: 110, protein_g: 3, carbohydrates_g: 15, fat_g: 3 },

  // Rice dishes (existing)
  "biryani": { calories: 350, protein_g: 12, carbohydrates_g: 45, fat_g: 15 },
  "pulao": { calories: 200, protein_g: 5, carbohydrates_g: 35, fat_g: 8 },
  "jeera rice": { calories: 190, protein_g: 3, carbohydrates_g: 35, fat_g: 5 },
  "curd rice": { calories: 170, protein_g: 4, carbohydrates_g: 24, fat_g: 5 },
  "lemon rice": { calories: 180, protein_g: 3, carbohydrates_g: 30, fat_g: 6 },
  "tamarind rice": { calories: 200, protein_g: 4, carbohydrates_g: 28, fat_g: 8 },
  "khichdi": { calories: 230, protein_g: 7, carbohydrates_g: 32, fat_g: 8 },

  // Lentils and legumes (existing)
  "dal": { calories: 105, protein_g: 6, carbohydrates_g: 17, fat_g: 1.5 },
  "sambar": { calories: 75, protein_g: 3.5, carbohydrates_g: 10, fat_g: 2 },
  "rasam": { calories: 60, protein_g: 2, carbohydrates_g: 8, fat_g: 1 },
  "rajma": { calories: 210, protein_g: 9, carbohydrates_g: 32, fat_g: 6 },
  "chole": { calories: 220, protein_g: 10, carbohydrates_g: 30, fat_g: 8 },
  "kadhi": { calories: 160, protein_g: 5, carbohydrates_g: 15, fat_g: 9 },

  // Vegetables & gravies (existing)
  "sabji": { calories: 120, protein_g: 3, carbohydrates_g: 15, fat_g: 5 },
  "palak paneer": { calories: 220, protein_g: 10, carbohydrates_g: 12, fat_g: 15 },
  "aloo gobi": { calories: 150, protein_g: 4, carbohydrates_g: 20, fat_g: 6 },
  "butter chicken": { calories: 430, protein_g: 25, carbohydrates_g: 12, fat_g: 30 },
  "korma (veg)": { calories: 280, protein_g: 7, carbohydrates_g: 18, fat_g: 20 },
  "egg curry": { calories: 210, protein_g: 13, carbohydrates_g: 10, fat_g: 12 },
  "fish curry": { calories: 250, protein_g: 22, carbohydrates_g: 8, fat_g: 14 },

  // Dairy (existing)
  "paneer": { calories: 265, protein_g: 18, carbohydrates_g: 1.2, fat_g: 20 },
  "lassi": { calories: 120, protein_g: 4, carbohydrates_g: 15, fat_g: 5 },
  "curd": { calories: 60, protein_g: 3.5, carbohydrates_g: 5, fat_g: 3 },
  "badam milk": { calories: 180, protein_g: 6, carbohydrates_g: 18, fat_g: 9 },
  "haldi doodh": { calories: 130, protein_g: 4, carbohydrates_g: 12, fat_g: 6 },
  "masala chaas": { calories: 60, protein_g: 3, carbohydrates_g: 5, fat_g: 3 },

  // Breakfast (existing)
  "dosa": { calories: 180, protein_g: 4.5, carbohydrates_g: 28, fat_g: 5.5 },
 "vada": { calories: 217, protein_g: 6, carbohydrates_g: 26, fat_g: 9 },
  "poha": { calories: 250, protein_g: 5, carbohydrates_g: 50, fat_g: 4 },
  "upma": { calories: 180, protein_g: 4, carbohydrates_g: 30, fat_g: 5 },
  "quinoa upma": { calories: 180, protein_g: 6, carbohydrates_g: 20, fat_g: 6 },
  "oats dosa": { calories: 120, protein_g: 4, carbohydrates_g: 16, fat_g: 3 },

  // Snacks (existing)
  "samosa": { calories: 262, protein_g: 3.5, carbohydrates_g: 30, fat_g: 14 },
  "pakora": { calories: 180, protein_g: 3, carbohydrates_g: 20, fat_g: 10 },
  "bhelpuri": { calories: 150, protein_g: 4, carbohydrates_g: 25, fat_g: 5 },
  "veg kebab": { calories: 150, protein_g: 5, carbohydrates_g: 18, fat_g: 6 },
  "paneer tikka": { calories: 280, protein_g: 15, carbohydrates_g: 10, fat_g: 20 },
  "tandoori chicken": { calories: 260, protein_g: 28, carbohydrates_g: 6, fat_g: 14 },

  // Beverages (existing)
  "chai": { calories: 60, protein_g: 1, carbohydrates_g: 10, fat_g: 2 },
  "coffee": { calories: 50, protein_g: 0.5, carbohydrates_g: 8, fat_g: 1 },
  "chia lassi": { calories: 100, protein_g: 4, carbohydrates_g: 8, fat_g: 5 },

  // Sweets (existing)
  "gulab jamun": { calories: 350, protein_g: 5, carbohydrates_g: 45, fat_g: 15 },
  "jalebi": { calories: 200, protein_g: 1, carbohydrates_g: 50, fat_g: 5 },
  "rasgulla": { calories: 120, protein_g: 2, carbohydrates_g: 25, fat_g: 1 },
  "barfi": { calories: 180, protein_g: 3, carbohydrates_g: 30, fat_g: 6 },
  "sooji halwa": { calories: 210, protein_g: 3, carbohydrates_g: 30, fat_g: 10 },
  "malpua": { calories: 300, protein_g: 4, carbohydrates_g: 40, fat_g: 15 },
  "kheer": { calories: 220, protein_g: 6, carbohydrates_g: 28, fat_g: 10 },
  "modak": { calories: 190, protein_g: 3, carbohydrates_g: 25, fat_g: 8 },

  // Assamese Cuisine (new additions)
  "khar": { calories: 90, protein_g: 3, carbohydrates_g: 12, fat_g: 3 },
"masor tenga": { calories: 180, protein_g: 18, carbohydrates_g: 8, fat_g: 9 },
"alu pitika": { calories: 120, protein_g: 2.5, carbohydrates_g: 20, fat_g: 4 },
"pitha": { calories: 150, protein_g: 3, carbohydrates_g: 28, fat_g: 2 },
  "poita bhat": { calories: 130, protein_g: 3.5, carbohydrates_g: 25, fat_g: 2 },
  "duck curry (assamese style)": { calories: 280, protein_g: 22, carbohydrates_g: 10, fat_g: 16 },
  "ou tenga curry": { calories: 110, protein_g: 2, carbohydrates_g: 15, fat_g: 5 },
  "xoru bhaat": { calories: 140, protein_g: 3, carbohydrates_g: 30, fat_g: 2 },
  "koldil chicken": { calories: 240, protein_g: 20, carbohydrates_g: 8, fat_g: 14 },
  "boror tenga": { calories: 100, protein_g: 2, carbohydrates_g: 18, fat_g: 3 }
};

const findIndianFoodMatch = (foodName) => {
  // Normalize the input by trimming and converting to lowercase
  const normalizedInput = foodName.trim().toLowerCase();
  
  // First try exact match with the normalized input
  if (indianFoodDataset[normalizedInput]) {
    return normalizedInput;
  }
  
  // Then try partial matches with word boundaries
  return Object.keys(indianFoodDataset).find(key => {
    const normalizedKey = key.trim().toLowerCase();
    return (
      normalizedInput.includes(normalizedKey) || 
      normalizedKey.includes(normalizedInput)
    );
  });
};

// Log food
router.post("/log", auth, async (req, res) => {
  try {
    const { mealName, foodItems } = req.body;
    const userID = req.user.id;

    // Enhanced validation
    if (!mealName || !mealName.trim()) {
      return res.status(400).json({ message: "Valid meal name is required" });
    }
    
    if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ message: "At least one food item is required" });
    }

    // Validate each food item with more detailed errors
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
      
      // Prevent unreasonable values
      if (quantity > 5000 && food.unit === 'g') {
        return res.status(400).json({ 
          message: `Quantity for ${food.name} (${quantity}g) seems too high. Please verify.` 
        });
      }
      
      if (quantity > 100 && food.unit === 'pcs') {
        return res.status(400).json({ 
          message: `Quantity for ${food.name} (${quantity} pieces) seems too high. Please verify.` 
        });
      }
    }

    // Get today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let enrichedFoodItems = [];
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    let failedItems = [];

    // Fetch nutrition data for each food item
    for (const food of foodItems) {
      let foodData = null;
      let sourceData = "api"; // Track data source for debugging
      
      try {
        // First try the APINinjas API with timeout protection
        const response = await axios.get(
          `https://api.api-ninjas.com/v1/nutrition?query=${food.quantity} ${food.unit} ${food.name}`,
          {
            headers: { "X-Api-Key": process.env.CALORIE_NINJA_API_KEY },
            timeout: 5000 // 5 second timeout
          }
        );

        if (response.data.items && response.data.items.length > 0) {
          foodData = response.data.items[0];
        } 
      } catch (apiError) {
        console.error("API Error for food:", food.name, apiError.message);
        // Don't return error here - we'll try fallback
      }
      
      // If API failed, check our Indian food dataset
      if (!foodData) {
        const indianFood = findIndianFoodMatch(food.name);
        sourceData = "dataset";

        if (indianFood) {
          const baseData = indianFoodDataset[indianFood];
          // Calculate based on quantity
          const multiplier = food.unit === 'g' ? 
            (food.quantity / 100) : 
            (food.quantity * (baseData.calories/1000)); // Rough estimate for pieces
          
          foodData = {
            name: indianFood,
            calories: baseData.calories * multiplier,
            protein_g: baseData.protein_g * multiplier,
            carbohydrates_total_g: baseData.carbohydrates_g * multiplier,
            fat_total_g: baseData.fat_g * multiplier
          };
        }
      }
      
      // If we still don't have data
      if (!foodData) {
        failedItems.push(food.name);
        continue; // Skip this item instead of failing the whole request
      }

      // Ensure values are positive
      const calories = Math.max(0, Number(foodData.calories || 0));
      const protein = Math.max(0, Number(foodData.protein_g || 0));
      const carbs = Math.max(0, Number(foodData.carbohydrates_total_g || 0));
      const fat = Math.max(0, Number(foodData.fat_total_g || 0));

      const foodEntry = {
        name: food.name,
        quantity: Number(food.quantity),
        unit: food.unit,
        calories: Number(calories.toFixed(2)),
        protein_g: Number(protein.toFixed(2)),
        carbohydrates_g: Number(carbs.toFixed(2)),
        fat_g: Number(fat.toFixed(2)),
        data_source: sourceData
      };

      enrichedFoodItems.push(foodEntry);
      totalCalories += foodEntry.calories;
      totalProtein += foodEntry.protein_g;
      totalCarbs += foodEntry.carbohydrates_g;
      totalFat += foodEntry.fat_g;
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

    // Check if a meal with the same name exists for the user today
    let existingMeal = await MealLog.findOne({
      userID,
      mealName,
      loggedAt: { $gte: today, $lt: tomorrow },
    }).catch(err => {
      console.error("Database error when finding meal:", err);
      return null;
    });

    let mealLog;
    try {
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
    } catch (dbError) {
      console.error("Database error saving meal:", dbError);
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
    console.error("Error logging meal:", error);
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