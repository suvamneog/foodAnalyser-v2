const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mealLogSchema = new Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mealName: { type: String, required: true },  // e.g., "Breakfast"
    foodItems: [
      {
        name: String,          // "Chicken Breast"
        quantity: Number,      // 200 (grams)
        calories: Number,      // 165
        protein_g: Number,     // 31
        carbohydrates_g: Number, 
        fat_g: Number
      }
    ],
    totalCalories: Number,  // Sum of all food calories
    totalProtein: Number,
    totalCarbs: Number,
    totalFat: Number,
    loggedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("MealLog", mealLogSchema);