const express = require('express')
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const axios = require("axios");
require("dotenv").config();

router.get('/search',auth, async (req,res) => {
    let query = req.query.q;
    const response = await axios.get(`https://api.calorieninjas.com/v1/nutrition?query=${query}` , {
        headers: { "X-Api-Key": process.env.CALORIE_NINJA_API_KEY }
    });
    res.json(response.data);
})

module.exports = router;