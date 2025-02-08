const express = require("express");
const app = express();
const connectDB = require("./db");
const User = require("./models/user");
const Food = require("./models/food");
const userRoutes= require('./routes/userRoutes');
const foodRoutes= require('./routes/foodRoutes');
const apiRoutes= require('./routes/api');
const mealRoutes= require('./routes/mealRoutes');
const dotenv = require("dotenv");
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", userRoutes);
app.use("/api/food", apiRoutes, foodRoutes);
app.use("/api/meal", mealRoutes);

// app.get("/", (req, res) => {
//   res.send("hello");
// });

dotenv.config();
connectDB();

app.get("/test", async (req,res) => {
  let newUser = new User ({
    name : "suv"
  });
  await newUser.save();
  console.log(newUser);
  res.send("User saved!");
});

app.get("/food", async (req,res) => {
  let newFood = new Food ({
    name: "Chicken Breast",
    protein: 30
  });
  await newFood.save();
  console.log(newFood);
  res.send("User saved!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  