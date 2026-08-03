import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, Check, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import ToolPageShell from "../components/ToolPageShell";
import { API_ENDPOINTS } from "../utils/apiConfig";
import PortionCustomizer, { computeCustomNutrition } from "../components/PortionCustomizer";
import { defaultCustomizeState } from "../utils/portionCustomize";
import { recordImageAnalyzed } from "../utils/progression";
import TrustBadge from "../components/TrustBadge";
import AddToTrackerButton from "../components/AddToTrackerButton";

const mapImageResultToFood = (results) => {
  if (!results?.nutrition) return null;
  // Prefer per-100g IFCT values when present so portion scaling stays accurate
  if (results.nutritionPer100g) {
    return {
      serving_size_g: 100,
      calories: results.nutritionPer100g.calories,
      protein_g: results.nutritionPer100g.protein,
      carbohydrates_total_g: results.nutritionPer100g.carbs,
      fat_total_g: results.nutritionPer100g.fats,
      fiber_g: results.nutritionPer100g.fiber,
      source: results.source,
    };
  }
  const grams = results.portion?.grams || 100;
  return {
    serving_size_g: grams,
    calories: results.nutrition.calories,
    protein_g: results.nutrition.protein,
    carbohydrates_total_g: results.nutrition.carbs,
    fat_total_g: results.nutrition.fats,
    fiber_g: results.nutrition.fiber,
    source: results.source,
  };
};

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
  const [customize, setCustomize] = useState(() => defaultCustomizeState(100));
  
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
      const endpoint = quickMode ? API_ENDPOINTS.IMAGE_QUICK : API_ENDPOINTS.IMAGE_ANALYZE;
      
      const response = await fetch(endpoint, {
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
      recordImageAnalyzed();
      const portionG = data.portion?.grams || 100;
      setCustomize({
        ...defaultCustomizeState(100, portionG),
        open: true,
      });

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
    <ToolPageShell
      eyebrow="Scan"
      title="Food image scan"
      subtitle="Snap or upload a meal photo. We match it to Indian food tables and let you adjust the portion."
      icon={Camera}
      maxWidth="max-w-lg"
    >
      <div className="fa-card overflow-hidden p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron-300/80">
                Vision · IFCT match
              </p>
              <p className="mt-1 text-sm text-white/45">
                Photograph a plate, then refine portion before logging.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/50">
              {getRemainingAnalyses()} left today
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {!showCamera && !previewUrl ? (
                <button
                  onClick={startCamera}
                  className="fa-btn fa-btn-secondary px-4 py-2 text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
              ) : (
                <button
                  className="fa-btn fa-btn-secondary px-4 py-2 text-sm opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
              )}
              
              <button
                onClick={handleUpload}
                disabled={showCamera}
                className={`fa-btn px-4 py-2 text-sm ${
                  showCamera 
                    ? 'fa-btn-secondary opacity-50 cursor-not-allowed' 
                    : 'fa-btn-primary'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              
              {(previewUrl || showCamera) && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-white/15 text-white px-4 py-2 rounded-lg transition-all duration-200 active:scale-95"
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
                  className="relative bg-ink-950 rounded-lg overflow-hidden"
                >
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={capturePhoto}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-saffron-400 text-ink-950 p-3 rounded-full shadow-lg hover:brightness-105 transition-colors active:scale-95"
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
  <div className="absolute inset-0 bg-ink-950 bg-opacity-50 flex items-center justify-center rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-400 mx-auto mb-2"></div>
      <div className="text-white text-sm">
        {isQuickMode ? 'Quick Analysis...' : (
          <>
            <div>Full Analysis in Progress...</div>
            <div className="text-xs text-white/60 mt-1">
              This may take 30-50 seconds
              <br />
              <span className="text-saffron-200">Processing image, analyzing nutrition, and finding healthier alternatives</span>
            </div>
          </>
        )}
        <br/>
        <span className="text-xs text-white/60">
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
                        className="fa-btn fa-btn-secondary w-full py-3 text-sm"
                      >
                        <Zap className="w-4 h-4" />
                        Quick Scan
                      </button>
                      <button
                        onClick={() => analyzeImage(false)}
                        className="fa-btn fa-btn-primary w-full py-3 text-sm"
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
                className="mt-6 border-t border-white/10 pt-4 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold">{results.foodName}</h3>
                    {results.ifctName && results.ifctName !== results.foodName && (
                      <p className="text-xs text-white/45 mt-0.5">IFCT match: {results.ifctName}</p>
                    )}
                    {results.scientificName && (
                      <p className="text-sm text-white/45 italic">{results.scientificName}</p>
                    )}
                    <p className="text-xs text-white/40 mt-1">
                      Source: {results.source || 'Unknown'}
                      {results.confidence != null && (
                        <> · Confidence {results.confidence}% ({results.confidenceDetail?.label || 'n/a'})</>
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <TrustBadge
                        source={results.source}
                        kind="macros"
                        portionAdjusted
                        nutritionBasis={results.nutritionBasis}
                        compact
                      />
                      <TrustBadge kind="vision-portion" compact />
                      <TrustBadge
                        kind="gi"
                        giStatus={results.giStatus}
                        giCitation={results.giCitation}
                        giNote={results.giNote}
                        compact
                      />
                    </div>
                  </div>
                  {results.healthScore != null && (
                    <div className="flex items-center gap-2">
                      <div className={`text-2xl font-bold ${getHealthScoreColor(results.healthScore)}`}>
                        {results.healthScore}
                      </div>
                      {getHealthScoreIcon(results.healthScore)}
                    </div>
                  )}
                </div>

                {results.portion && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                    <span className="text-white/45">Vision estimate: </span>
                    <span className="font-medium">{results.portion.label}</span>
                    <span className="text-white/40"> ({results.portion.grams} g) — adjust below</span>
                  </div>
                )}

                {!isQuickMode && results.nutrition && (() => {
                  const food = mapImageResultToFood(results);
                  const plate = food ? computeCustomNutrition(food, customize) : null;
                  if (!plate) return null;
                  return (
                  <>
                    <PortionCustomizer
                      food={food}
                      state={customize}
                      onChange={setCustomize}
                      compact
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-sm text-white/45">Your plate</div>
                        <div className="text-lg font-semibold">{Math.round(plate.calories)} kcal</div>
                        {plate.oilCalories > 0 && (
                          <div className="text-[10px] text-saffron-300/80 mt-0.5">
                            +{Math.round(plate.oilCalories)} from fat
                          </div>
                        )}
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-sm text-white/45">Protein</div>
                        <div className="text-lg font-semibold">{plate.protein_g.toFixed(1)}g</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-sm text-white/45">Carbs</div>
                        <div className="text-lg font-semibold">{plate.carbohydrates_total_g.toFixed(1)}g</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-sm text-white/45">Fats</div>
                        <div className="text-lg font-semibold">{plate.fat_total_g.toFixed(1)}g</div>
                      </div>
                    </div>
                    {plate.oilCalories > 0 && (
                      <TrustBadge kind="oil" compact />
                    )}
                    <AddToTrackerButton
                      name={results.foodName}
                      calories={plate.calories}
                      protein={plate.protein_g}
                      carbs={plate.carbohydrates_total_g}
                      fat={plate.fat_total_g}
                      grams={plate.portionGrams}
                      source={results.source}
                    />
                    {results.nutritionBasis && (
                      <p className="text-[11px] text-white/40 leading-relaxed">{results.nutritionBasis}</p>
                    )}

                    <div>
                      <div className="flex justify-between text-sm text-white/45 mb-2">
                        <span>Glycemic Index</span>
                        <span>
                          {results.gi != null
                            ? `${results.gi} (${results.giClass || '—'})`
                            : 'Not available'}
                        </span>
                      </div>
                      {results.gi != null ? (
                        <div className="w-full bg-white/15 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              results.gi <= 55 ? 'bg-leaf-400' : 
                              results.gi <= 69 ? 'bg-saffron-400' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, results.gi)}%` }}
                          ></div>
                        </div>
                      ) : (
                        <p className="text-xs text-white/40">
                          No published GI match for this dish in our verified table.
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-white/40 leading-relaxed">
                        Status: <span className="text-white/60">{results.giStatus || 'unavailable'}</span>
                        {results.giLabel ? ` · ${results.giLabel}` : ''}
                        {results.giNote ? ` — ${results.giNote}` : ''}
                      </p>
                      {results.giCitation && (
                        <p className="mt-1 text-[10px] text-white/35 leading-relaxed">{results.giCitation}</p>
                      )}
                    </div>

                    {results.confidenceDetail?.explanation && (
                      <p className="text-[11px] text-white/40 leading-relaxed">
                        {results.confidenceDetail.explanation}
                      </p>
                    )}

                    {results.alternatives && results.alternatives.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-leaf-300">Lower-energy IFCT alternatives</h4>
                        <div className="space-y-2">
                          {results.alternatives.map((alt, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start rounded-xl border border-white/10 bg-white/[0.03] p-3"
                            >
                              <Check className="w-4 h-4 text-leaf-400 mt-1 mr-3 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium">{alt.name}</div>
                                <div className="text-sm text-white/45">
                                  {alt.calories} kcal / 100g
                                  {alt.gi != null ? ` · GI: ${alt.gi}` : ' · GI: n/a'}
                                </div>
                                <div className="text-xs text-leaf-300 mt-1">{alt.reason}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.disclaimer && (
                      <p className="text-[10px] text-white/35 leading-relaxed border-t border-white/10 pt-3">
                        {results.disclaimer}
                      </p>
                    )}
                  </>
                  );
                })()}

                {isQuickMode && (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-white/45">Calories (est. portion): </span>
                      {results.calories} kcal
                    </p>
                    <p className="text-xs text-white/40">
                      Source: {results.source} · Confidence {results.confidence}%
                      {results.gi != null ? ` · GI ${results.gi} (${results.giStatus})` : ' · GI unavailable'}
                    </p>
                  </div>
                )}

                {processingTime > 0 && (
                  <div className="text-xs text-white/40 text-center">
                    Analysis completed in {Math.round(processingTime)}ms
                    {isQuickMode && ' (Quick Mode)'}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </ToolPageShell>
  );
};

export default FoodScanner;
