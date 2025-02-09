const express = require("express");
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.post("/calculator", async (req, res) => {
  try {
    const { weight, height, age, gender, activityMultiplier, calorieDeficit } = req.body;

    if (!weight || !height || !age || gender === undefined || !activityMultiplier) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let BMR;
    if (gender === 1) {
      // Male
      BMR = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      // Female
      BMR = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const TDEE = BMR * activityMultiplier;

    // Apply calorie deficit (percentage-based)
    const calorieGoal = TDEE * (1 - calorieDeficit / 100);

    // Calculate Daily Protein Goal (1.6 to 2.2g per kg based on activity level)
    let proteinPerKg;
    if (activityMultiplier <= 1.2) {
      proteinPerKg = 1.2; // Sedentary
    } else if (activityMultiplier <= 1.5) {
      proteinPerKg = 1.6; // Light activity
    } else if (activityMultiplier <= 1.8) {
      proteinPerKg = 1.8; // Moderate activity
    } else {
      proteinPerKg = 2.2; // High activity
    }

    const dailyProteinGoal = weight * proteinPerKg; // in grams

    // Respond with calculated values
    res.json({
      BMR: Math.round(BMR),
      TDEE: Math.round(TDEE),
      calorieGoal: Math.round(calorieGoal),
      dailyProteinGoal: Math.round(dailyProteinGoal),
    });

  } catch (error) {
    res.status(500).json({ message: "Error calculating calories", error: error.message });
  }
});

module.exports = router;