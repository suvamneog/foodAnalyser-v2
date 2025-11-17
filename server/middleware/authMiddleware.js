const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ 
        error: "Access denied. No token provided." 
      });
    }

    // Extract token from "Bearer <token>" format
    const tokenValue = token.replace("Bearer ", "").trim();
    
    if (!tokenValue) {
      return res.status(401).json({ 
        error: "Invalid token format." 
      });
    }

    // Verify token
    const verified = jwt.verify(tokenValue, process.env.JWT_SECRET);
    
    // Optional: Fetch user from database to ensure user still exists
    const user = await User.findById(verified.id).select("-password");
    if (!user) {
      return res.status(401).json({ 
        error: "User not found. Token is invalid." 
      });
    }

    // Attach user to request object
    req.user = {
      id: verified.id,
      email: verified.email,
      name: verified.name,
      // Add any other user fields you need
      ...user._doc
    };

    next();
  } catch (error) {
    console.error("🔐 Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Token has expired. Please login again." 
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Invalid token." 
      });
    }

    if (error.name === "NotBeforeError") {
      return res.status(401).json({ 
        error: "Token not active." 
      });
    }

    // Handle database errors
    if (error.name === "CastError") {
      return res.status(400).json({ 
        error: "Invalid user ID format." 
      });
    }

    res.status(500).json({ 
      error: "Authentication failed.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = authMiddleware;