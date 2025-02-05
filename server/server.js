const express = require("express");
const app = express();
const foodRoutes = require("./routes/foodRoutes");
const connectDB = require("./db");
const User = require("./models/user")
const Food = require("./models/food")
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/", foodRoutes); 

// app.get("/", (req, res) => {
//   res.send("hello");
// });


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
  