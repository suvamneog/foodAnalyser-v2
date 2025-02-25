const express = require("express");
const app = express();
const connectDB = require("./db");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/foodRoutes");
const calRoutes = require("./routes/calculator");
const apiRoutes = require("./routes/api");
const mealRoutes = require("./routes/mealRoutes");

// Load environment variables
dotenv.config();

// Database connection
connectDB();

// Middleware
app.use(cors({
  origin: 'https://foodanalyserr.vercel.app/', // Allow only your frontend to access
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Logging middleware

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/auth", userRoutes); // User management routes
app.use("/api/food", apiRoutes, foodRoutes); // Food-related routes
app.use("/api/meal", mealRoutes); // Meal planning routes
app.use("/api/calories", calRoutes); // Calorie calculation routes


app.get("/test", async (req, res) => {
  try {
    let newUser = new User({
      name: "suv",
    });
    await newUser.save();
    console.log(newUser);
    res.send("User saved!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving user");
  }
});

app.get("/food", async (req, res) => {
  try {
    let newFood = new Food({
      name: "Chicken Breast",
      protein: 30,
    });
    await newFood.save();
    console.log(newFood);
    res.send("Food saved!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving food");
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});