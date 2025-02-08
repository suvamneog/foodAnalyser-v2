const express = require('express')
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const FoodSearch = require("../models/foodSearch");
const axios = require("axios");
require("dotenv").config();

router.get('/search', auth, async (req,res) => {
    let query = req.query.q;
    let userID = req.user.id;
    const response = await axios.get(`https://api.calorieninjas.com/v1/nutrition?query=${query}` , {
        headers: { "X-Api-Key": process.env.CALORIE_NINJA_API_KEY }
    });
    await FoodSearch.create({ userID, query, result: response.data.items });
    res.json(response.data);
    console.log(response.data);
});

//retrieve history
router.get('/history', auth, async (req, res) => {
    let userID = req.user.id;
    let historyResult = await FoodSearch.find({userID}).sort({ createdAt: -1 });
    console.log(historyResult);
    res.send("History retrieved!");
});

module.exports = router;