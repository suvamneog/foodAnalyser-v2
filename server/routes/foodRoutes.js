const express = require("express");
const router = express.Router();
const Food = require("../models/food");
const auth = require("../middleware/authMiddleware");
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
      userID: req.user.id,
    });
    await addFood.save();
    console.log(addFood);
    res.send("Food added!");
  });

//get food
router.get("/", auth, async (req, res) => {
    let food = await Food.find({userID : req.user.id});
    console.log(food);
    res.send("Food!");
});

//specific food
router.get("/:id", auth, async (req, res) => {
    let oneFood = await Food.findById(req.params.id);
    if (!oneFood) return res.status(404).json({ message: "Food not found" });
    console.log(oneFood);
    res.send("Food!");
});

//update food
router.post("/:id", auth, async (req, res) => {
    let newFood = await Food.findByIdAndUpdate(req.params.id, req.body, {new : true});
    console.log(newFood);
    res.send("Food Edited");
});

//delete food
router.delete("/:id", auth, async (req, res) => {
    let deleteFood = await Food.findByIdAndDelete(req.params.id, {new : true});
    console.log(deleteFood);
    res.send("Food Deleted");
});

module.exports = router;