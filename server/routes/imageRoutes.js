const express = require('express');
const OpenAI = require('openai');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { lookupGlycemicIndex, classifyGi } = require('../utils/verifiedGi');

const router = express.Router();

const cache = {
  ifctData: null,
  ifctIndex: new Map(),
};

const loadIFCTData = async () => {
  if (cache.ifctData) return;

  try {
    const filePath = path.resolve(__dirname, '../data/ifct_dataset.json');
    const data = await fs.promises.readFile(filePath, 'utf8');
    cache.ifctData = JSON.parse(data);

    cache.ifctData.forEach((item) => {
      if (item.name) {
        const keywords = item.name.toLowerCase().split(/[\s-,]+/);
        keywords.forEach((keyword) => {
          if (keyword.length > 2) {
            if (!cache.ifctIndex.has(keyword)) cache.ifctIndex.set(keyword, []);
            cache.ifctIndex.get(keyword).push(item);
          }
        });
      }
    });

    console.log(
      `✅ IFCT dataset loaded for image analysis (${cache.ifctData.length} foods)`
    );
  } catch (error) {
    console.error('❌ Error loading IFCT dataset for image analysis:', error);
    cache.ifctData = [];
  }
};

loadIFCTData();

let openai = null;
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 45000,
      maxRetries: 2,
    });
  }
  return openai;
};

const ALIASES = {
  'butter chicken': ['chicken curry', 'chicken'],
  'masala dosa': ['dosa'],
  'plain dosa': ['dosa'],
  biryani: ['rice', 'chicken'],
  'chicken biryani': ['biryani', 'rice'],
  'rajma chawal': ['rajma', 'kidney bean', 'rice'],
  'chole bhature': ['chole', 'chickpea'],
  'pav bhaji': ['vegetable'],
  'paneer butter masala': ['paneer'],
  'fish curry': ['fish'],
  'dal baati': ['dal'],
  'rogan josh': ['mutton', 'lamb'],
  khichdi: ['rice', 'dal'],
};

const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

const nutritionFromIfct = (item, portionGrams = 100) => {
  const factor = (Number(portionGrams) || 100) / 100;
  return {
    calories: Math.round(((item.enerc ? item.enerc / 4.184 : 0) * factor)),
    protein: round1((item.protcnt || 0) * factor),
    carbs: round1((item.choavldf || 0) * factor),
    fats: round1((item.fatce || 0) * factor),
    fiber: round1((item.fibtg || 0) * factor),
  };
};

const scaleNutrition = (per100, portionGrams = 100) => {
  const factor = (Number(portionGrams) || 100) / 100;
  return {
    calories: Math.round((per100.calories || 0) * factor),
    protein: round1((per100.protein || 0) * factor),
    carbs: round1((per100.carbs || 0) * factor),
    fats: round1((per100.fats || 0) * factor),
    fiber: round1((per100.fiber || 0) * factor),
  };
};

const calculateHealthScore = (nutrition, gi) => {
  const { calories, protein, fats } = nutrition;
  if (!calories || calories <= 0) return null;

  let score = 70;

  // Per-portion heuristics — softer than old absolute thresholds
  if (calories > 600) score -= 15;
  else if (calories > 400) score -= 8;
  else if (calories < 150) score += 5;

  if (gi != null) {
    if (gi > 70) score -= 15;
    else if (gi > 55) score -= 6;
    else score += 8;
  }

  const fatKcal = fats * 9;
  const proteinKcal = protein * 4;
  if (fatKcal / calories > 0.4) score -= 12;
  if (proteinKcal / calories > 0.2) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
};

/**
 * Fuzzy IFCT search with explicit match score (0–100).
 */
const searchIFCTFood = (foodName) => {
  if (!cache.ifctData?.length) return { item: null, matchScore: 0, matchType: 'none' };

  const query = foodName.toLowerCase().trim();
  if (query.length < 2) return { item: null, matchScore: 0, matchType: 'none' };

  const exactMatch = cache.ifctData.find(
    (item) => item.name?.toLowerCase() === query
  );
  if (exactMatch) {
    return { item: exactMatch, matchScore: 98, matchType: 'exact' };
  }

  const startsWith = cache.ifctData.find((item) =>
    item.name?.toLowerCase().startsWith(query)
  );
  if (startsWith) {
    return { item: startsWith, matchScore: 90, matchType: 'prefix' };
  }

  const queryWords = query.split(/[\s-,]+/).filter((w) => w.length > 2);
  let bestMatch = null;
  let bestScore = 0;

  for (const item of cache.ifctData) {
    let score = 0;
    const itemName = item.name?.toLowerCase() || '';

    if (itemName.includes(query)) score += 12;
    queryWords.forEach((word) => {
      if (itemName.includes(word)) score += 3;
      if (itemName.startsWith(word)) score += 2;
    });
    if (item.scie?.toLowerCase().includes(query)) score += 2;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestScore >= 8) {
    return {
      item: bestMatch,
      matchScore: Math.min(88, 40 + bestScore * 5),
      matchType: 'fuzzy',
    };
  }

  // Alias fallback
  for (const [alias, targets] of Object.entries(ALIASES)) {
    if (query.includes(alias) || alias.includes(query)) {
      for (const target of targets) {
        const alt = searchIFCTFood(target);
        if (alt.item) {
          return {
            item: alt.item,
            matchScore: Math.max(35, alt.matchScore - 25),
            matchType: 'alias',
          };
        }
      }
    }
  }

  return { item: null, matchScore: 0, matchType: 'none' };
};

const optimizeImage = async (imageBuffer) => {
  try {
    return await sharp(imageBuffer)
      .resize(900, 900, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    return imageBuffer;
  }
};

const parseVisionJson = (raw) => {
  const cleaned = (raw || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: treat as plain food name
    return {
      foodName: cleaned.replace(/[."]/g, '').slice(0, 80),
      identificationConfidence: 55,
      portionGrams: 100,
      portionLabel: 'Assumed 100 g (vision JSON parse failed)',
      visibleComponents: [],
    };
  }
};

/**
 * Vision: identify food + estimate edible portion mass.
 */
const analyzeFoodWithVision = async (base64Image) => {
  const client = getOpenAI();
  if (!client) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const visionResponse = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You analyze Indian and common foods in photos for nutrition lookup.
Return ONLY valid JSON (no markdown) with this shape:
{
  "foodName": "specific English dish name preferred for Indian foods",
  "identificationConfidence": 0-100,
  "portionGrams": estimated edible grams visible (not plate/bowl),
  "portionLabel": "short human label e.g. 1 medium dosa (~120g)",
  "visibleComponents": ["optional side items"]
}
Rules:
- identificationConfidence must reflect real uncertainty (blur, occluded, mixed plate).
- portionGrams must be a realistic edible mass (typical single servings 40–450g).
- If multiple foods, name the dominant item and list others in visibleComponents.
- Prefer specific names: "Masala Dosa" not "Indian food".`,
          },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
    max_tokens: 220,
    temperature: 0.2,
  });

  const parsed = parseVisionJson(visionResponse.choices[0].message.content);
  const foodName = String(parsed.foodName || 'Unknown food').trim().slice(0, 100);
  const identificationConfidence = Math.min(
    99,
    Math.max(1, Math.round(Number(parsed.identificationConfidence) || 50))
  );
  let portionGrams = Math.round(Number(parsed.portionGrams) || 100);
  portionGrams = Math.min(800, Math.max(20, portionGrams));

  return {
    foodName,
    identificationConfidence,
    portionGrams,
    portionLabel:
      String(parsed.portionLabel || `${portionGrams} g estimated`).slice(0, 120),
    visibleComponents: Array.isArray(parsed.visibleComponents)
      ? parsed.visibleComponents.slice(0, 5).map(String)
      : [],
  };
};

const combineConfidence = (visionConf, matchScore, hasIfct) => {
  if (!hasIfct) {
    return {
      overall: Math.round(visionConf * 0.55),
      identification: visionConf,
      nutritionMatch: 0,
      label: 'Low–Medium',
      explanation:
        'Food identified from the image, but no strong IFCT 2017 match — nutrition is estimated.',
    };
  }

  // Nutrition reliability needs both ID + database match
  const overall = Math.round(visionConf * 0.45 + matchScore * 0.55);
  let label = 'Medium';
  if (overall >= 80) label = 'High';
  else if (overall < 55) label = 'Low';

  return {
    overall,
    identification: visionConf,
    nutritionMatch: matchScore,
    label,
    explanation:
      matchScore >= 85
        ? 'Strong IFCT name match; values scaled to the estimated portion.'
        : matchScore >= 55
          ? 'Partial IFCT match; treat macros as approximate for this dish.'
          : 'Weak IFCT match; prefer verifying with a text search of the dish name.',
  };
};

const storage = {
  _handleFile(req, file, cb) {
    const chunks = [];
    file.stream.on('data', (chunk) => chunks.push(chunk));
    file.stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      cb(null, { buffer, size: buffer.length });
    });
    file.stream.on('error', cb);
  },
  _removeFile(req, file, cb) {
    delete file.buffer;
    cb(null);
  },
};

const upload = require('multer')({ storage });

router.post('/analyzefood', upload.single('foodImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const startTime = Date.now();

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'Image analysis is unavailable (missing OPENAI_API_KEY)',
      });
    }

    const optimizedImage = await optimizeImage(req.file.buffer);
    const base64Image = optimizedImage.toString('base64');

    const vision = await analyzeFoodWithVision(base64Image);
    const { item: foodMatch, matchScore, matchType } = searchIFCTFood(
      vision.foodName
    );

    const portionGrams = vision.portionGrams;
    const giLookup = lookupGlycemicIndex(vision.foodName);

    let nutritionInfo;
    let nutritionBasis;
    let source;
    let scientificName = '';
    let ifctName = null;

    if (foodMatch) {
      nutritionInfo = nutritionFromIfct(foodMatch, portionGrams);
      nutritionBasis = 'IFCT 2017 per 100 g, scaled to estimated portion';
      source = 'IFCT 2017';
      scientificName = foodMatch.scie || '';
      ifctName = foodMatch.name;
    } else {
      // Conservative common Indian per-100g estimates — clearly labelled
      const estimatedPer100 = {
        roti: { calories: 297, protein: 9, carbs: 46, fats: 7, fiber: 4 },
        rice: { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
        dal: { calories: 116, protein: 7, carbs: 16, fats: 1.5, fiber: 4 },
        idli: { calories: 110, protein: 3.5, carbs: 22, fats: 0.5, fiber: 1 },
        dosa: { calories: 170, protein: 4, carbs: 28, fats: 5, fiber: 1 },
        samosa: { calories: 260, protein: 5, carbs: 28, fats: 14, fiber: 2 },
        chicken: { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
      };
      const lower = vision.foodName.toLowerCase();
      const key = Object.keys(estimatedPer100).find((k) => lower.includes(k));
      const per100 = key
        ? estimatedPer100[key]
        : { calories: 180, protein: 6, carbs: 22, fats: 7, fiber: 2 };
      nutritionInfo = scaleNutrition(per100, portionGrams);
      nutritionBasis = key
        ? `Estimated per-100g profile for "${key}", scaled to portion (not IFCT)`
        : 'Generic estimate only — no IFCT match; verify with text search';
      source = 'Estimated';
    }

    const confidence = combineConfidence(
      vision.identificationConfidence,
      matchScore,
      Boolean(foodMatch)
    );

    // Healthier alternatives from same IFCT group with lower energy density
    let alternatives = [];
    if (foodMatch?.grup) {
      const matchCal = foodMatch.enerc ? foodMatch.enerc / 4.184 : 0;
      alternatives = cache.ifctData
        .filter((item) => {
          if (!item.grup || item.grup !== foodMatch.grup) return false;
          if (item.name === foodMatch.name) return false;
          const cals = item.enerc ? item.enerc / 4.184 : Infinity;
          return cals < matchCal * 0.9;
        })
        .slice(0, 3)
        .map((item) => {
          const altGi = lookupGlycemicIndex(item.name);
          return {
            name: item.name,
            calories: item.enerc ? Math.round(item.enerc / 4.184) : 0,
            gi: altGi.gi,
            giStatus: altGi.status,
            reason: 'Lower energy density in the same IFCT food group (per 100 g)',
            source: 'IFCT 2017',
          };
        });
    }

    const healthScore = calculateHealthScore(nutritionInfo, giLookup.gi);

    const result = {
      foodName: vision.foodName,
      ifctName,
      scientificName,
      confidence: confidence.overall,
      confidenceDetail: confidence,
      portion: {
        grams: portionGrams,
        label: vision.portionLabel,
        basis: 'Vision estimate of edible portion',
      },
      visibleComponents: vision.visibleComponents,
      nutrition: nutritionInfo,
      nutritionBasis,
      nutritionPer100g: foodMatch
        ? nutritionFromIfct(foodMatch, 100)
        : null,
      gi: giLookup.gi,
      giClass: classifyGi(giLookup.gi),
      giStatus: giLookup.status,
      giLabel: giLookup.label,
      giNote: giLookup.note,
      giCitation: giLookup.citation,
      healthScore,
      healthScoreNote:
        healthScore == null
          ? 'Health score omitted when calories are unavailable.'
          : 'Heuristic score for comparison only — not a clinical rating.',
      alternatives,
      source,
      matchType,
      matchScore,
      disclaimer:
        'Portion size and dish recipes vary. IFCT values are laboratory composition data; GI values are from published tables and may not match your exact preparation.',
      processingTime: Date.now() - startTime,
    };

    console.log(
      `✅ Image analysis: ${result.foodName} | IFCT=${source} | GI=${giLookup.status}:${giLookup.gi} | conf=${confidence.overall} | ${result.processingTime}ms`
    );

    res.json(result);
  } catch (error) {
    console.error('❌ Error analyzing food image:', error);
    res.status(500).json({
      error: 'Failed to analyze food image',
      details: error.message,
    });
  }
});

router.post('/quick-score', upload.single('foodImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const startTime = Date.now();

  try {
    const optimizedImage = await optimizeImage(req.file.buffer);
    const base64Image = optimizedImage.toString('base64');
    const vision = await analyzeFoodWithVision(base64Image);
    const { item: foodMatch, matchScore } = searchIFCTFood(vision.foodName);
    const giLookup = lookupGlycemicIndex(vision.foodName);

    const nutrition = foodMatch
      ? nutritionFromIfct(foodMatch, vision.portionGrams)
      : scaleNutrition(
          { calories: 180, protein: 6, carbs: 22, fats: 7, fiber: 2 },
          vision.portionGrams
        );

    const confidence = combineConfidence(
      vision.identificationConfidence,
      matchScore,
      Boolean(foodMatch)
    );

    res.json({
      foodName: vision.foodName,
      healthScore: calculateHealthScore(nutrition, giLookup.gi),
      calories: nutrition.calories,
      portionGrams: vision.portionGrams,
      confidence: confidence.overall,
      source: foodMatch ? 'IFCT 2017' : 'Estimated',
      gi: giLookup.gi,
      giStatus: giLookup.status,
      quick: true,
      processingTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error('❌ Quick analysis failed:', error);
    res.status(500).json({ error: 'Quick analysis failed' });
  }
});

router.get('/cache-info', (req, res) => {
  res.json({
    ifctData: cache.ifctData ? cache.ifctData.length : 0,
  });
});

module.exports = router;
