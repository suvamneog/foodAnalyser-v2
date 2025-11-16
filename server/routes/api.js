// ------------------------------
// 🇮🇳 Unified Indian Food Search API
// IFCT 2017 + INDB + CalorieNinjas Fallback - OPTIMIZED FOR SWIPING
// ------------------------------

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mongoose = require("mongoose");
const auth = require("../middleware/authMiddleware");
const FoodSearch = require("../models/foodSearch");
require("dotenv").config();

// 🥗 Load IFCT dataset
let ifctData = [];
try {
  const ifctPath = path.resolve(__dirname, "../data/ifct_dataset.json");
  console.log("📄 Loading IFCT data from:", ifctPath);
  ifctData = JSON.parse(fs.readFileSync(ifctPath, "utf-8"));
  console.log(`✅ IFCT dataset loaded (${ifctData.length} Indian foods)`);
} catch (err) {
  console.error("❌ Error loading IFCT dataset:", err.message);
}

// 🍛 Load INDB dataset
let indbData = [];
try {
  const indbPath = path.resolve(__dirname, "../data/indb_dataset.json");
  console.log("📄 Loading INDB data from:", indbPath);
  indbData = JSON.parse(fs.readFileSync(indbPath, "utf-8"));
  console.log(`✅ INDB dataset loaded (${indbData.length} Indian recipes)`);
} catch (err) {
  console.error("❌ Error loading INDB dataset:", err.message);
}

// Helper function to parse nutrition values
function parseNutritionValue(value) {
  if (value === "N/A" || value === undefined || value === null) return 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    return Number(cleaned) || 0;
  }
  return Number(value) || 0;
}

// IMPROVED search function with RANKING - RETURNS MULTIPLE RESULTS
function searchIFCT(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  console.log(`🔍 IFCT SEARCH for: "${query}" (normalized: "${lowerQuery}")`);
  
  // Find ALL matches and rank them
  const allMatches = ifctData.map(item => {
    if (!item.name) return null;
    
    const itemName = item.name.toLowerCase().trim();
    const itemWords = itemName.split(/[\s,]+/);
    
    let score = 0;
    
    // Scoring system:
    // +10 points: Exact name match
    if (itemName === lowerQuery) {
      score += 10;
    }
    
    // +8 points: Query is the first word
    if (itemWords[0] === lowerQuery) {
      score += 8;
    }
    
    // +5 points: Exact word match anywhere
    if (itemWords.some(word => word === lowerQuery)) {
      score += 5;
    }
    
    // +2 points: Contains match
    if (itemName.includes(lowerQuery)) {
      score += 2;
    }
    
    // Bonus/Penalty based on food type
    // Penalize mushroom when searching for meat
    if (lowerQuery === 'chicken' && itemName.includes('mushroom')) {
      score -= 10;
    }
    
    // Bonus for meat-related terms when searching for meat
    if (lowerQuery === 'chicken' && (
      itemName.includes('poultry') || 
      itemName.includes('breast') || 
      itemName.includes('thigh') || 
      itemName.includes('leg') || 
      itemName.includes('wing') ||
      itemName.includes('meat')
    )) {
      score += 3;
    }
    
    return { item, score, name: item.name };
  }).filter(match => match !== null && match.score > 0);

  // Sort by score (highest first)
  allMatches.sort((a, b) => b.score - a.score);
  
  console.log(`📊 IFCT RANKED MATCHES for "${query}": ${allMatches.length} results`);
  allMatches.slice(0, 5).forEach((match, index) => {
    console.log(`   ${index + 1}. "${match.name}" - Score: ${match.score}`);
  });
  
  return allMatches;
}

// Improved INDB search with ranking - RETURNS MULTIPLE RESULTS
function searchINDB(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  console.log(`🔍 INDB SEARCH for: "${query}" (normalized: "${lowerQuery}")`);
  
  const allMatches = indbData.map(item => {
    if (!item.food_name) return null;
    
    const itemName = item.food_name.toLowerCase().trim();
    const itemWords = itemName.split(/[\s,]+/);
    
    let score = 0;
    
    // Scoring system:
    if (itemName === lowerQuery) {
      score += 10;
    }
    
    if (itemWords[0] === lowerQuery) {
      score += 8;
    }
    
    if (itemWords.some(word => word === lowerQuery)) {
      score += 5;
    }
    
    if (itemName.includes(lowerQuery)) {
      score += 2;
    }
    
    return { item, score, name: item.food_name };
  }).filter(match => match !== null && match.score > 0);

  // Sort by score (highest first)
  allMatches.sort((a, b) => b.score - a.score);
  
  console.log(`📊 INDB RANKED MATCHES for "${query}": ${allMatches.length} results`);
  allMatches.slice(0, 5).forEach((match, index) => {
    console.log(`   ${index + 1}. "${match.name}" - Score: ${match.score}`);
  });
  
  return allMatches;
}

// ------------------------------------
// 🔍 Unified Search Endpoint - OPTIMIZED FOR SWIPING
// ------------------------------------
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) {
      return res.status(400).json({ error: "Missing 'q' parameter" });
    }

    console.log(`\n🔍 MAIN SEARCH for: "${query}"`);

    let allResults = [];

    // 🔹 Step 1 — Search IFCT with MULTIPLE RESULTS
    console.log(`🔍 STEP 1: Searching IFCT database...`);
    const ifctResults = searchIFCT(query);

    if (ifctResults.length > 0) {
      console.log(`✅ STEP 1 RESULT: Found ${ifctResults.length} items in IFCT`);
      
      // Take top IFCT results
      const topIfctResults = ifctResults.slice(0, 6).map(match => ({
        source: "IFCT 2017 (ICMR-NIN)",
        name: match.item.name,
        calories: parseFloat((match.item.enerc / 4.184).toFixed(1)),
        protein_g: parseFloat((match.item.protcnt || 0).toFixed(2)),
        carbohydrates_total_g: parseFloat((match.item.choavldf || 0).toFixed(2)),
        fat_total_g: parseFloat((match.item.fatce || 0).toFixed(2)),
        fiber_g: parseFloat((match.item.fibtg || 0).toFixed(2)),
        serving_size_g: 100,
        serving_description: "per 100g edible portion",
        search_score: match.score
      }));

      allResults = [...allResults, ...topIfctResults];
      console.log(`✅ Added ${topIfctResults.length} IFCT results`);
    } else {
      console.log(`❌ STEP 1 RESULT: No match in IFCT for "${query}"`);
    }

    // 🔹 Step 2 — Search INDB with MULTIPLE RESULTS
    console.log(`🔍 STEP 2: Searching INDB database...`);
    const indbResults = searchINDB(query);

    if (indbResults.length > 0) {
      console.log(`✅ STEP 2 RESULT: Found ${indbResults.length} items in INDB`);
      
      // Take top INDB results (limit to avoid too many)
      const topIndbResults = indbResults.slice(0, 4).map(match => ({
        source: "INDB (Indian Nutrient Databank)",
        name: match.item.food_name,
        calories: parseNutritionValue(match.item.energy_kcal || match.item["energy (kcal)"]),
        protein_g: parseNutritionValue(match.item.protein_g || match.item["protein (g)"]),
        carbohydrates_total_g: parseNutritionValue(match.item.carb_g || match.item["carbohydrates (g)"]),
        fat_total_g: parseNutritionValue(match.item.fat_g || match.item["fat (g)"]),
        fiber_g: parseNutritionValue(match.item.fibre_g || match.item["fibre (g)"]),
        serving_size_g: 100,
        serving_description: "per 100g",
        search_score: match.score
      }));

      allResults = [...allResults, ...topIndbResults];
      console.log(`✅ Added ${topIndbResults.length} INDB results`);
    } else {
      console.log(`❌ STEP 2 RESULT: No match in INDB for "${query}"`);
    }

    // 🔹 Step 3 — Global fallback (ONLY if no Indian database matches)
    if (allResults.length === 0) {
      console.log(`🔍 STEP 3: No results in Indian databases, trying CalorieNinjas...`);
      try {
        const calorieNinjaKey = process.env.CALORIE_NINJA_API_KEY;
        
        const response = await axios.get(
          `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
          {
            headers: { 
              "X-Api-Key": calorieNinjaKey,
              "Content-Type": "application/json"
            },
            timeout: 5000
          }
        );

        if (response.data.items?.length > 0) {
          console.log(`✅ STEP 3 RESULT: Found ${response.data.items.length} items in CalorieNinjas`);
          
          const calorieNinjasResults = response.data.items.slice(0, 3).map(item => ({
            source: "CalorieNinjas (Global Fallback)",
            name: item.name,
            calories: item.calories,
            protein_g: item.protein_g,
            carbohydrates_total_g: item.carbohydrates_total_g,
            fat_total_g: item.fat_total_g,
            fiber_g: item.fiber_g || 0,
            sugar_g: item.sugar_g || 0,
            fat_saturated_g: item.fat_saturated_g || 0,
            sodium_mg: item.sodium_mg || 0,
            cholesterol_mg: item.cholesterol_mg || 0,
            serving_size_g: 100,
            serving_description: "per 100g",
            search_score: 1
          }));

          allResults = [...allResults, ...calorieNinjasResults];
          console.log(`✅ Added ${calorieNinjasResults.length} CalorieNinjas results`);
        } else {
          console.log(`❌ STEP 3 RESULT: No results in CalorieNinjas for "${query}"`);
        }
      } catch (err) {
        console.error("⚠️ STEP 3 ERROR: CalorieNinjas API failed:", err.message);
      }
    }

    // Final result processing
    if (allResults.length > 0) {
      // Remove duplicates based on name (case insensitive)
      const uniqueResults = allResults.filter((result, index, self) =>
        index === self.findIndex(r => 
          r.name.toLowerCase() === result.name.toLowerCase()
        )
      );

      // Sort by search score (highest first)
      uniqueResults.sort((a, b) => (b.search_score || 0) - (a.search_score || 0));

      // Remove search_score from final response
      const finalResults = uniqueResults.map(({ search_score, ...rest }) => rest);

      console.log(`🏁 FINAL: Returning ${finalResults.length} unique results`);
      console.log("🏁 Results:", finalResults.map(r => `${r.name} (${r.source})`));
      
      saveSearch(req, query, finalResults[0]); // Save first result to history
      return res.json({ items: finalResults });
    } else {
      // ❌ Not found in any dataset
      console.log(`💀 FINAL RESULT: No results found for "${query}" in any database`);
      return res.status(404).json({
        error: `No results found for "${query}" in IFCT, INDB, or CalorieNinjas.`,
      });
    }
  } catch (error) {
    console.error("❌ UNEXPECTED ERROR in /api/search:", error.message);
    res.status(500).json({ error: "Server error while searching datasets." });
  }
});

// ------------------------------------
// HISTORY ENDPOINTS (FIXED VERSION)
// ------------------------------------

// 📜 Get Search History
router.get("/history", auth, async (req, res) => {
  try {
    console.log(`📜 Fetching history for user: ${req.user.id}`);
    
    const history = await FoodSearch.find({ userID: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(50);

    console.log(`✅ Retrieved ${history.length} history items for user ${req.user.id}`);
    res.json({ history });
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch search history" });
  }
});

// 🗑️ Delete Single History Item
router.delete("/history/:id", auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    
    console.log(`🗑️ Attempting to delete history item: ${itemId} for user: ${req.user.id}`);
    
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      console.log(`❌ Invalid history item ID format: ${itemId}`);
      return res.status(400).json({ 
        error: "Invalid history item ID format",
        receivedId: itemId
      });
    }

    const deletedItem = await FoodSearch.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(itemId),
      userID: req.user.id
    });

    if (!deletedItem) {
      console.log(`❌ History item not found: ${itemId}`);
      return res.status(404).json({ 
        error: "History item not found",
        itemId: itemId
      });
    }

    console.log(`✅ Deleted history item for user ${req.user.id}: ${deletedItem.query}`);
    res.json({ 
      message: "History item deleted successfully",
      deletedItem: {
        id: deletedItem._id,
        query: deletedItem.query
      }
    });
  } catch (error) {
    console.error("❌ Error deleting history item:", error);
    res.status(500).json({ 
      error: "Failed to delete history item",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🗑️ Bulk Delete History Items (FIXED)
router.delete("/history/bulk", auth, async (req, res) => {
  try {
    const { itemIds } = req.body;

    console.log(`🗑️ Bulk delete request for user ${req.user.id}:`, itemIds);

    // Validate request body
    if (!itemIds) {
      return res.status(400).json({ error: "Missing itemIds in request body" });
    }

    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ error: "itemIds must be an array" });
    }

    if (itemIds.length === 0) {
      return res.status(400).json({ error: "No items specified for deletion" });
    }

    // Validate all IDs are valid MongoDB ObjectIds
    const validIds = itemIds.filter(id => {
      if (!id || typeof id !== 'string') {
        console.log(`❌ Invalid ID format: ${id} (type: ${typeof id})`);
        return false;
      }
      
      const isValid = mongoose.Types.ObjectId.isValid(id);
      if (!isValid) {
        console.log(`❌ Invalid ObjectId: ${id}`);
      }
      return isValid;
    });
    
    console.log(`✅ Valid IDs for deletion:`, validIds);

    if (validIds.length === 0) {
      return res.status(400).json({ 
        error: "No valid item IDs provided",
        receivedIds: itemIds,
        validIds: validIds
      });
    }

    // Convert string IDs to ObjectIds for the query
    const objectIds = validIds.map(id => new mongoose.Types.ObjectId(id));

    // Perform the deletion
    const result = await FoodSearch.deleteMany({
      _id: { $in: objectIds },
      userID: req.user.id
    });

    console.log(`✅ Bulk deleted ${result.deletedCount} items for user ${req.user.id}`);
    res.json({ 
      message: `${result.deletedCount} items deleted successfully`,
      deletedCount: result.deletedCount,
      requestedCount: itemIds.length,
      validCount: validIds.length
    });
  } catch (error) {
    console.error("❌ Error bulk deleting history:", error);
    res.status(500).json({ 
      error: "Failed to delete history items",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🗑️ Clear All History (FIXED)
router.delete("/history/clear", auth, async (req, res) => {
  try {
    console.log(`🗑️ Clearing all history for user: ${req.user.id}`);
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database connection not ready');
      return res.status(503).json({ error: "Database connection unavailable" });
    }

    // Use deleteMany to delete all user's history
    const result = await FoodSearch.deleteMany({
      userID: req.user.id
    });

    console.log(`✅ Cleared all history for user ${req.user.id}: ${result.deletedCount} items deleted`);
    res.json({ 
      message: "All history cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("❌ Error clearing history:", error);
    
    let errorMessage = "Failed to clear history";
    
    if (error.name === 'MongoError') {
      errorMessage = "Database error occurred while clearing history";
    } else if (error.name === 'CastError') {
      errorMessage = "Invalid user ID format";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🧪 Test endpoint to verify backend functionality
router.get("/history/test", auth, (req, res) => {
  console.log("✅ History test endpoint hit for user:", req.user.id);
  res.json({ 
    message: "History endpoint working",
    userId: req.user.id,
    timestamp: new Date().toISOString(),
    databaseConnected: mongoose.connection.readyState === 1
  });
});

// 🧾 Helper: Save to User Search History
async function saveSearch(req, query, food) {
  const authHeader = req.header("Authorization");
  if (!authHeader) return;

  try {
    const token = authHeader.replace("Bearer ", "");
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    await FoodSearch.create({ userID: verified.id, query, result: [food] });
    console.log(`💾 Saved search for user ${verified.id}: ${query}`);
  } catch (error) {
    console.log("⚠️ Token invalid or expired. Skipping save.", error.message);
  }
}

module.exports = router;