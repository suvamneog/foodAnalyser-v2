/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";

const BarcodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthyAlternative, setHealthyAlternative] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    function success(result) {
      scanner.clear();
      setScanResult(result);
      fetchProductInfo(result);
    }

    scanner.render(success, error);

    return () => {
      scanner.clear();
    };
  }, []);

  const fetchProductInfo = async (barcode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://foodanalyser.onrender.com/api/scan/product/${barcode}`);
      console.log("Backend API Response:", response.data); // Log the response
      if (response.data.status === 1) {
        setProduct(response.data.product);
        findHealthyAlternative(response.data.product);
      } else {
        setError('Product not found in the database');
      }
    } catch (err) {
      try {
        const directResponse = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        console.log("OpenFoodFacts API Response:", directResponse.data); // Log the response
        if (directResponse.data.status === 1) {
          setProduct(directResponse.data.product);
          findHealthyAlternative(directResponse.data.product);
        } else {
          setError('Oops! We couldnot find this product in our database. Try scanning the image again or searching on the home page.');
        }
      } catch (directErr) {
        setError('Error fetching product information',err);
        console.error(directErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const findHealthyAlternative = (currentProduct) => {
    if (!currentProduct) return;
    
    // Get product category
    const categories = currentProduct.categories_tags || [];
    const mainCategory = categories.length > 0 ? categories[0] : null;
    
    // Get nutrient levels
    const nutriments = currentProduct.nutriments || {};
    const highFat = nutriments.fat_100g > 17.5;
    const highSugar = nutriments.sugars_100g > 22.5;
    const highSalt = nutriments.salt_100g > 1.5;
    const lowFiber = !nutriments.fiber_100g || nutriments.fiber_100g < 3;
    const lowProtein = !nutriments.proteins_100g || nutriments.proteins_100g < 6;
    
    // Define alternatives based on nutritional issues
    let alternative = {
      name: 'Fresh Fruits and Vegetables',
      nutrition: {
        calories: 'Low',
        fat: 'Low',
        carbs: 'Moderate',
        protein: 'Varies',
        fiber: 'High'
      },
      benefits: 'Rich in vitamins, minerals, and fiber with low calories'
    };
    
    // More specific alternatives based on food category and nutritional issues
    if (categories.some(cat => cat.includes('breakfast-cereal'))) {
      alternative = {
        name: 'Whole Grain Oatmeal with Berries',
        nutrition: {
          calories: 150,
          fat: '3g',
          carbs: '27g',
          protein: '5g',
          fiber: '4g'
        },
        benefits: 'Higher in fiber, lower in sugar, provides sustained energy'
      };
    } else if (categories.some(cat => cat.includes('pizza'))) {
      alternative = {
        name: 'Cauliflower Crust Veggie Pizza',
        nutrition: {
          calories: 180,
          fat: '7g',
          carbs: '22g',
          protein: '10g',
          fiber: '5g'
        },
        benefits: 'Lower in calories and carbs, higher in fiber and nutrients'
      };
    } else if (categories.some(cat => cat.includes('bread'))) {
      alternative = {
        name: 'Whole Grain Bread',
        nutrition: {
          calories: 80,
          fat: '1g',
          carbs: '15g',
          protein: '4g',
          fiber: '3g'
        },
        benefits: 'Higher in fiber and protein, more complex carbohydrates'
      };
    } else if (categories.some(cat => cat.includes('snack'))) {
      alternative = {
        name: 'Greek Yogurt with Nuts and Berries',
        nutrition: {
          calories: 150,
          fat: '5g',
          carbs: '12g',
          protein: '15g',
          fiber: '3g'
        },
        benefits: 'Higher in protein, contains healthy fats and probiotics'
      };
    } else if (categories.some(cat => cat.includes('beverage') || cat.includes('drink'))) {
      alternative = {
        name: 'Infused Water or Herbal Tea',
        nutrition: {
          calories: 0,
          fat: '0g',
          carbs: '0g',
          protein: '0g',
          fiber: '0g'
        },
        benefits: 'Zero calories, no sugar, hydrating and refreshing'
      };
    } else if (categories.some(cat => cat.includes('dessert') || cat.includes('sweet'))) {
      alternative = {
        name: 'Fresh Fruit with Dark Chocolate',
        nutrition: {
          calories: 120,
          fat: '5g',
          carbs: '20g',
          protein: '2g',
          fiber: '4g'
        },
        benefits: 'Natural sugars, antioxidants, and fiber'
      };
    } else if (categories.some(cat => cat.includes('meat'))) {
      alternative = {
        name: 'Lean Grilled Chicken or Fish',
        nutrition: {
          calories: 150,
          fat: '3g',
          carbs: '0g',
          protein: '30g',
          fiber: '0g'
        },
        benefits: 'High in protein, low in saturated fat, no added preservatives'
      };
    } else if (categories.some(cat => cat.includes('pasta') || cat.includes('noodle'))) {
      alternative = {
        name: 'Whole Grain Pasta with Vegetables',
        nutrition: {
          calories: 200,
          fat: '2g',
          carbs: '40g',
          protein: '8g',
          fiber: '6g'
        },
        benefits: 'Higher in fiber and protein, more complex carbohydrates'
      };
    } else if (categories.some(cat => cat.includes('sauce') || cat.includes('condiment'))) {
      alternative = {
        name: 'Homemade Herb and Yogurt Sauce',
        nutrition: {
          calories: 50,
          fat: '2g',
          carbs: '3g',
          protein: '4g',
          fiber: '0g'
        },
        benefits: 'Lower in sodium and sugar, no preservatives'
      };
    } else if (categories.some(cat => cat.includes('fast-food') || cat.includes('restaurant'))) {
      alternative = {
        name: 'Homemade Bowl with Grains, Protein and Vegetables',
        nutrition: {
          calories: 400,
          fat: '10g',
          carbs: '50g',
          protein: '25g',
          fiber: '8g'
        },
        benefits: 'Balanced nutrition, portion control, no added preservatives'
      };
    }
    
    // Adjust alternative based on specific nutritional issues
    if (highFat && highSugar) {
      alternative = {
        name: 'Fresh Fruit Salad with Yogurt',
        nutrition: {
          calories: 120,
          fat: '0g',
          carbs: '25g',
          protein: '5g',
          fiber: '3g'
        },
        benefits: 'Low in fat, contains natural sugars, high in vitamins'
      };
    } else if (highFat) {
      alternative = {
        name: 'Lean Protein with Steamed Vegetables',
        nutrition: {
          calories: 250,
          fat: '5g',
          carbs: '15g',
          protein: '35g',
          fiber: '5g'
        },
        benefits: 'Low in fat, high in protein, nutrient-dense'
      };
    } else if (highSugar) {
      alternative = {
        name: 'Berries with Unsweetened Greek Yogurt',
        nutrition: {
          calories: 130,
          fat: '0g',
          carbs: '15g',
          protein: '15g',
          fiber: '4g'
        },
        benefits: 'Low in added sugar, high in protein and antioxidants'
      };
    } else if (highSalt) {
      alternative = {
        name: 'Herb-Seasoned Fresh Foods',
        nutrition: {
          calories: 'Varies',
          fat: 'Low',
          carbs: 'Moderate',
          protein: 'Moderate',
          fiber: 'High'
        },
        benefits: 'Low in sodium, rich in natural flavors and nutrients'
      };
    } else if (lowFiber) {
      alternative = {
        name: 'Whole Grain and Legume Mix',
        nutrition: {
          calories: 200,
          fat: '3g',
          carbs: '35g',
          protein: '10g',
          fiber: '8g'
        },
        benefits: 'High in fiber, complex carbohydrates, and plant protein'
      };
    } else if (lowProtein) {
      alternative = {
        name: 'Quinoa Bowl with Beans and Vegetables',
        nutrition: {
          calories: 350,
          fat: '8g',
          carbs: '45g',
          protein: '15g',
          fiber: '10g'
        },
        benefits: 'Complete protein source, high in fiber and nutrients'
      };
    }
    
    setHealthyAlternative(alternative);
  };

  const getHealthScore = (product) => {
    if (!product) return { score: 0, color: 'gray', label: 'Unknown' };
    
    // Use nutri-score if available
    if (product.nutriscore_grade) {
      const scoreMap = {
        'a': { score: 90, color: 'green', label: 'Very Healthy' },
        'b': { score: 75, color: 'green', label: 'Healthy' },
        'c': { score: 60, color: 'yellow', label: 'Moderate' },
        'd': { score: 40, color: 'yellow', label: 'Less Healthy' },
        'e': { score: 20, color: 'red', label: 'Unhealthy' }
      };
      return scoreMap[product.nutriscore_grade] || { score: 50, color: 'yellow', label: 'Moderate' };
    }
    
    // Advanced algorithm if nutri-score not available
    let score = 50; // Default moderate score
    
    // Adjust based on nutrients if available
    if (product.nutriments) {
      const nutrients = product.nutriments;
      
      // Penalize for high sugar, salt, fat
      if (nutrients.sugars_100g > 22.5) score -= 20; // High sugar
      else if (nutrients.sugars_100g > 5) score -= 10; // Medium sugar
      
      if (nutrients.salt_100g > 1.5) score -= 15; // High salt
      else if (nutrients.salt_100g > 0.3) score -= 7; // Medium salt
      
      if (nutrients.fat_100g > 17.5) score -= 20; // High fat
      else if (nutrients.fat_100g > 3) score -= 10; // Medium fat
      
      if (nutrients.saturated_fat_100g > 5) score -= 15; // High saturated fat
      else if (nutrients.saturated_fat_100g > 1.5) score -= 7; // Medium saturated fat
      
      // Bonus for fiber and protein
      if (nutrients.fiber_100g > 6) score += 15; // High fiber
      else if (nutrients.fiber_100g > 3) score += 7; // Medium fiber
      
      if (nutrients.proteins_100g > 12) score += 15; // High protein
      else if (nutrients.proteins_100g > 6) score += 7; // Medium protein
      
      // Bonus for vitamins and minerals if available
      if (nutrients.vitamin_a) score += 5;
      if (nutrients.vitamin_c) score += 5;
      if (nutrients.calcium) score += 5;
      if (nutrients.iron) score += 5;
      
      // Adjust for energy density
      if (nutrients.energy_100g > 400) score -= 10; // High calorie density
    }
    
    // Adjust for additives
    if (product.additives_n) {
      if (product.additives_n > 5) score -= 15;
      else if (product.additives_n > 0) score -= 5;
    }
    
    // Adjust for processing level
    if (product.nova_group) {
      if (product.nova_group === 4) score -= 20; // Ultra-processed
      else if (product.nova_group === 3) score -= 10; // Processed
      else if (product.nova_group === 1) score += 15; // Unprocessed
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));
    
    // Determine color and label based on score
    let color, label;
    if (score >= 70) {
      color = 'green';
      label = score >= 85 ? 'Very Healthy' : 'Healthy';
    } else if (score >= 40) {
      color = 'yellow';
      label = score >= 55 ? 'Moderate' : 'Less Healthy';
    } else {
      color = 'red';
      label = 'Unhealthy';
    }
    
    return { score, color, label };
  };

  const renderHealthScoreIcon = (color) => {
    if (color === 'green') return <Check className="w-6 h-6 text-green-500" />;
    if (color === 'yellow') return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    if (color === 'red') return <AlertCircle className="w-6 h-6 text-red-500" />;
    return null;
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-6">
    <div className="absolute inset-0 pointer-events-none">
      <StarsBackground />
      <ShootingStars />
    </div>
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="min-h-screen p-8 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">Barcode Scanner</h2>
            <p className="text-gray-400 mb-4">Scan a food product barcode to get detailed nutrition information and health insights.</p>
        {!scanResult && (
          <div id="reader" className="w-full max-w-md mx-auto"></div>
        )}
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading product information...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {product && (
  <div className="bg-zinc-900 p-6 rounded-lg shadow-md mb-6"> {/* Changed bg-white to bg-zinc-900 */}
    <h2 className="text-2xl font-semibold mb-4">{product.product_name}</h2>
    
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3">
        {product.image_url && (
          <img 
            src={product.image_url} 
            alt={product.product_name} 
            className="w-full h-auto rounded-lg shadow-sm"
          />
        )}
      </div>
      
      <div className="md:w-2/3">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Product Information</h3>
          <p><strong>Brand:</strong> {product.brands || 'Unknown'}</p>
          <p><strong>Quantity:</strong> {product.quantity || 'Not specified'}</p>
          <p><strong>Categories:</strong> {product.categories || 'Not categorized'}</p>
          {product.ingredients_text && (
            <p><strong>Ingredients:</strong> {product.ingredients_text}</p>
          )}
          {product.nova_group && (
            <p>
              <strong>Processing Level:</strong> {
                product.nova_group === 1 ? 'Unprocessed/Minimally processed' :
                product.nova_group === 2 ? 'Processed culinary ingredients' :
                product.nova_group === 3 ? 'Processed foods' :
                'Ultra-processed foods'
              }
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Nutrition Facts (per 100g)</h3>
          {product.nutriments ? (
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Energy:</strong> {product.nutriments.energy_100g || 0} kcal</p>
              <p><strong>Fat:</strong> {product.nutriments.fat_100g || 0}g</p>
              <p><strong>Saturated Fat:</strong> {product.nutriments.saturated_fat_100g || 0}g</p>
              <p><strong>Carbs:</strong> {product.nutriments.carbohydrates_100g || 0}g</p>
              <p><strong>Sugars:</strong> {product.nutriments.sugars_100g || 0}g</p>
              <p><strong>Fiber:</strong> {product.nutriments.fiber_100g || 0}g</p>
              <p><strong>Protein:</strong> {product.nutriments.proteins_100g || 0}g</p>
              <p><strong>Salt:</strong> {product.nutriments.salt_100g || 0}g</p>
            </div>
          ) : (
            <p>Nutrition information not available</p>
          )}
        </div>
        
        {/* Health Score */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Health Score</h3>
          <div className="flex items-center">
            {(() => {
              const { score, color, label } = getHealthScore(product);
              return (
                <>
                  {renderHealthScoreIcon(color)}
                  <div className="ml-2">
                    <div className="h-4 w-40 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-1">{label} ({score}/100)</p>
                  </div>
                </>
              );
            })()}
          </div>
          {product.nutriscore_grade && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Nutri-Score: {product.nutriscore_grade.toUpperCase()}
                {product.nutriscore_score && ` (${product.nutriscore_score})`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
      {/* Healthy Alternative Section */}
      {product && healthyAlternative && (
        <div className="bg-green-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Healthier Alternative</h2>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-4 md:mb-0 md:pr-6">
              <h3 className="text-lg font-medium mb-2">{healthyAlternative.name}</h3>
              <div className="mb-3">
                <h4 className="font-medium text-gray-700">Nutrition Facts:</h4>
                <ul className="list-disc list-inside text-gray-600 ml-2">
                  <li>Calories: {healthyAlternative.nutrition.calories}</li>
                  <li>Fat: {healthyAlternative.nutrition.fat}</li>
                  <li>Carbs: {healthyAlternative.nutrition.carbs}</li>
                  <li>Protein: {healthyAlternative.nutrition.protein}</li>
                  <li>Fiber: {healthyAlternative.nutrition.fiber}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Benefits:</h4>
                <p className="text-gray-600">{healthyAlternative.benefits}</p>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-sm text-gray-500">Current Choice</p>
                    <p className="font-medium text-red-500">{product.product_name}</p>
                  </div>
                  <div className="text-green-600 mx-2">→</div>
                  <div className="text-center px-4">
                    <p className="text-sm text-gray-500">Healthier Option</p>
                    <p className="font-medium text-green-700">{healthyAlternative.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {scanResult && (
        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
            Scan Another Product
          </button>
        </div>
      )}

    </div>
    </div>
      </motion.div>
    </div>
  );
};

export default BarcodeScanner;