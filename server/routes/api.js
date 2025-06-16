const express = require('express')
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const FoodSearch = require("../models/foodSearch");
const axios = require("axios");
const jwt = require("jsonwebtoken"); // Add this import
require("dotenv").config();

// Public search endpoint - no auth required
router.get('/search', async (req, res) => {
    let query = req.query.q;
    const response = await axios.get(`https://api.calorieninjas.com/v1/nutrition?query=${query}`, {
        headers: { "X-Api-Key": process.env.CALORIE_NINJA_API_KEY }
    });

    // If user is authenticated, save the search to history
    const authHeader = req.header("Authorization");
    if (authHeader) {
        try {
            const token = authHeader.replace("Bearer ", "");
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            await FoodSearch.create({ 
                userID: verified.id, 
                query, 
                result: response.data.items 
            });
            console.log("Search saved to history for user:", verified.id);
        } catch (error) {
            console.log("Error saving to history:", error.message);
        }
    }

    res.json(response.data);
});

// Protected history endpoint - auth required
router.get('/history', auth, async (req, res) => {
    try {
        let userID = req.user.id;
        let historyResult = await FoodSearch.find({ userID }).sort({ createdAt: -1 });
        res.json(historyResult);
    } catch (error) {
        console.error("Error retrieving history:", error);
        res.status(500).send('Error retrieving search history');
    }
});

module.exports = router;