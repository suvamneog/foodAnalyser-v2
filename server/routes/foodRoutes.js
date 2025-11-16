const express = require("express");
const router = express.Router();
const Food = require("../models/food");
const auth = require("../middleware/authMiddleware");

// Helper function to parse nutrition values (consistent with mealRoutes)
const parseNutritionValue = (value) => {
  if (value === "N/A" || value === undefined || value === null) return 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return Number(cleaned) || 0;
  }
  return Number(value) || 0;
};

// Create food
router.post("/", auth, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, pros, cons } = req.body;
    const userID = req.user.id;

    console.log(`🍎 Creating food for user ${userID}:`, { name, calories });

    // Enhanced validation (similar to mealRoutes)
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Valid food name is required" });
    }
    
    if (calories === undefined || calories === null) {
      return res.status(400).json({ message: "Calories are required" });
    }

    const parsedCalories = parseNutritionValue(calories);
    if (isNaN(parsedCalories) || parsedCalories < 0) {
      return res.status(400).json({ message: "Invalid calories value" });
    }

    // Process pros and cons arrays
    const prosArray = Array.isArray(pros) ? pros : 
                     (typeof pros === 'string' ? pros.split(',').map(p => p.trim()).filter(Boolean) : []);
    const consArray = Array.isArray(cons) ? cons : 
                     (typeof cons === 'string' ? cons.split(',').map(c => c.trim()).filter(Boolean) : []);

    let food;
    try {
      food = await Food.create({
        name: name.trim(),
        calories: parsedCalories,
        protein: parseNutritionValue(protein),
        carbs: parseNutritionValue(carbs),
        fats: parseNutritionValue(fats),
        pros: prosArray,
        cons: consArray,
        userID,
      });

      console.log(`✅ Food created successfully for user ${userID}: ${name}`);
    } catch (dbError) {
      console.error("❌ Database error saving food:", dbError);
      return res.status(500).json({ 
        message: "Error saving food to database", 
        error: dbError.message 
      });
    }

    res.status(201).json(food);
  } catch (error) {
    console.error("❌ Error creating food:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Get all foods for user
router.get("/", auth, async (req, res) => {
  try {
    const userID = req.user.id;

    console.log(`📋 Fetching foods for user ${userID}`);

    const foods = await Food.find({ userID }).sort({ date: -1 });
    
    console.log(`✅ Retrieved ${foods.length} foods for user ${userID}`);
    res.json(foods);
  } catch (error) {
    console.error("❌ Error fetching foods:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Get specific food
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;

    console.log(`🔍 Fetching food ${id} for user ${userID}`);

    const food = await Food.findOne({ 
      _id: id,
      userID 
    });
    
    if (!food) {
      console.log(`❌ Food not found: ${id}`);
      return res.status(404).json({ message: "Food not found" });
    }
    
    console.log(`✅ Found food: ${food.name}`);
    res.json(food);
  } catch (error) {
    console.error("❌ Error fetching food:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Update food
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;
    const { name, calories, protein, carbs, fats, pros, cons } = req.body;

    console.log(`✏️ Updating food ${id} for user ${userID}`);

    // Enhanced validation
    if (name && !name.trim()) {
      return res.status(400).json({ message: "Valid food name is required" });
    }

    if (calories !== undefined) {
      const parsedCalories = parseNutritionValue(calories);
      if (isNaN(parsedCalories) || parsedCalories < 0) {
        return res.status(400).json({ message: "Invalid calories value" });
      }
    }

    // Process pros and cons arrays
    const updateData = { ...req.body };
    if (pros !== undefined) {
      updateData.pros = Array.isArray(pros) ? pros : 
                       (typeof pros === 'string' ? pros.split(',').map(p => p.trim()).filter(Boolean) : []);
    }
    if (cons !== undefined) {
      updateData.cons = Array.isArray(cons) ? cons : 
                       (typeof cons === 'string' ? cons.split(',').map(c => c.trim()).filter(Boolean) : []);
    }

    if (name) updateData.name = name.trim();
    if (calories !== undefined) updateData.calories = parseNutritionValue(calories);
    if (protein !== undefined) updateData.protein = parseNutritionValue(protein);
    if (carbs !== undefined) updateData.carbs = parseNutritionValue(carbs);
    if (fats !== undefined) updateData.fats = parseNutritionValue(fats);

    const food = await Food.findOneAndUpdate(
      { _id: id, userID },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!food) {
      console.log(`❌ Food not found for update: ${id}`);
      return res.status(404).json({ message: "Food not found" });
    }
    
    console.log(`✅ Food updated successfully: ${food.name}`);
    res.json(food);
  } catch (error) {
    console.error("❌ Error updating food:", error);
    res.status(400).json({ 
      message: "Error updating food", 
      error: error.message 
    });
  }
});

// Delete food
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;

    console.log(`🗑️ Deleting food ${id} for user ${userID}`);

    const food = await Food.findOneAndDelete({ 
      _id: id,
      userID 
    });
    
    if (!food) {
      console.log(`❌ Food not found for deletion: ${id}`);
      return res.status(404).json({ message: "Food not found" });
    }
    
    console.log(`✅ Food deleted successfully: ${food.name}`);
    res.json({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting food:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

module.exports = router;