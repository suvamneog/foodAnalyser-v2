const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Load datasets
let ifctData = [];
let indbData = [];

const readFile = promisify(fs.readFile);

const loadDatasets = async () => {
  try {
    // Load IFCT data
    const ifctPath = path.resolve(__dirname, "../data/ifct_dataset.json");
    const ifctFile = await readFile(ifctPath, 'utf8');
    ifctData = JSON.parse(ifctFile);
    console.log(`✅ IFCT dataset loaded (${ifctData.length} foods)`);

    // Load INDB data
    const indbPath = path.resolve(__dirname, "../data/indb_dataset.json");
    const indbFile = await readFile(indbPath, 'utf8');
    indbData = JSON.parse(indbFile);
    console.log(`✅ INDB dataset loaded (${indbData.length} foods)`);
  } catch (error) {
    console.error('❌ Error loading datasets:', error);
  }
};

loadDatasets();

// Helper function to find matching Indian food
const findIndianFoodMatch = (productName, categories = []) => {
  if (!productName) return null;
  
  const query = productName.toLowerCase();
  
  // Direct name matches in IFCT
  const directIfctMatches = ifctData.filter(item => {
    const name = item.name?.toLowerCase() || "";
    return name.includes(query) || query.includes(name);
  });

  if (directIfctMatches.length > 0) {
    return {
      source: 'IFCT',
      data: directIfctMatches[0],
      matchType: 'direct'
    };
  }

  // Category-based matching in IFCT
  if (categories.length > 0) {
    const categoryMatches = ifctData.filter(item => {
      const itemCategory = item.grup?.toLowerCase() || '';
      return categories.some(cat => 
        cat.toLowerCase().includes(itemCategory) || 
        itemCategory.includes(cat.toLowerCase())
      );
    });

    if (categoryMatches.length > 0) {
      return {
        source: 'IFCT',
        data: categoryMatches[0],
        matchType: 'category'
      };
    }
  }

  // INDB matches for traditional preparations
  const indbMatches = indbData.filter(item => {
    const name = item.name?.toLowerCase() || "";
    return name.includes(query) || query.includes(name);
  });

  if (indbMatches.length > 0) {
    return {
      source: 'INDB',
      data: indbMatches[0],
      matchType: 'direct'
    };
  }

  return null;
};

// Helper function to get healthier Indian alternatives
const getIndianAlternatives = (currentFood, matchSource) => {
  let alternatives = [];
  
  if (matchSource === 'IFCT' && currentFood.grup) {
    // Find similar foods from same group with better nutrition
    alternatives = ifctData
      .filter(item => 
        item.grup === currentFood.grup && 
        item.name !== currentFood.name &&
        (item.fibtg > (currentFood.fibtg || 0) || // Higher fiber
         (item.enerc && currentFood.enerc && item.enerc < currentFood.enerc)) // Lower calories
      )
      .slice(0, 3)
      .map(item => ({
        name: item.name,
        benefits: item.fibtg > (currentFood.fibtg || 0) ? 'Higher fiber' : 'Lower calories',
        nutrition: {
          calories: item.enerc ? (item.enerc / 4.184).toFixed(1) : 'N/A',
          protein: item.protcnt || 'N/A',
          carbs: item.choavldf || 'N/A',
          fiber: item.fibtg || 'N/A'
        },
        source: 'IFCT'
      }));
  }

  // Add INDB traditional alternatives
  const traditionalAlternatives = indbData
    .filter(item => 
      item.category === currentFood.grup && 
      (item.healthScore > 70 || !item.healthScore)
    )
    .slice(0, 2)
    .map(item => ({
      name: item.name,
      benefits: 'Traditional healthy preparation',
      nutrition: item.nutrition || {},
      traditional: true,
      source: 'INDB'
    }));

  return [...alternatives, ...traditionalAlternatives].slice(0, 4);
};

// Enhanced product info endpoint
router.get('/product/:barcode', async (req, res) => {
  const { barcode } = req.params;

  if (!barcode || !/^\d+$/.test(barcode)) {
    return res.status(400).json({ error: 'Invalid barcode format' });
  }

  try {
    // Step 1: Get product from Open Food Facts
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const offData = await response.json();
    if (offData.status === 0) {
      return res.status(404).json({ error: 'Product not found in Open Food Facts' });
    }

    const product = offData.product;
    
    // Step 2: Find Indian food match
    const indianMatch = findIndianFoodMatch(
      product.product_name, 
      product.categories_tags || []
    );

    // Step 3: Enhance nutrition data with IFCT/INDB if available
    let enhancedNutrition = product.nutriments ? { ...product.nutriments } : {};
    let indianInsights = null;
    let alternatives = [];

    if (indianMatch) {
      console.log(`✅ Found Indian match: ${indianMatch.data.name} from ${indianMatch.source}`);
      
      // Enhance nutrition data
      if (indianMatch.source === 'IFCT') {
        const ifctItem = indianMatch.data;
        enhancedNutrition = {
          ...enhancedNutrition,
          // Prefer IFCT data for accuracy
          energy_100g: ifctItem.enerc ? (ifctItem.enerc / 4.184) : enhancedNutrition.energy_100g,
          proteins_100g: ifctItem.protcnt || enhancedNutrition.proteins_100g,
          carbohydrates_100g: ifctItem.choavldf || enhancedNutrition.carbohydrates_100g,
          fat_100g: ifctItem.fatce || enhancedNutrition.fat_100g,
          fiber_100g: ifctItem.fibtg || enhancedNutrition.fiber_100g,
          sugars_100g: ifctItem.sugars || enhancedNutrition.sugars_100g
        };

        indianInsights = {
          scientificName: ifctItem.scie,
          foodGroup: ifctItem.grup,
          traditionalUses: ifctItem.tags,
          dataSource: 'IFCT 2017'
        };
      } else if (indianMatch.source === 'INDB') {
        const indbItem = indianMatch.data;
        indianInsights = {
          regionalOrigin: indbItem.region,
          traditionalPreparation: indbItem.preparation,
          healthBenefits: indbItem.benefits,
          bestConsumed: indbItem.season,
          dataSource: 'INDB'
        };
      }

      // Get healthier Indian alternatives
      alternatives = getIndianAlternatives(indianMatch.data, indianMatch.source);
    }

    // Step 4: Prepare response
    const result = {
      status: 1,
      product: {
        ...product,
        nutriments: enhancedNutrition,
        _indianMatch: indianMatch ? {
          source: indianMatch.source,
          name: indianMatch.data.name,
          matchType: indianMatch.matchType,
          insights: indianInsights
        } : null,
        _indianAlternatives: alternatives
      }
    };

    res.json(result);

  } catch (error) {
    console.error('Error fetching product info:', error);
    res.status(500).json({ 
      error: 'Error fetching product information', 
      details: error.message 
    });
  }
});

// New endpoint to search Indian foods directly
router.get('/search/indian/:query', async (req, res) => {
  const { query } = req.params;
  
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }

  try {
    const searchTerm = query.toLowerCase();
    
    const ifctResults = ifctData
      .filter(item => 
        item.name?.toLowerCase().includes(searchTerm) ||
        item.scie?.toLowerCase().includes(searchTerm) ||
        item.tags?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10)
      .map(item => ({
        name: item.name,
        scientificName: item.scie,
        group: item.grup,
        nutrition: {
          calories: item.enerc ? (item.enerc / 4.184).toFixed(1) : null,
          protein: item.protcnt,
          carbs: item.choavldf,
          fat: item.fatce,
          fiber: item.fibtg
        },
        source: 'IFCT',
        type: 'ingredient'
      }));

    const indbResults = indbData
      .filter(item =>
        item.name?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.region?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10)
      .map(item => ({
        name: item.name,
        description: item.description,
        region: item.region,
        preparation: item.preparation,
        nutrition: item.nutrition,
        source: 'INDB',
        type: 'preparation'
      }));

    const results = [...ifctResults, ...indbResults];

    res.json({
      query,
      results,
      total: results.length,
      sources: {
        IFCT: ifctResults.length,
        INDB: indbResults.length
      }
    });

  } catch (error) {
    console.error('Error searching Indian foods:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Health score calculation endpoint
router.post('/health-score', async (req, res) => {
  const { product, indianMatch } = req.body;
  
  try {
    let score = 50; // Base score
    
    if (product.nutriments) {
      const nut = product.nutriments;
      
      // Adjust based on nutrients
      if (nut.sugars_100g > 22.5) score -= 20;
      else if (nut.sugars_100g > 5) score -= 10;
      
      if (nut.salt_100g > 1.5) score -= 15;
      else if (nut.salt_100g > 0.3) score -= 7;
      
      if (nut.fat_100g > 17.5) score -= 20;
      else if (nut.fat_100g > 3) score -= 10;
      
      if (nut.fiber_100g > 6) score += 15;
      else if (nut.fiber_100g > 3) score += 7;
      
      if (nut.proteins_100g > 12) score += 15;
      else if (nut.proteins_100g > 6) score += 7;
    }
    
    // Bonus for Indian traditional foods
    if (indianMatch) {
      if (indianMatch.source === 'IFCT') score += 10;
      if (indianMatch.source === 'INDB') score += 5;
    }
    
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    let label;
    if (score >= 70) label = 'Healthy';
    else if (score >= 40) label = 'Moderate';
    else label = 'Less Healthy';
    
    res.json({ score, label });
    
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ error: 'Health score calculation failed' });
  }
});

module.exports = router;