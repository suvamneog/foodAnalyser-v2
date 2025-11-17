import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, Check, AlertTriangle, Zap } from 'lucide-react';
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion, AnimatePresence } from "framer-motion";

// API base URL - matches your server configuration
const API_BASE_URL = 'https://foodanalyser.onrender.com/api';

const FoodScanner = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Initialize analysis count
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedCount = localStorage.getItem(`analysisCount_${today}`);
    if (storedCount) {
      setAnalysisCount(parseInt(storedCount, 10));
    } else {
      setAnalysisCount(0);
      localStorage.setItem(`analysisCount_${today}`, '0');
    }
  }, []);

  // Image compression function
  const compressImage = useCallback(async (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', 0.7);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        setImage(compressedFile);
        setPreviewUrl(URL.createObjectURL(compressedBlob));
        setResults(null);
        setError(null);
        setShowCamera(false);
      } catch (err) {
        console.error('Image compression failed:', err);
        // Fallback to original file
        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResults(null);
        setError(null);
        setShowCamera(false);
      }
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClear = useCallback(() => {
    setImage(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
    setShowCamera(false);
    setProcessingTime(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    stopCameraStream();
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleClear();
    };
  }, [handleClear]);

  const startCamera = async () => {
    try {
      setShowCamera(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setResults(null);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
      setShowCamera(false);
    }
  };

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const compressedBlob = await compressImage(new File([blob], "capture.jpg"));
            const file = new File([compressedBlob], "captured-food.jpg", { type: "image/jpeg" });
            
            setImage(file);
            setPreviewUrl(URL.createObjectURL(compressedBlob));
            setShowCamera(false);
            stopCameraStream();
          } catch (err) {
            console.error('Photo compression failed:', err);
            const file = new File([blob], "captured-food.jpg", { type: "image/jpeg" });
            setImage(file);
            setPreviewUrl(URL.createObjectURL(blob));
            setShowCamera(false);
            stopCameraStream();
          }
        }
      }, 'image/jpeg', 0.8);
    }
  }, [compressImage, stopCameraStream]);

  const analyzeImage = async (quickMode = false) => {
    if (!image) return;

    if (analysisCount >= 10) {
      setError('Daily limit reached (10 analyses). Please try again tomorrow.');
      return;
    }

    setIsAnalyzing(true);
    setIsQuickMode(quickMode);
    setError(null);
    
    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append('foodImage', image);

    const startTime = performance.now();

    try {
      const endpoint = quickMode ? '/image/quick-score' : '/image/analyzefood';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      
      setProcessingTime(performance.now() - startTime);
      setResults(data);

      const today = new Date().toISOString().split('T')[0];
      const newCount = analysisCount + 1;
      setAnalysisCount(newCount);
      localStorage.setItem(`analysisCount_${today}`, newCount.toString());

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      console.error('Error analyzing food:', err);
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthScoreIcon = (score) => {
    if (score >= 70) return <Check className="w-5 h-5 text-green-500" />;
    if (score >= 40) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <X className="w-5 h-5 text-red-500" />;
  };

  const getRemainingAnalyses = () => Math.max(0, 10 - analysisCount);

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <StarsBackground />
        <ShootingStars />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900 rounded-xl shadow-2xl overflow-hidden p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Food Scanner
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Scan food images for instant nutrition insights
            </p>
            <div className="text-xs text-gray-500 mt-1">
              {getRemainingAnalyses()} analyses remaining today
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {!showCamera && !previewUrl ? (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
              )}
              
              <button
                onClick={handleUpload}
                disabled={showCamera}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  showCamera 
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              
              {(previewUrl || showCamera) && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 active:scale-95"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <AnimatePresence>
              {showCamera && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative bg-black rounded-lg overflow-hidden"
                >
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={capturePhoto}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors active:scale-95"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                  <canvas ref={canvasRef} className="hidden" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {previewUrl && !showCamera && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Food preview"
                      className="w-full h-64 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                      onClick={() => !isAnalyzing && analyzeImage(false)}
                    />
                   {isAnalyzing && (
  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
      <div className="text-white text-sm">
        {isQuickMode ? 'Quick Analysis...' : (
          <>
            <div>Full Analysis in Progress...</div>
            <div className="text-xs text-gray-300 mt-1">
              This may take 30-50 seconds
              <br />
              <span className="text-yellow-300">Processing image, analyzing nutrition, and finding healthier alternatives</span>
            </div>
          </>
        )}
        <br/>
        <span className="text-xs text-gray-300">
          {processingTime > 0 ? `${Math.round(processingTime)}ms` : 'Processing'}
        </span>
      </div>
    </div>
  </div>
)}

                  </div>

                  {!isAnalyzing && !results && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => analyzeImage(true)}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-200 active:scale-95"
                      >
                        <Zap className="w-4 h-4" />
                        Quick Scan
                      </button>
                      <button
                        onClick={() => analyzeImage(false)}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all duration-200 active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        Full Analysis
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 border-t border-zinc-700 pt-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{results.foodName}</h3>
                    {results.scientificName && (
                      <p className="text-sm text-gray-400">{results.scientificName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-2xl font-bold ${getHealthScoreColor(results.healthScore)}`}>
                      {results.healthScore}
                    </div>
                    {getHealthScoreIcon(results.healthScore)}
                  </div>
                </div>

                {!isQuickMode && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="text-sm text-gray-400">Calories</div>
                        <div className="text-lg font-semibold">{results.nutrition.calories} kcal</div>
                      </div>
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="text-sm text-gray-400">Protein</div>
                        <div className="text-lg font-semibold">{results.nutrition.protein}g</div>
                      </div>
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="text-sm text-gray-400">Carbs</div>
                        <div className="text-lg font-semibold">{results.nutrition.carbs}g</div>
                      </div>
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="text-sm text-gray-400">Fats</div>
                        <div className="text-lg font-semibold">{results.nutrition.fats}g</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Glycemic Index</span>
                        <span>{results.gi} ({results.gi < 55 ? 'Low' : results.gi < 70 ? 'Medium' : 'High'})</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            results.gi < 55 ? 'bg-green-500' : 
                            results.gi < 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, results.gi)}%` }}
                        ></div>
                      </div>
                    </div>

                    {results.alternatives && results.alternatives.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-green-400">Healthier Alternatives</h4>
                        <div className="space-y-2">
                          {results.alternatives.map((alt, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start p-3 bg-zinc-800 rounded-lg"
                            >
                              <Check className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium">{alt.name}</div>
                                <div className="text-sm text-gray-400">
                                  {alt.calories} kcal • GI: {alt.gi}
                                </div>
                                <div className="text-xs text-green-300 mt-1">{alt.reason}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {processingTime > 0 && (
                  <div className="text-xs text-gray-500 text-center">
                    Analysis completed in {Math.round(processingTime)}ms
                    {isQuickMode && ' (Quick Mode)'}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default FoodScanner;