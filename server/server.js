const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const connectDB = require("./db");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

// Load environment variables
dotenv.config();

// Database connection
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Increase payload size limit
app.use(bodyParser.json({ limit: '10mb' })); // Increase JSON payload limit to 10MB
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Increase URL-encoded payload limit to 10MB

app.use(morgan("dev")); // Logging middlewares

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/foodRoutes");
const calRoutes = require("./routes/calculator");
const apiRoutes = require("./routes/api");
const mealRoutes = require("./routes/mealRoutes");
const scanRoutes = require("./routes/scanRoutes");
const imageRoutes = require("./routes/imageRoutes");

app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/auth", userRoutes); // User management routes
app.use("/api/food", apiRoutes, foodRoutes); // Food-related routes
app.use("/api/meal", mealRoutes); // Meal planning routes
app.use("/api/calories", calRoutes); // Calorie calculation routes
app.use("/api/scan", scanRoutes); // Barcode scanning routes
app.use("/api/image", imageRoutes); // Image recognition routes

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