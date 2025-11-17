const express = require('express');
const OpenAI = require('openai');
const sharp = require('sharp');
const router = express.Router();

// In-memory cache for IFCT data and analysis results
const cache = {
  ifctData: null,
  ifctIndex: new Map(),
  analysisResults: new Map(),
  foodAlternatives: new Map()
};

// Cache TTL (1 hour)
const CACHE_TTL = 60 * 60 * 1000;

// Load IFCT 2017 dataset with indexing
const loadIFCTData = async () => {
  if (cache.ifctData) {
    console.log("✅ IFCT data already loaded from cache");
    return;
  }

  try {
    const filePath = path.resolve(__dirname, "/Users/suvamneog/foodanalyserr/server/data/ifct_dataset.json");
    console.log("📄 Loading IFCT data for image analysis...");
    const data = await fs.promises.readFile(filePath, 'utf8');
    cache.ifctData = JSON.parse(data);
    
    // Build search index for faster lookups
    cache.ifctData.forEach(item => {
      if (item.name) {
        const keywords = item.name.toLowerCase().split(/[\s-,]+/);
        keywords.forEach(keyword => {
          if (keyword.length > 2) {
            if (!cache.ifctIndex.has(keyword)) {
              cache.ifctIndex.set(keyword, []);
            }
            cache.ifctIndex.get(keyword).push(item);
          }
        });
      }
    });
    
    console.log(`✅ IFCT dataset loaded and indexed (${cache.ifctData.length} foods, ${cache.ifctIndex.size} keywords)`);
  } catch (error) {
    console.error('❌ Error loading IFCT dataset for image analysis:', error);
    cache.ifctData = [];
  }
};

// Pre-load data on startup
loadIFCTData();

// Initialize OpenAI with timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 2
});

// Helper function to calculate health score
const calculateHealthScore = (nutrition, gi) => {
  const { calories, protein, fats } = nutrition;
  
  let score = 100;
  
  if (calories > 500) score -= Math.min(30, (calories - 500) / 20);
  
  if (gi > 70) score -= 25;
  else if (gi > 55) score -= 12;
  else if (gi < 35) score += 10;
  
  const fatRatio = (fats * 9) / calories;
  if (fatRatio > 0.3) score -= Math.min(25, (fatRatio - 0.3) * 100);
  
  const proteinRatio = (protein * 4) / calories;
  if (proteinRatio > 0.15) score += Math.min(15, (proteinRatio - 0.15) * 100);
  
  return Math.min(100, Math.max(0, Math.round(score)));
};

// Optimized IFCT search
const searchIFCTFood = (foodName) => {
  if (!cache.ifctData || cache.ifctData.length === 0) return null;
  
  const query = foodName.toLowerCase().trim();
  if (query.length < 2) return null;

  // Exact match
  const exactMatch = cache.ifctData.find(item => 
    item.name?.toLowerCase() === query
  );
  if (exactMatch) return exactMatch;

  // Index-based search
  const queryWords = query.split(/[\s-,]+/).filter(word => word.length > 2);
  let bestMatch = null;
  let bestScore = 0;

  for (const item of cache.ifctData) {
    let score = 0;
    const itemName = item.name?.toLowerCase() || '';
    
    queryWords.forEach(word => {
      if (itemName.includes(word)) score += 3;
      if (itemName === word) score += 10;
      if (itemName.startsWith(word)) score += 2;
    });

    if (item.scie?.toLowerCase().includes(query)) score += 2;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }

    if (bestScore >= 8) break;
  }

  return bestScore > 2 ? bestMatch : null;
};

// Image optimization
const optimizeImage = async (imageBuffer) => {
  try {
    return await sharp(imageBuffer)
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 80,
        mozjpeg: true 
      })
      .toBuffer();
  } catch (error) {
    console.warn('Image optimization failed, using original');
    return imageBuffer;
  }
};

// Process image with OpenAI Vision
const identifyFoodWithVision = async (base64Image) => {
  const visionResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Identify the SINGLE main food item in this image. If it's Indian food, provide the specific Indian name. Respond with ONLY the food name in English, nothing else." 
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
    max_tokens: 30
  });

  return visionResponse.choices[0].message.content.trim().replace(/[."]/g, '');
};

// Memory storage for multer
const storage = {
  _handleFile: function (req, file, cb) {
    const chunks = [];
    file.stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    file.stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      cb(null, {
        buffer: buffer,
        size: buffer.length
      });
    });
    file.stream.on('error', cb);
  },
  _removeFile: function (req, file, cb) {
    delete file.buffer;
    cb(null);
  }
};

const upload = require('multer')({ storage });

// API endpoint for food image analysis
router.post('/analyzefood', upload.single('foodImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const startTime = Date.now();
  
  try {
    console.log('🖼️ Optimizing image...');
    const optimizedImage = await optimizeImage(req.file.buffer);
    const base64Image = optimizedImage.toString('base64');

    console.log('🔍 Identifying food from image...');
    const foodName = await identifyFoodWithVision(base64Image);
    console.log('✅ Identified food:', foodName);

    // Check cache
    const cacheKey = `analysis-${Buffer.from(foodName).toString('base64')}`;
    const cachedResult = cache.analysisResults.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL) {
      console.log('⚡ Serving from cache');
      return res.json(cachedResult.data);
    }

    // Search IFCT database
    console.log('🔍 Searching IFCT database...');
    const foodMatch = searchIFCTFood(foodName);

    let nutritionInfo, giValue;

    if (foodMatch) {
      console.log('✅ Found in IFCT database:', foodMatch.name);
      
      nutritionInfo = {
        calories: foodMatch.enerc ? Math.round(foodMatch.enerc / 4.184) : 0,
        protein: Math.round(foodMatch.protcnt || 0),
        carbs: Math.round(foodMatch.choavldf || 0),
        fats: Math.round(foodMatch.fatce || 0),
        fiber: Math.round(foodMatch.fibtg || 0)
      };

      // Smart GI estimation
      if (foodMatch.choavldf > 60) giValue = 75;
      else if (foodMatch.fibtg > 6) giValue = 45;
      else if (foodMatch.fatce > 15) giValue = 55;
      else giValue = 60;
      
    } else {
      console.log('⚠️ Using estimated nutrition data');
      const commonFoods = {
        'roti': { calories: 120, protein: 3, carbs: 20, fats: 2, gi: 65 },
        'rice': { calories: 130, protein: 2, carbs: 28, fats: 0, gi: 73 },
        'dal': { calories: 100, protein: 6, carbs: 15, fats: 1, gi: 45 },
        'chicken': { calories: 165, protein: 31, carbs: 0, fats: 3, gi: 0 },
        'samosa': { calories: 250, protein: 4, carbs: 30, fats: 12, gi: 65 },
        'idli': { calories: 60, protein: 2, carbs: 12, fats: 0, gi: 70 },
        'dosa': { calories: 150, protein: 4, carbs: 25, fats: 4, gi: 68 }
      };

      const lowerFoodName = foodName.toLowerCase();
      const match = Object.keys(commonFoods).find(key => lowerFoodName.includes(key));
      
      if (match) {
        nutritionInfo = commonFoods[match];
        giValue = nutritionInfo.gi;
        delete nutritionInfo.gi;
      } else {
        nutritionInfo = { calories: 200, protein: 5, carbs: 25, fats: 10 };
        giValue = 60;
      }
    }

    // Get alternatives
    console.log('💡 Getting healthier alternatives...');
    let alternatives = [];

    if (foodMatch) {
      const similarFoods = cache.ifctData
        .filter(item => {
          if (!item.grup || item.grup !== foodMatch.grup) return false;
          if (item.name === foodMatch.name) return false;
          
          const itemCalories = item.enerc ? (item.enerc / 4.184) : Infinity;
          const matchCalories = foodMatch.enerc ? (foodMatch.enerc / 4.184) : 0;
          
          return itemCalories < matchCalories * 0.9;
        })
        .slice(0, 3);

      alternatives = similarFoods.map(item => ({
        name: item.name,
        calories: item.enerc ? Math.round(item.enerc / 4.184) : 0,
        gi: (item.fibtg > 7 ? 40 : item.fibtg > 4 ? 50 : 60),
        reason: `Healthier alternative with lower calories`
      }));
    }

    // Fallback to GPT
    if (alternatives.length === 0) {
      try {
        const prompt = `Suggest 2 healthier Indian food alternatives to ${foodName}. Respond ONLY with JSON: [{"name":"","calories":0,"gi":0,"reason":""}]`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,
        });

        const cleanedResponse = completion.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
        alternatives = JSON.parse(cleanedResponse);
      } catch (e) {
        console.error('Error getting alternatives:', e);
        alternatives = [];
      }
    }

    const healthScore = calculateHealthScore(nutritionInfo, giValue);
    
    const result = {
      foodName,
      confidence: 95.0,
      nutrition: nutritionInfo,
      gi: giValue,
      healthScore,
      alternatives: alternatives.slice(0, 3),
      source: foodMatch ? "IFCT 2017" : "Estimated",
      scientificName: foodMatch?.scie || "",
      processingTime: Date.now() - startTime
    };

    // Cache the result
    cache.analysisResults.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.log(`✅ Analysis completed in ${result.processingTime}ms`);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error analyzing food image:', error);
    
    res.status(500).json({ 
      error: 'Failed to analyze food image', 
      details: error.message
    });
  }
});

// Quick health score endpoint
router.post('/quick-score', upload.single('foodImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const startTime = Date.now();

  try {
    const optimizedImage = await optimizeImage(req.file.buffer);
    const base64Image = optimizedImage.toString('base64');

    const foodName = await identifyFoodWithVision(base64Image);
    
    const foodMatch = searchIFCTFood(foodName);
    let nutritionInfo, giValue;

    if (foodMatch) {
      nutritionInfo = {
        calories: foodMatch.enerc ? Math.round(foodMatch.enerc / 4.184) : 0,
        protein: Math.round(foodMatch.protcnt || 0),
        carbs: Math.round(foodMatch.choavldf || 0),
        fats: Math.round(foodMatch.fatce || 0)
      };
      giValue = foodMatch.fibtg > 6 ? 45 : 60;
    } else {
      nutritionInfo = { calories: 200, protein: 5, carbs: 25, fats: 10 };
      giValue = 60;
    }

    const healthScore = calculateHealthScore(nutritionInfo, giValue);

    res.json({
      foodName,
      healthScore,
      calories: nutritionInfo.calories,
      quick: true,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('❌ Quick analysis failed:', error);
    res.status(500).json({ error: 'Quick analysis failed' });
  }
});

// Cache info endpoint
router.get('/cache-info', (req, res) => {
  res.json({
    ifctData: cache.ifctData ? cache.ifctData.length : 0,
    analysisCache: cache.analysisResults.size,
    alternativesCache: cache.foodAlternatives.size
  });
});

module.exports = router;