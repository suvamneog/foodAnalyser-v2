/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { AlertCircle, Check, AlertTriangle, Utensils, Leaf, Camera, RotateCcw } from 'lucide-react';
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";

const BarcodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthyAlternative, setHealthyAlternative] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [indianInsights, setIndianInsights] = useState(null);
  const [indianAlternatives, setIndianAlternatives] = useState([]);
  const [healthScore, setHealthScore] = useState(null);

  const API_BASE_URL = "http://localhost:3000/api";

  const initializeScanner = useCallback(() => {
    console.log("Initializing scanner...");
    const newScanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 10,
      verbose: false,
      cameraIdOrConfig: { facingMode: "environment" },
      disableFlip: false,
      aspectRatio: 1.0,
    }, true);

    let lastResult = null;
    let resultCount = 0;
    const requiredConsistency = 2;

    function success(result) {
      console.log("Scan detected:", result);
      if (lastResult === result) {
        resultCount++;
        if (resultCount >= requiredConsistency) {
          newScanner.clear();
          setScanResult(result);
          fetchProductInfo(result);
        }
      } else {
        lastResult = result;
        resultCount = 1;
      }
    }

    function onError(err) {
      console.warn("Scanner error:", err);
      setError("Scanning failed. Please ensure camera access and good lighting.");
    }

    try {
      newScanner.render(success, onError);
      setScanner(newScanner);
      console.log("Scanner rendered successfully");
    } catch (err) {
      setError("Failed to initialize scanner: " + err.message);
      console.error("Render error:", err);
    }

    return newScanner;
  }, []);

  const resetScanner = useCallback(() => {
    console.log("Resetting scanner...");
    if (scanner) {
      scanner.clear();
      console.log("Existing scanner cleared");
    }

    setScanResult(null);
    setProduct(null);
    setError(null);
    setHealthyAlternative(null);
    setIndianInsights(null);
    setIndianAlternatives([]);
    setHealthScore(null);
    setLoading(false);
    setScanner(null);

    setTimeout(() => {
      initializeScanner();
    }, 100);
  }, [scanner, initializeScanner]);

  useEffect(() => {
    const newScanner = initializeScanner();
    return () => {
      console.log("Cleaning up scanner...");
      if (newScanner) {
        newScanner.clear();
      }
    };
  }, [initializeScanner]);

  const fetchProductInfo = async (barcode) => {
    setLoading(true);
    setError(null);
    setIndianInsights(null);
    setIndianAlternatives([]);
    setHealthScore(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/scan/product/${barcode}`);
      console.log("Enhanced API Response:", response.data);
      
      if (response.data.status === 1) {
        const productData = response.data.product;
        setProduct(productData);
        
        if (productData._indianMatch) {
          setIndianInsights(productData._indianMatch);
        }
        
        if (productData._indianAlternatives && productData._indianAlternatives.length > 0) {
          setIndianAlternatives(productData._indianAlternatives);
        }
        
        calculateHealthScore(productData, productData._indianMatch);
        findHealthyAlternative(productData);
      } else {
        setError('Product not found in the database');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      
      try {
        const directResponse = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        if (directResponse.data.status === 1) {
          setProduct(directResponse.data.product);
          calculateHealthScore(directResponse.data.product, null);
          findHealthyAlternative(directResponse.data.product);
        } else {
          setError('Product not found. Try scanning again or search manually.');
        }
      } catch (directErr) {
        setError(`Error: ${directErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = async (productData, indianMatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/scan/health-score`, {
        product: productData,
        indianMatch: indianMatch
      });
      setHealthScore(response.data);
    } catch (error) {
      console.error('Error calculating health score:', error);
      // Fallback to client-side calculation
      const fallbackScore = getHealthScore(productData, indianMatch);
      setHealthScore(fallbackScore);
    }
  };

  const getHealthScore = (product, indianMatch) => {
    if (!product) return { score: 0, color: 'gray', label: 'Unknown' };
    
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
    
    let score = 50;
    
    if (product.nutriments) {
      const nut = product.nutriments;
      
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
    
    if (indianMatch) {
      if (indianMatch.source === 'IFCT') score += 10;
      if (indianMatch.source === 'INDB') score += 5;
    }
    
    score = Math.max(0, Math.min(100, Math.round(score)));
    
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

  const findHealthyAlternative = (currentProduct) => {
    if (!currentProduct) return;
    
    if (indianAlternatives.length > 0) {
      const bestAlternative = indianAlternatives[0];
      setHealthyAlternative({
        name: bestAlternative.name,
        nutrition: bestAlternative.nutrition,
        benefits: bestAlternative.benefits || 'Healthier Indian alternative',
        traditional: bestAlternative.traditional || false,
        source: bestAlternative.source
      });
      return;
    }
    
    const categories = currentProduct.categories_tags || [];
    const nutriments = currentProduct.nutriments || {};
    
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
    }
    
    setHealthyAlternative(alternative);
  };

  const renderHealthScoreIcon = (color) => {
    if (color === 'green') return <Check className="w-6 h-6 text-green-500" />;
    if (color === 'yellow') return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    if (color === 'red') return <AlertCircle className="w-6 h-6 text-red-500" />;
    return null;
  };

  const IndianInsightsSection = () => {
    if (!indianInsights) return null;

    return (
      <div className="bg-blue-600 border border-blue-500 p-4 rounded-lg mb-4">
        <div className="flex items-center mb-3">
          <Utensils className="w-5 h-5 text-blue-300 mr-2" />
          <h3 className="text-lg font-semibold text-white">Indian Food Insights</h3>
        </div>
        
        <div className="space-y-2 text-blue-100">
          <p><strong className="text-white">Source:</strong> {indianInsights.source} • {indianInsights.matchType} match</p>
          <p><strong className="text-white">Indian Name:</strong> {indianInsights.name}</p>
          
          {indianInsights.insights?.scientificName && (
            <p><strong className="text-white">Scientific Name:</strong> {indianInsights.insights.scientificName}</p>
          )}
          
          {indianInsights.insights?.foodGroup && (
            <p><strong className="text-white">Food Group:</strong> {indianInsights.insights.foodGroup}</p>
          )}
          
          {indianInsights.insights?.regionalOrigin && (
            <p><strong className="text-white">Region:</strong> {indianInsights.insights.regionalOrigin}</p>
          )}
          
          {indianInsights.insights?.healthBenefits && (
            <p><strong className="text-white">Benefits:</strong> {indianInsights.insights.healthBenefits}</p>
          )}
        </div>
      </div>
    );
  };

  const IndianAlternativesSection = () => {
    if (indianAlternatives.length === 0) return null;

    return (
      <div className="bg-green-600 border border-green-500 p-4 rounded-lg mb-4">
        <div className="flex items-center mb-3">
          <Leaf className="w-5 h-5 text-green-300 mr-2" />
          <h3 className="text-lg font-semibold text-white">Indian Healthy Alternatives</h3>
        </div>
        
        <div className="space-y-3">
          {indianAlternatives.map((alt, index) => (
            <div key={index} className="bg-green-700 p-3 rounded border border-green-600">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-white">{alt.name}</h4>
                  <p className="text-sm text-green-200">{alt.benefits}</p>
                  {alt.traditional && (
                    <span className="inline-block bg-green-800 text-green-200 text-xs px-2 py-1 rounded mt-1">
                      Traditional
                    </span>
                  )}
                  <span className="inline-block bg-green-800 text-green-200 text-xs px-2 py-1 rounded mt-1 ml-2">
                    {alt.source}
                  </span>
                </div>
                {alt.nutrition && (
                  <div className="text-right text-sm text-green-200">
                    <p>Calories: {alt.nutrition.calories}</p>
                    <p>Protein: {alt.nutrition.protein}g</p>
                    {alt.nutrition.fiber && <p>Fiber: {alt.nutrition.fiber}g</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const HealthScoreSection = () => {
    if (!healthScore) return null;

    return (
      <div className="bg-zinc-800 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-medium mb-3 text-white">Health Score</h3>
        <div className="flex items-center">
          {renderHealthScoreIcon(healthScore.color)}
          <div className="ml-3">
            <div className="h-4 w-40 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  healthScore.color === 'green' ? 'bg-green-500' : 
                  healthScore.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${healthScore.score}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1 text-gray-300">
              {healthScore.label} ({healthScore.score}/100)
            </p>
          </div>
        </div>
        {product?.nutriscore_grade && (
          <div className="mt-2">
            <p className="text-sm text-gray-400">
              Nutri-Score: {product.nutriscore_grade.toUpperCase()}
              {product.nutriscore_score && ` (${product.nutriscore_score})`}
            </p>
          </div>
        )}
      </div>
    );
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Food Scanner</h2>
                  <p className="text-gray-400">
                    Scan barcodes to get nutrition info with Indian food insights
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Camera className="w-5 h-5" />
                  <span>Powered by Open Food Facts + Indian Databases</span>
                </div>
              </div>

              {!scanResult && (
                <div id="reader" className="w-full max-w-md mx-auto"></div>
              )}
              
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Analyzing product with Indian food databases...</p>
                  <p className="text-sm text-gray-500 mt-2">May take some time!</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-600 text-white p-4 rounded-lg my-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-200 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
            </div>

            {product && (
              <div className="space-y-6">
                <IndianInsightsSection />
                
                <div className="bg-zinc-900 p-6 rounded-lg">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.product_name} 
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      )}
                    </div>
                    
                    <div className="md:w-2/3">
                      <h2 className="text-2xl font-semibold mb-4">{product.product_name}</h2>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2 text-gray-300">Product Information</h3>
                        <div className="space-y-1 text-gray-400">
                          <p><strong>Brand:</strong> {product.brands || 'Unknown'}</p>
                          <p><strong>Quantity:</strong> {product.quantity || 'Not specified'}</p>
                          {product.categories && (
                            <p><strong>Categories:</strong> {product.categories}</p>
                          )}
                          {product.ingredients_text && (
                            <p><strong>Ingredients:</strong> {product.ingredients_text}</p>
                          )}
                        </div>
                      </div>

                      <HealthScoreSection />

                      {product.nutriments && (
                        <div className="mb-4">
                          <h3 className="text-lg font-medium mb-2 text-gray-300">Nutrition Facts (per 100g)</h3>
                          <div className="grid grid-cols-2 gap-2 text-gray-400">
                            <p><strong>Energy:</strong> {product.nutriments.energy_100g || 0} kcal</p>
                            <p><strong>Fat:</strong> {product.nutriments.fat_100g || 0}g</p>
                            <p><strong>Saturated Fat:</strong> {product.nutriments.saturated_fat_100g || 0}g</p>
                            <p><strong>Carbs:</strong> {product.nutriments.carbohydrates_100g || 0}g</p>
                            <p><strong>Sugars:</strong> {product.nutriments.sugars_100g || 0}g</p>
                            <p><strong>Fiber:</strong> {product.nutriments.fiber_100g || 0}g</p>
                            <p><strong>Protein:</strong> {product.nutriments.proteins_100g || 0}g</p>
                            <p><strong>Salt:</strong> {product.nutriments.salt_100g || 0}g</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <IndianAlternativesSection />

                {healthyAlternative && (
                  <div className="bg-green-600 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 text-white">Healthier Alternative</h2>
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="md:w-1/2 mb-4 md:mb-0 md:pr-6">
                        <h3 className="text-lg font-medium mb-2 text-white">{healthyAlternative.name}</h3>
                        <div className="mb-3">
                          <h4 className="font-medium text-green-200">Nutrition Facts:</h4>
                          <ul className="list-disc list-inside text-green-100 ml-2">
                            <li>Calories: {healthyAlternative.nutrition.calories}</li>
                            <li>Fat: {healthyAlternative.nutrition.fat}</li>
                            <li>Carbs: {healthyAlternative.nutrition.carbs}</li>
                            <li>Protein: {healthyAlternative.nutrition.protein}</li>
                            <li>Fiber: {healthyAlternative.nutrition.fiber}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-200">Benefits:</h4>
                          <p className="text-green-100">{healthyAlternative.benefits}</p>
                        </div>
                      </div>
                      
                      <div className="md:w-1/2 flex justify-center">
                        <div className="bg-green-700 p-4 rounded-lg">
                          <div className="flex items-center justify-center">
                            <div className="text-center px-4">
                              <p className="text-sm text-green-200">Current Choice</p>
                              <p className="font-medium text-red-300">{product.product_name}</p>
                            </div>
                            <div className="text-green-300 mx-2">→</div>
                            <div className="text-center px-4">
                              <p className="text-sm text-green-200">Healthier Option</p>
                              <p className="font-medium text-white">{healthyAlternative.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button 
                    onClick={resetScanner}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200 flex items-center justify-center mx-auto"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Scan Another Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BarcodeScanner;