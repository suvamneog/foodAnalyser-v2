const express = require("express");
const router = express.Router();
const Food = require("../models/food");
const auth = require("../middleware/authMiddleware");
const { findById } = require("../models/user");
require("dotenv").config();

//create food
router.post("/", auth, async (req, res) => {
    let { name, calories, protein, carbs, fats } = req.body;
    let addFood = new Food({
      name,
      calories,
      carbs,
      protein,
      fats,
      user: req.user.id,
    });
    await addFood.save();
    console.log(addFood);
    res.send("Food added!");
  });
  

//get food
router.get("/", auth, async (req, res) => {
    let food = await Food.find({user : req.user.id});
    console.log(food);
    res.send("Food!");
});

//specific food
router.get("/:id", auth, async (req, res) => {
    let oneFood = await Food.findById(req.params.id);
    if (!oneFood) return res.status(404).json({ message: "Food not found" });
    console.log(oneFood);
    res.send("Food!");
})



  module.exports = router;