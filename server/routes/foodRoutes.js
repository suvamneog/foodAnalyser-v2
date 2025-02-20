const express = require("express");
const router = express.Router();
const Food = require("../models/food");
const auth = require("../middleware/authMiddleware");
require("dotenv").config();

// Create food
router.post("/", auth, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, pros, cons } = req.body;
    
    const addFood = new Food({
      name,
      calories,
      protein,
      carbs,
      fats,
      pros,
      cons,
      userID: req.user.id,
    });
    
    const savedFood = await addFood.save();
    res.status(201).json(savedFood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all foods for user
router.get("/", auth, async (req, res) => {
  try {
    const foods = await Food.find({ userID: req.user.id })
      .sort({ date: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific food
router.get("/:id", auth, async (req, res) => {
  try {
    const food = await Food.findOne({ 
      _id: req.params.id,
      userID: req.user.id 
    });
    
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update food
router.put("/:id", auth, async (req, res) => {
  try {
    const food = await Food.findOneAndUpdate(
      { _id: req.params.id, userID: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    
    res.json(food);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete food
router.delete("/:id", auth, async (req, res) => {
  try {
    const food = await Food.findOneAndDelete({ 
      _id: req.params.id,
      userID: req.user.id 
    });
    
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    
    res.json({ message: "Food deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;