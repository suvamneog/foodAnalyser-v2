const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Food = require("../models/food");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware")
require("dotenv").config();

//routes
router.get("/", (req, res) => {
  res.send("hello");
});


router.post("/signup", async (req, res, next) => {
  let { name, email, password } = req.body;
  let newUser = new User({
    name,
    email,
    password,
  });
  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: "User already exists" });
  await newUser.save();
  console.log(newUser);
  res.send("user signed!");
});


router.post("/login", async (req, res, next) => {
  let { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });
  const isMatch = bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ message: "Login successful", token });
});


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