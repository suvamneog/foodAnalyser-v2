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
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Load custom GI dataset
const readFile = promisify(fs.readFile);
const indianFoodDataPath = path.join(process.cwd(), 'data', 'indian_food_db.json');
let indianFoodData = [];

const loadIndianFoodData = async () => {
  try {
    const data = await readFile(indianFoodDataPath, 'utf8');
    indianFoodData = JSON.parse(data);
    console.log('Indian food database loaded successfully');
  } catch (error) {
    console.error('Error loading Indian food database:', error);
    indianFoodData = [];
  }
};

loadIndianFoodData();

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

// API endpoint
router.post('/analyzefood', upload.single('foodImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    // Read the image file
    const imageBytes = fs.readFileSync(req.file.path);
    const base64Image = imageBytes.toString('base64');

    // Step 1: Use OpenAI's GPT-4 Turbo Vision API
    console.log('Sending request to OpenAI GPT-4 Turbo Vision API...');
    
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",  // Use GPT-4 Turbo with vision capabilities
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What food item is shown in this image? Respond with just the name of the food and nothing else. If it's an Indian dish, please be specific with the Indian name." },
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

    // Extract the text response from GPT-4 Turbo Vision
    const foodName = visionResponse.choices[0].message.content.trim().split('\n')[0].replace(/^[^a-zA-Z]+/, '');
    console.log('Identified food:', foodName);

    // Step 2: Fetch nutrition data
    let nutritionInfo;
    let giValue;
    const indianFoodMatch = indianFoodData.find(
      food => food.name.toLowerCase() === foodName.toLowerCase()
    );

    if (indianFoodMatch) {
      console.log('Found match in Indian food database');
      nutritionInfo = {
        calories: indianFoodMatch.calories,
        protein: indianFoodMatch.protein,
        carbs: indianFoodMatch.carbs,
        fats: indianFoodMatch.fats
      };
      giValue = indianFoodMatch.gi;
    } else {
      console.log('Searching OpenFoodFacts database...');
      const openFoodResponse = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1`
      );
      const openFoodData = await openFoodResponse.json();
      if (openFoodData.products && openFoodData.products.length > 0) {
        console.log('Found match in OpenFoodFacts database');
        const product = openFoodData.products[0];
        nutritionInfo = {
          calories: product.nutriments['energy-kcal_100g'] || 0,
          protein: product.nutriments.proteins_100g || 0,
          carbs: product.nutriments.carbohydrates_100g || 0,
          fats: product.nutriments.fat_100g || 0
        };
        const fiber = product.nutriments.fiber_100g || 0;
        const sugarRatio = (product.nutriments.sugars_100g || 0) / nutritionInfo.carbs;
        if (sugarRatio > 0.5) {
          giValue = 70;
        } else if (fiber > 5) {
          giValue = 45;
        } else {
          giValue = 55;
        }
      } else {
        console.log('No match found, using default nutrition values');
        nutritionInfo = {
          calories: 200,
          protein: 5,
          carbs: 25,
          fats: 10
        };
        giValue = 55;
      }
    }

    // Step 3: Use GPT-4 Turbo for healthier alternatives
    console.log('Requesting healthier alternatives from OpenAI...');

    const prompt = `Suggest 3 healthier alternatives to ${foodName} that are common in Indian cuisine. For each alternative, provide the name, estimated calories, and glycemic index (GI). Format the response as a valid JSON array with objects having properties: name, calories, gi`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",  // Use GPT-4 Turbo for consistent model usage
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    let alternatives = [];
    try {
      const cleanedResponse = completion.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
      alternatives = JSON.parse(cleanedResponse);
      console.log('Successfully parsed alternatives');
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      alternatives = [];
    }

    // Step 4: Calculate health score and return results
    const healthScore = calculateHealthScore(nutritionInfo, giValue);
    const result = {
      foodName,
      confidence: 95.0,
      nutrition: nutritionInfo,
      gi: giValue,
      healthScore,
      alternatives
    };

    console.log('Analysis completed successfully');
    fs.unlinkSync(req.file.path);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error analyzing food image:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ error: 'Failed to analyze food image', details: error.message });
  }
});

module.exports = router;