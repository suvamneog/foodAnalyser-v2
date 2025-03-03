import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, AlertTriangle } from 'lucide-react';
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";

const FoodScanner = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0); // Track analysis count
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize analysis count from localStorage or set to 0
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const storedCount = localStorage.getItem(`analysisCount_${today}`);
    if (storedCount) {
      setAnalysisCount(parseInt(storedCount, 10));
    } else {
      setAnalysisCount(0);
      localStorage.setItem(`analysisCount_${today}`, '0');
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setError(null);
      setShowCamera(false);
    }
  };

  const handleUpload = () => {
    fileInputRef.current.click();
  };

  const handleClear = () => {
    setImage(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
    setShowCamera(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    stopCameraStream();
  };

  const startCamera = async () => {
    try {
      // Set showCamera to true FIRST to ensure the video element gets rendered
      setShowCamera(true);
      
      // Add a small delay to allow the video element to be rendered
      setTimeout(async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Camera access is not supported in this browser.');
            return;
          }

          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setResults(null);
            setError(null);
            console.log('Camera started successfully');
          } else {
            console.error('Video element not found after delay');
            setError('Could not initialize camera. Please try again.');
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setError('Could not access camera. Please check permissions or try uploading an image instead.');
        }
      }, 300); // 300ms delay
    } catch (err) {
      console.error('Error in camera setup:', err);
      setError('Camera initialization failed.');
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "captured-food.jpg", { type: "image/jpeg" });
          setImage(file);
          setPreviewUrl(URL.createObjectURL(blob));
          setShowCamera(false);
          stopCameraStream();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    // Check if the user has exceeded the daily limit
    if (analysisCount >= 5) {
      setError('You have reached the daily limit of 5 analyses. Please try again tomorrow.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
  
    const formData = new FormData();
    formData.append('foodImage', image);
  
    try {
      const response = await fetch('https://foodanalyser.onrender.com/api/image/analyzefood', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze food image');
      }
  
      const data = await response.json();
      setResults(data);

      // Increment the analysis count
      const today = new Date().toISOString().split('T')[0];
      const newCount = analysisCount + 1;
      setAnalysisCount(newCount);
      localStorage.setItem(`analysisCount_${today}`, newCount.toString());
    } catch (err) {
      console.error('Error analyzing food:', err);
      setError(`Failed to analyze the food image: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
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
          <div className="max-w-md mx-auto bg-zinc-900 rounded-xl shadow-md overflow-hidden p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Food Scanner</h2>
            <p className="text-gray-400 mb-6 text-center">
              Scan food images to get detailed nutrition insights
            </p>

            <div className="mb-6">
              <div className="flex justify-center gap-4 mb-4">
                {/* Hide or disable Use Camera button when camera is showing or image is uploaded */}
                {!showCamera && !previewUrl ? (
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Use Camera
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <Camera className="w-5 h-5" />
                    Use Camera
                  </button>
                )}
                
                {/* Upload Image button - disabled when camera is showing */}
                <button
                  onClick={handleUpload}
                  className={`flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg ${
                    showCamera ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                  } transition-colors`}
                  disabled={showCamera}
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </button>
                
                {/* Only show Clear button when there's something to clear */}
                {(previewUrl || showCamera) && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
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

              {showCamera && (
                <div className="relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={capturePhoto}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-blue-500 p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {previewUrl && !showCamera && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Food preview"
                    className="w-full h-64 object-cover rounded-lg cursor-pointer"
                    onClick={analyzeImage}
                  />
                  {!results && !isAnalyzing && (
                    <button
                      onClick={analyzeImage}
                      className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Analyze Food
                    </button>
                  )}
                  {isAnalyzing && (
                    <div className="mt-4 text-center text-gray-400">
                      <div className="animate-pulse">Analyzing your food...</div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {results && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-xl font-semibold mb-3">{results.foodName}</h3>
                
                <div className="flex items-center mb-4">
                  <div className={`text-2xl font-bold ${getHealthScoreColor(results.healthScore)}`}>
                    {results.healthScore}
                  </div>
                  <div className="ml-2 flex items-center">
                    {getHealthScoreIcon(results.healthScore)}
                    <span className="ml-1 text-sm text-gray-400">Health Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
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

                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-2">Glycemic Index</div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          results.gi < 55 ? 'bg-green-500' : 
                          results.gi < 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, results.gi)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">{results.gi}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {results.gi < 55 ? 'Low GI' : 
                     results.gi < 70 ? 'Medium GI' : 'High GI'}
                  </div>
                </div>

                {results.alternatives && results.alternatives.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Healthier Alternatives</h4>
                    <ul className="space-y-2">
                      {results.alternatives.map((alt, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{alt.name}</div>
                            <div className="text-sm text-gray-400">
                              {alt.calories} kcal | GI: {alt.gi}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FoodScanner;



