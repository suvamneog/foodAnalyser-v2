const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const connectDB = require("./db");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const passport = require("passport");

dotenv.config();
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-reviews", () => {
    socket.join("reviews");
  });

  socket.on("leave-reviews", () => {
    socket.leave("reviews");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("dev"));
app.use(passport.initialize());

const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/foodRoutes");
const calRoutes = require("./routes/calculator");
const apiRoutes = require("./routes/api");
const scanRoutes = require("./routes/scanRoutes");
const imageRoutes = require("./routes/imageRoutes");
const reviewRoutes = require("./routes/reviewsRoutes");
const syncRoutes = require("./routes/syncRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/food", apiRoutes, foodRoutes);
app.use("/api/calories", calRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/sync", syncRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);

  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(400).json({
      error: "Duplicate entry found",
      message: "This item already exists",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development" ? err.message : "Something went wrong!",
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io enabled for real-time updates`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
