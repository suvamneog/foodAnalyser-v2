const express = require("express");
const router = express.Router();
const Food = require("../models/food");
const auth = require("../middleware/authMiddleware")
require("dotenv").config();


router.post("/", auth, async (req, res) => {
    let { name, calories, protein, carbs, fats } = req.body;
    let getFood = new Food({
      name,
      calories,
      carbs,
      protein,
      fats,
      user: req.user.id,
    });
    await getFood.save();
    console.log(getFood);
    res.send("Food added!");
  });
  
  module.exports = router;