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

// 🆕 Enhanced naming function for Indian foods
function enhanceFoodName(foodItem, source, originalName) {
  const baseName = originalName || foodItem.name || foodItem.food_name || "Unknown Food";
  const lowerName = baseName.toLowerCase();
  
  // Common Indian food variations
  const variations = {
    'idli': ['idly', 'iddly'],
    'puri': ['poori', 'puri'],
    'sambar': ['sambhar', 'sambhar'],
    'dal': ['daal', 'dhal'],
    'roti': ['rotti', 'chapati']
  };
  
  // Standardize names
  let enhancedName = baseName;
  Object.entries(variations).forEach(([standard, alts]) => {
    alts.forEach(alt => {
      if (lowerName.includes(alt)) {
        enhancedName = baseName.replace(new RegExp(alt, 'gi'), standard);
      }
    });
  });
  
  // Add specificity for chicken and meats
  if (lowerName.includes('chicken')) {
    enhancedName = addChickenSpecificity(enhancedName, source, foodItem);
  }
  
  // Add preparation info for INDB items
  if (source.includes('INDB') && foodItem.preparation_method) {
    enhancedName = `${enhancedName} (${foodItem.preparation_method})`;
  }
  
  return enhancedName;
}

// 🆕 Add specificity for chicken results
function addChickenSpecificity(baseName, source, foodItem) {
  const lowerName = baseName.toLowerCase();
  
  // Chicken cuts and parts
  const cuts = {
    'breast': 'Breast', 'thigh': 'Thigh', 'leg': 'Leg', 'wing': 'Wing',
    'drumstick': 'Drumstick', 'whole': 'Whole', 'mince': 'Minced', 'keema': 'Keema',
    'boneless': 'Boneless', 'with bone': 'With Bone', 'skinless': 'Skinless'
  };
  
  // Preparation styles
  const preparations = {
    'curry': 'Curry', 'masala': 'Masala', 'biryani': 'Biryani', 'tandoori': 'Tandoori',
    'fried': 'Fried', 'roast': 'Roasted', 'grilled': 'Grilled', 'stew': 'Stew',
    'butter': 'Butter', 'kadhai': 'Kadhai', 'handi': 'Handi', 'korma': 'Korma'
  };
  
  let specificName = baseName;
  let foundCut = '';
  let foundPrep = '';
  
  // Identify cut/part
  Object.entries(cuts).forEach(([key, value]) => {
    if (lowerName.includes(key)) {
      foundCut = value;
      // Only modify if not already descriptive
      if (!specificName.includes(value)) {
        specificName = specificName.replace(/chicken/gi, `Chicken ${value}`);
      }
    }
  });
  
  // Identify preparation style
  Object.entries(preparations).forEach(([key, value]) => {
    if (lowerName.includes(key) && !specificName.includes(value)) {
      foundPrep = value;
      specificName = `${specificName} ${value}`;
    }
  });
  
  // Add source context
  if (source.includes('IFCT') && !foundPrep) {
    specificName = `${specificName} (Raw)`;
  } else if (source.includes('INDB') && !foundPrep) {
    specificName = `${specificName} (Prepared)`;
  }
  
  return {
    displayName: specificName.trim(),
    cut: foundCut,
    preparation: foundPrep,
    isRaw: source.includes('IFCT') && !foundPrep,
    isCooked: source.includes('INDB') || !!foundPrep
  };
}

// 🆕 Smart grouping to avoid duplicate chicken results
function groupAndDiversifyResults(results, query) {
  if (results.length <= 6) return results;
  
  const lowerQuery = query.toLowerCase();
  
  // Only group for generic queries like "chicken", "rice", etc.
  const shouldGroup = lowerQuery.includes('chicken') || 
                     lowerQuery.includes('rice') || 
                     lowerQuery.includes('dal') ||
                     lowerQuery.includes('paneer');
  
  if (!shouldGroup) return results.slice(0, 6);
  
  const groups = {
    raw: [],
    curry: [],
    fried: [],
    grilled: [],
    biryani: [],
    traditional: [],
    other: []
  };
  
  results.forEach(result => {
    const name = result.displayName.toLowerCase();
    const source = result.source || '';
    
    if (name.includes('raw') || (source.includes('IFCT') && !name.includes('curry'))) {
      groups.raw.push(result);
    } else if (name.includes('curry') || name.includes('masala') || name.includes('gravy')) {
      groups.curry.push(result);
    } else if (name.includes('fried')) {
      groups.fried.push(result);
    } else if (name.includes('grilled') || name.includes('roast') || name.includes('tandoori')) {
      groups.grilled.push(result);
    } else if (name.includes('biryani') || name.includes('pulao')) {
      groups.biryani.push(result);
    } else if (name.includes('butter') || name.includes('kadhai') || name.includes('korma')) {
      groups.traditional.push(result);
    } else {
      groups.other.push(result);
    }
  });
  
  // Take best from each group
  const finalResults = [];
  Object.values(groups).forEach(group => {
    if (group.length > 0) {
      // Sort by search score and take the best one
      const bestInGroup = group.sort((a, b) => (b.search_score || 0) - (a.search_score || 0))[0];
      finalResults.push(bestInGroup);
    }
  });
  
  // Sort final results by search score
  return finalResults.sort((a, b) => (b.search_score || 0) - (a.search_score || 0)).slice(0, 6);
}

// IMPROVED search function with RANKING
function searchIFCT(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  console.log(`🔍 IFCT SEARCH for: "${query}" (normalized: "${lowerQuery}")`);
  
  const allMatches = ifctData.map(item => {
    if (!item.name) return null;
    
    const itemName = item.name.toLowerCase().trim();
    const itemWords = itemName.split(/[\s,]+/);
    
    let score = 0;
    
    // Scoring system
    if (itemName === lowerQuery) score += 10;
    if (itemWords[0] === lowerQuery) score += 8;
    if (itemWords.some(word => word === lowerQuery)) score += 5;
    if (itemName.includes(lowerQuery)) score += 2;
    
    // Bonus for Indian food relevance
    if (lowerQuery.includes('chicken') && itemName.includes('chicken')) {
      if (itemName.includes('breast') || itemName.includes('thigh') || itemName.includes('leg')) {
        score += 3;
      }
    }
    
    return score > 0 ? { item, score, name: item.name } : null;
  }).filter(match => match !== null);

  allMatches.sort((a, b) => b.score - a.score);
  
  console.log(`📊 IFCT RANKED MATCHES for "${query}": ${allMatches.length} results`);
  
  return allMatches;
}

// Improved INDB search with ranking
function searchINDB(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  console.log(`🔍 INDB SEARCH for: "${query}" (normalized: "${lowerQuery}")`);
  
  const allMatches = indbData.map(item => {
    if (!item.food_name) return null;
    
    const itemName = item.food_name.toLowerCase().trim();
    const itemWords = itemName.split(/[\s,]+/);
    
    let score = 0;
    
    if (itemName === lowerQuery) score += 10;
    if (itemWords[0] === lowerQuery) score += 8;
    if (itemWords.some(word => word === lowerQuery)) score += 5;
    if (itemName.includes(lowerQuery)) score += 2;
    
    // Bonus for traditional preparations
    if (lowerQuery.includes('chicken') && itemName.includes('chicken')) {
      if (itemName.includes('curry') || itemName.includes('biryani') || itemName.includes('masala')) {
        score += 3;
      }
    }
    
    return score > 0 ? { item, score, name: item.food_name } : null;
  }).filter(match => match !== null);

  allMatches.sort((a, b) => b.score - a.score);
  
  console.log(`📊 INDB RANKED MATCHES for "${query}": ${allMatches.length} results`);
  
  return allMatches;
}

// ------------------------------------
// 🔍 Enhanced Search Endpoint
// ------------------------------------
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) {
      return res.status(400).json({ error: "Missing 'q' parameter" });
    }

    console.log(`\n🔍 MAIN SEARCH for: "${query}"`);

    let allResults = [];

    // 🔹 Step 1 — Search IFCT
    console.log(`🔍 STEP 1: Searching IFCT database...`);
    const ifctResults = searchIFCT(query);

    if (ifctResults.length > 0) {
      console.log(`✅ STEP 1 RESULT: Found ${ifctResults.length} items in IFCT`);
      
      const topIfctResults = ifctResults.slice(0, 4).map(match => {
        const enhanced = addChickenSpecificity(match.item.name, "IFCT 2017", match.item);
        
        return {
          source: "IFCT 2017 (ICMR-NIN)",
          name: enhanced.displayName,
          displayName: enhanced.displayName,
          cut: enhanced.cut,
          preparation: enhanced.preparation,
          isRaw: enhanced.isRaw,
          isCooked: enhanced.isCooked,
          calories: parseFloat((match.item.enerc / 4.184).toFixed(1)),
          protein_g: parseFloat((match.item.protcnt || 0).toFixed(2)),
          carbohydrates_total_g: parseFloat((match.item.choavldf || 0).toFixed(2)),
          fat_total_g: parseFloat((match.item.fatce || 0).toFixed(2)),
          fiber_g: parseFloat((match.item.fibtg || 0).toFixed(2)),
          serving_size_g: 100,
          serving_description: "per 100g edible portion",
          search_score: match.score
        };
      });

      allResults = [...allResults, ...topIfctResults];
    }

    // 🔹 Step 2 — Search INDB
    console.log(`🔍 STEP 2: Searching INDB database...`);
    const indbResults = searchINDB(query);

    if (indbResults.length > 0) {
      console.log(`✅ STEP 2 RESULT: Found ${indbResults.length} items in INDB`);
      
      const topIndbResults = indbResults.slice(0, 5).map(match => {
        const enhanced = addChickenSpecificity(match.item.food_name, "INDB", match.item);
        
        return {
          source: "INDB (Indian Nutrient Databank)",
          name: enhanced.displayName,
          displayName: enhanced.displayName,
          cut: enhanced.cut,
          preparation: enhanced.preparation,
          isRaw: enhanced.isRaw,
          isCooked: enhanced.isCooked,
          calories: parseNutritionValue(match.item.energy_kcal || match.item["energy (kcal)"]),
          protein_g: parseNutritionValue(match.item.protein_g || match.item["protein (g)"]),
          carbohydrates_total_g: parseNutritionValue(match.item.carb_g || match.item["carbohydrates (g)"]),
          fat_total_g: parseNutritionValue(match.item.fat_g || match.item["fat (g)"]),
          fiber_g: parseNutritionValue(match.item.fibre_g || match.item["fibre (g)"]),
          serving_size_g: 100,
          serving_description: "per 100g",
          search_score: match.score
        };
      });

      allResults = [...allResults, ...topIndbResults];
    }

    // 🔹 Step 3 — Global fallback (ONLY if no Indian database matches)
    if (allResults.length === 0) {
      console.log(`🔍 STEP 3: Trying CalorieNinjas fallback...`);
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
          const calorieNinjasResults = response.data.items.slice(0, 3).map(item => ({
            source: "CalorieNinjas (Global Fallback)",
            name: item.name,
            displayName: item.name,
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
        }
      } catch (err) {
        console.error("STEP 3 ERROR: CalorieNinjas API failed:", err.message);
      }
    }

    // Final result processing
    if (allResults.length > 0) {
      // Remove duplicates based on display name
      const uniqueResults = allResults.filter((result, index, self) =>
        index === self.findIndex(r => 
          r.displayName.toLowerCase() === result.displayName.toLowerCase()
        )
      );

      // Smart grouping for diverse results
      const diversifiedResults = groupAndDiversifyResults(uniqueResults, query);

      // Sort by search score
      diversifiedResults.sort((a, b) => (b.search_score || 0) - (a.search_score || 0));

      // Remove search_score from final response
      const finalResults = diversifiedResults.map(({ search_score, ...rest }) => rest);

      console.log(`🏁 FINAL: Returning ${finalResults.length} diverse results`);
      console.log("🏁 Results:", finalResults.map(r => `${r.displayName} (${r.source})`));
      
      saveSearch(req, query, finalResults[0]);
      return res.json({ items: finalResults });
    } else {
      console.log(`💀 FINAL RESULT: No results found for "${query}"`);
      return res.status(404).json({
        error: `No results found for "${query}" in our databases.`,
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

// ------------------------------------
// HISTORY ENDPOINTS (FIXED VERSION - REORDERED)
// ------------------------------------

// 🗑️ Clear All History (MOVE THIS BEFORE :id)
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

// 🗑️ Bulk Delete History Items (MOVE THIS BEFORE :id TOO)
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

// 📜 Get Search History (KEEP THIS BEFORE :id)
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

// 🗑️ Delete Single History Item (THIS SHOULD BE LAST)
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