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
    console.log(response.data.items);
});

//retrieve history
router.get('/history', auth, async (req, res) => {
    try {
      let userID = req.user.id;  // Get userID from the authenticated user
      let historyResult = await FoodSearch.find({ userID }).sort({ createdAt: -1 });  // Sort by createdAt in descending order
      console.log(historyResult); // Log the result to verify it
      res.json(historyResult); // Return the search history
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving search history');
    }
  });
module.exports = router;