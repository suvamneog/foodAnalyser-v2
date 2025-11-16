const express = require('express');
const OpenAI = require('openai');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { promisify } = require('util');
const router = express.Router();

// Setup file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Load IFCT 2017 dataset (same as your api.js)
let ifctData = [];
const loadIFCTData = async () => {
  try {
    const filePath = path.resolve(__dirname, "../data/ifct_dataset.json");
    console.log("📄 Loading IFCT data for image analysis...");
    const data = await readFile(filePath, 'utf8');
    ifctData = JSON.parse(data);
    console.log(`✅ IFCT dataset loaded for image analysis (${ifctData.length} foods)`);
  } catch (error) {
    console.error('❌ Error loading IFCT dataset for image analysis:', error);
    ifctData = [];
  }
};

const readFile = promisify(fs.readFile);
loadIFCTData();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to calculate health score
const calculateHealthScore = (nutrition, gi) => {
  let score = 100;
  const calorieRatio = nutrition.calories / 500;
  if (calorieRatio > 1) score -= (calorieRatio - 1) * 20;
  if (gi > 70) score -= 20;
  else if (gi > 55) score -= 10;
  const fatCalories = nutrition.fats * 9;
  const fatRatio = fatCalories / nutrition.calories;
  if (fatRatio > 0.3) score -= (fatRatio - 0.3) * 100;
  const proteinCalories = nutrition.protein * 4;
  const proteinRatio = proteinCalories / nutrition.calories;
  if (proteinRatio > 0.2) score += (proteinRatio - 0.2) * 50;
  return Math.min(100, Math.max(0, Math.round(score)));
};

// Helper function to search IFCT data
const searchIFCTFood = (foodName) => {
  const query = foodName.toLowerCase();
  
  const matches = ifctData.filter((item) => {
    const name = item.name?.toLowerCase() || "";
    const scie = item.scie?.toLowerCase() || "";
    const tags = item.tags?.toLowerCase() || "";
    
    return (
      name.includes(query) ||
      scie.includes(query) ||
      tags.includes(query) ||
      query.includes(name) ||
      name.split(' ').some(word => word.includes(query)) ||
      query.split(' ').some(qWord => name.includes(qWord))
    );
  });

  return matches.length > 0 ? matches[0] : null;
};

// API endpoint for food image analysis
router.post('/analyzefood', upload.single('foodImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    // Read the image file
    const imageBytes = fs.readFileSync(req.file.path);
    const base64Image = imageBytes.toString('base64');

    // Step 1: Use OpenAI's GPT-4 Turbo Vision API to identify food
    console.log('🔍 Identifying food from image...');
    
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Identify the food item in this image. If it's Indian food, provide the specific Indian name. Respond with ONLY the food name in English." 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 50
    });

    // Extract the food name from response
    const foodName = visionResponse.choices[0].message.content.trim();
    console.log('✅ Identified food:', foodName);

    // Step 2: Search in IFCT 2017 database
    let nutritionInfo = null;
    let giValue = 55; // Default GI
    let foodMatch = null;

    console.log('🔍 Searching IFCT 2017 database...');
    foodMatch = searchIFCTFood(foodName);

    if (foodMatch) {
      console.log('✅ Found in IFCT database:', foodMatch.name);
      
      // Convert IFCT data to nutrition format
      nutritionInfo = {
        calories: foodMatch.enerc ? (foodMatch.enerc / 4.184).toFixed(1) : 0, // kJ to kcal
        protein: foodMatch.protcnt || 0,
        carbs: foodMatch.choavldf || 0,
        fats: foodMatch.fatce || 0,
        fiber: foodMatch.fibtg || 0
      };

      // Estimate GI based on food characteristics
      if (foodMatch.choavldf > 50) giValue = 70;
      else if (foodMatch.fibtg > 5) giValue = 45;
      else giValue = 55;
      
    } else {
      console.log('❌ Not found in IFCT, using fallback nutrition data');
      // Fallback nutrition data for common Indian foods
      const fallbackNutrition = {
        'roti': { calories: 120, protein: 3, carbs: 20, fats: 2 },
        'rice': { calories: 130, protein: 2, carbs: 28, fats: 0 },
        'dal': { calories: 100, protein: 6, carbs: 15, fats: 1 },
        'chicken curry': { calories: 200, protein: 20, carbs: 5, fats: 10 },
        'samosa': { calories: 250, protein: 4, carbs: 30, fats: 12 },
        'idli': { calories: 60, protein: 2, carbs: 12, fats: 0 },
        'dosa': { calories: 150, protein: 4, carbs: 25, fats: 4 }
      };

      const lowerFoodName = foodName.toLowerCase();
      nutritionInfo = fallbackNutrition[lowerFoodName] || { 
        calories: 200, protein: 5, carbs: 25, fats: 10 
      };
    }

    // Step 3: Get healthier alternatives using IFCT data
    console.log('💡 Generating healthier alternatives...');
    let alternatives = [];

    if (foodMatch) {
      // Find similar but healthier foods from IFCT
      const similarFoods = ifctData.filter(item => {
        if (item.grup === foodMatch.grup && item.name !== foodMatch.name) {
          const itemCalories = item.enerc ? (item.enerc / 4.184) : 0;
          const matchCalories = foodMatch.enerc ? (foodMatch.enerc / 4.184) : 0;
          return itemCalories < matchCalories && (item.fibtg || 0) > (foodMatch.fibtg || 0);
        }
        return false;
      }).slice(0, 3);

      alternatives = similarFoods.map(item => ({
        name: item.name,
        calories: item.enerc ? (item.enerc / 4.184).toFixed(1) : 0,
        gi: (item.fibtg > 5 ? 45 : 55), // Estimate GI based on fiber
        reason: `Lower calories and higher fiber than ${foodName}`
      }));
    }

    // If no alternatives found from IFCT, use GPT as fallback
    if (alternatives.length === 0) {
      try {
        const prompt = `Suggest 2 healthier Indian food alternatives to ${foodName}. For each, provide name, estimated calories, and brief reason. Format as JSON array: [{"name": "", "calories": 0, "gi": 0, "reason": ""}]`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
        });

        const cleanedResponse = completion.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
        alternatives = JSON.parse(cleanedResponse);
      } catch (e) {
        console.error('Error getting alternatives from OpenAI:', e);
        alternatives = [];
      }
    }

    // Step 4: Calculate health score and return results
    const healthScore = calculateHealthScore(nutritionInfo, giValue);
    
    const result = {
      foodName,
      confidence: 95.0,
      nutrition: nutritionInfo,
      gi: giValue,
      healthScore,
      alternatives,
      source: foodMatch ? "IFCT 2017" : "Estimated",
      scientificName: foodMatch?.scie || ""
    };

    console.log('✅ Analysis completed successfully');
    
    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('❌ Error analyzing food image:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ 
      error: 'Failed to analyze food image', 
      details: error.message 
    });
  }
});

// Test endpoint to check IFCT integration
router.get('/test-ifct', (req, res) => {
  const testFoods = ['rice', 'roti', 'dal', 'chicken'].map(food => {
    const match = searchIFCTFood(food);
    return {
      food,
      found: !!match,
      match: match ? match.name : null
    };
  });

  res.json({
    ifctDataLoaded: ifctData.length,
    testResults: testFoods,
    sampleFoods: ifctData.slice(0, 5).map(item => item.name)
  });
});

module.exports = router;