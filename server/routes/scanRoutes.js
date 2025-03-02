const express = require("express");
const router = express.Router();
const Food = require("../models/food");
const auth = require("../middleware/authMiddleware");
const { model } = require("mongoose");
require("dotenv").config();

// Get product info from OpenFoodFacts API
router.get('/product/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    if (data.status === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching product info:', error);
    res.status(500).json({ error: 'Error fetching product information' });
  }
});
module.exports = router;