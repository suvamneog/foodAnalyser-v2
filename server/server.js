const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const connectDB = require("./db");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose'); // Add mongoose import

// Load environment variables
dotenv.config();

// Database connection
connectDB();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected for real-time updates:', socket.id);
  
  // Join reviews room
  socket.on('join-reviews', () => {
    socket.join('reviews');
    console.log('📝 User joined reviews room');
  });
  
  // Leave reviews room
  socket.on('leave-reviews', () => {
    socket.leave('reviews');
    console.log('📝 User left reviews room');
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Increase payload size limit
app.use(bodyParser.json({ limit: '10mb' })); // Increase JSON payload limit to 10MB
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Increase URL-encoded payload limit to 10MB

app.use(morgan("dev")); // Logging middleware

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/foodRoutes");
const calRoutes = require("./routes/calculator");
const apiRoutes = require("./routes/api");
const mealRoutes = require("./routes/mealRoutes");
const scanRoutes = require("./routes/scanRoutes");
const imageRoutes = require("./routes/imageRoutes");
const reviewRoutes = require("./routes/reviewsRoutes"); // ✅ ADD REVIEW ROUTES

app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/auth", userRoutes); // User management routes
app.use("/api/food", apiRoutes, foodRoutes); // Food-related routes
app.use("/api/meal", mealRoutes); // Meal planning routes
app.use("/api/calories", calRoutes); // Calorie calculation routes
app.use("/api/scan", scanRoutes); // Barcode scanning routes
app.use("/api/image", imageRoutes); // Image recognition routes
app.use("/api/reviews", reviewRoutes); // ✅ ADD REVIEW ROUTES

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 Global Error Handler:", err.stack);
  
  // Handle MongoDB duplicate key errors
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({ 
      error: "Duplicate entry found",
      message: "This item already exists"
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: "Validation Error",
      message: Object.values(err.errors).map(e => e.message).join(', ')
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: "Invalid token" 
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: "Token expired" 
    });
  }

  // Default error response
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong!"
  });
});

// ✅ FIXED: 404 handler for undefined routes - Use proper Express syntax
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// Start server with HTTP server instead of Express
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io enabled for real-time updates`);
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'https://foodanalyser.onrender.com'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});