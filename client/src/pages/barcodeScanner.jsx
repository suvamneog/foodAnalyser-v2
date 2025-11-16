/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { AlertCircle, Check, AlertTriangle, Utensils, Leaf, Camera, RotateCcw, Upload, Image as ImageIcon, Frown } from 'lucide-react';
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";
import { API_ENDPOINTS } from "../utils/apiConfig";

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
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [productNotFound, setProductNotFound] = useState(false);
  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);

  const initializeScanner = useCallback(() => {
  
    
    // Clear any existing scanner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        
      });
    }

    const newScanner = new Html5QrcodeScanner(
      'reader', 
      {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        rememberLastUsedCamera: true,
        aspectRatio: 1.0,
      }, 
      false // verbose = false to reduce console noise
    );

    let isScanning = true;

    const success = async (decodedText, decodedResult) => {
      if (!isScanning) return;
      
      console.log("Scan detected successfully:", decodedText);
      
      // Basic validation - check if it looks like a barcode
      if (!decodedText || decodedText.length < 8) {
        console.log("Invalid barcode format, ignoring...");
        return;
      }
      
      // Stop scanning immediately
      isScanning = false;
      try {
        await newScanner.clear();
        setScanner(null);
        scannerRef.current = null;
      } catch (error) {
        console.log("Error clearing scanner:", error);
      }
      
      setScanResult(decodedText);
      await fetchProductInfo(decodedText);
    };

    const onFailure = (error) => {
      // Don't show errors in UI - they're normal during scanning
      if (error && !error.includes("NotFoundException")) {
        console.log("Scanner working...", error);
      }
    };

    try {
      newScanner.render(success, onFailure);
      setScanner(newScanner);
      scannerRef.current = newScanner;
     
      setCameraError(null);
    } catch (err) {
      console.error("Scanner initialization error:", err);
      setCameraError("Failed to initialize camera. Please check camera permissions and try again.");
    }

    return newScanner;
  }, []);

  const resetScanner = useCallback(() => {
    console.log("Resetting scanner...");
    
    // Clear scanner properly
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.log("Error clearing scanner:", error);
      });
      scannerRef.current = null;
    }
    
    if (scanner) {
      scanner.clear().catch(error => {
        console.log("Error clearing scanner:", error);
      });
    }

    setScanResult(null);
    setProduct(null);
    setError(null);
    setCameraError(null);
    setProductNotFound(false);
    setHealthyAlternative(null);
    setIndianInsights(null);
    setIndianAlternatives([]);
    setHealthScore(null);
    setLoading(false);
    setScanner(null);
    setUploadedImage(null);

    if (scanMode === 'camera') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializeScanner();
      }, 500);
    }
  }, [scanner, initializeScanner, scanMode]);

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size client-side first
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Please select an image under 10MB.');
      return;
    }

    setError(null);
    setCameraError(null);
    setProductNotFound(false);
    setLoading(true);
    setUploadedImage(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('image', file);

    try {
    
      
      const response = await axios.post(API_ENDPOINTS.SCAN_UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.data.success) {
       
        setScanResult(response.data.barcode);
        await fetchProductInfo(response.data.barcode);
      } else {
        setError(response.data.error || 'Could not detect barcode in image');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      
      let errorMessage = 'Failed to process image. ';
      
      if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage += 'Network error. Please check your connection.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. Please try again.';
      } else {
        errorMessage += 'Please try another image.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [file] } };
      handleImageUpload(fakeEvent);
    } else {
      setError('Please drop an image file');
    }
  };

  // Switch scan mode
  const switchScanMode = (mode) => {
    // Clear current scanner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
      
      });
      scannerRef.current = null;
    }
    
    if (scanner) {
      scanner.clear().catch(error => {
        console.log("Error clearing scanner during mode switch:", error);
      });
    }

    setScanMode(mode);
    setScanResult(null);
    setProduct(null);
    setError(null);
    setCameraError(null);
    setProductNotFound(false);
    setUploadedImage(null);
    setScanner(null);

    // Initialize scanner if switching to camera mode
    if (mode === 'camera') {
      setTimeout(() => {
        initializeScanner();
      }, 100);
    }
  };

  useEffect(() => {
    if (scanMode === 'camera' && !scannerRef.current) {
      const newScanner = initializeScanner();
      return () => {
      
        if (newScanner) {
          newScanner.clear().catch(error => {
            console.log("Error cleaning up scanner:", error);
          });
        }
      };
    }
  }, [initializeScanner, scanMode]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.log("Error cleaning up scanner on unmount:", error);
        });
      }
    };
  }, []);

  const fetchProductInfo = async (barcode) => {
    setLoading(true);
    setError(null);
    setCameraError(null);
    setProductNotFound(false);
    setIndianInsights(null);
    setIndianAlternatives([]);
    setHealthScore(null);
    
    try {
     
      const response = await axios.get(API_ENDPOINTS.SCAN_PRODUCT(barcode));
   
      
      if (response.data.status === 1) {
        const productData = response.data.product;
        setProduct(productData);
        setProductNotFound(false);
        
        if (productData._indianMatch) {
          setIndianInsights(productData._indianMatch);
        }
        
        if (productData._indianAlternatives && productData._indianAlternatives.length > 0) {
          setIndianAlternatives(productData._indianAlternatives);
        }
        
        calculateHealthScore(productData, productData._indianMatch);
        findHealthyAlternative(productData);
      } else {
        setProductNotFound(true);
        setError('Sorry, food not found in our database. This product might not be available yet.');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      
      // Check if it's a 404 error (product not found)
      if (err.response?.status === 404) {
        setProductNotFound(true);
        setError('Sorry, food not found in our database. This product might not be available yet.');
      } else {
        // Try direct OpenFoodFacts API as fallback
        try {
          console.log('Trying direct OpenFoodFacts API...');
          const directResponse = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
            timeout: 10000
          });
          
          if (directResponse.data.status === 1) {
            const productData = directResponse.data.product;
            setProduct(productData);
            setProductNotFound(false);
            calculateHealthScore(productData, null);
            findHealthyAlternative(productData);
          } else {
            setProductNotFound(true);
            setError('Sorry, food not found in our database. This product might not be available yet.');
          }
        } catch (directErr) {
          console.error('Direct API also failed:', directErr);
          setProductNotFound(true);
          
          if (directErr.code === 'ECONNABORTED' || directErr.code === 'ERR_NETWORK') {
            setError('Network error. Please check your internet connection and try again.');
          } else {
            setError('Sorry, food not found in our database. This product might not be available yet.');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = async (productData, indianMatch) => {
    try {
      const response = await axios.post(API_ENDPOINTS.SCAN_HEALTH_SCORE, {
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

  const ProductNotFoundSection = () => {
    if (!productNotFound) return null;

    return (
      <div className="bg-orange-600 border border-orange-500 p-6 rounded-lg text-center">
        <div className="flex flex-col items-center justify-center">
          <Frown className="w-16 h-16 text-orange-200 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Food Not Found</h2>
          <p className="text-orange-100 text-lg mb-4">
            Sorry, we couldn&apos;t find information for this product in our database.
          </p>
          <div className="bg-orange-700 p-4 rounded-lg mb-4">
            <p className="text-orange-200">
              <strong>Scanned Barcode:</strong> {scanResult}
            </p>
          </div>
          <p className="text-orange-200 mb-4">
            This product might not be available in the database yet, 
            or the barcode might be for a very new product.
          </p>
          <div className="space-y-2 text-orange-100 text-sm">
            <p>💡 <strong>Try these solutions:</strong></p>
            <p>• Scan a different product</p>
            <p>• Check if the barcode is correct</p>
            <p>• Try searching manually for the product</p>
            <p>• This might be a very new product not yet in our database</p>
          </div>
        </div>
      </div>
    );
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
                    Scan barcodes or upload QR code images to get nutrition info
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Camera className="w-5 h-5" />
                  <span>Powered by Open Food Facts</span>
                </div>
              </div>

              {/* Tab Selection */}
              <div className="flex gap-2 mb-6" data-testid="scan-mode-tabs">
                <button
                  onClick={() => switchScanMode('camera')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    scanMode === 'camera'
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                  }`}
                  data-testid="camera-scan-tab"
                >
                  <Camera className="w-5 h-5 inline mr-2" />
                  Scan with Camera
                </button>
                <button
                  onClick={() => switchScanMode('upload')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    scanMode === 'upload'
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                  }`}
                  data-testid="upload-image-tab"
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  Upload Image
                </button>
              </div>

              {/* Camera Scanner */}
              {!scanResult && scanMode === 'camera' && (
                <div className="w-full max-w-md mx-auto">
                  <div id="reader" className="w-full" data-testid="camera-scanner"></div>
                  <div className="mt-4 text-center text-gray-400 text-sm">
                    <p>📷 Point camera at barcode</p>
                    <p>💡 Ensure good lighting</p>
                    <p>⚡ Hold steady for best results</p>
                    <p className="text-xs mt-2 text-gray-500">
                      Scanner may show errors while searching - this is normal
                    </p>
                  </div>
                  
                  {cameraError && (
                    <div className="bg-red-600 text-white p-4 rounded-lg my-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-200 mr-3 flex-shrink-0" />
                        <p>{cameraError}</p>
                      </div>
                      <button 
                        onClick={resetScanner}
                        className="mt-2 bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded transition duration-200"
                      >
                        Retry Camera
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Image Upload Area */}
              {!scanResult && scanMode === 'upload' && (
                <div
                  className="w-full max-w-md mx-auto"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  data-testid="upload-area"
                >
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Upload Barcode or QR Code Image</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Drag and drop an image here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: JPG, PNG, GIF, WebP (EAN-13 barcodes)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="file-input"
                    />
                  </div>
                  
                  {uploadedImage && (
                    <div className="mt-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded barcode"
                        className="w-full max-h-64 object-contain rounded-lg"
                        data-testid="uploaded-image-preview"
                      />
                    </div>
                  )}
                </div>
              )}
              
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Analyzing product with Indian food databases...</p>
                  <p className="text-sm text-gray-500 mt-2">May take some time!</p>
                </div>
              )}
              
              {error && !productNotFound && (
                <div className="bg-red-600 text-white p-4 rounded-lg my-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-200 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Not Found Section */}
            {productNotFound && (
              <div className="space-y-6">
                <ProductNotFoundSection />
                
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

            {/* Product Found Section */}
            {product && !productNotFound && (
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