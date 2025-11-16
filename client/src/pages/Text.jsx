
/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Sparkles, Info, LogIn, Database, Scale, ChevronLeft, ChevronRight } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "../components/ui/3D-card";
import { useAuth } from "../utils/AuthContext";
import { Link } from "react-router-dom";
import LoadingCard from '../components/ui/loadingCard';

function analyzeFood(food) {
  // Safe access with default values
  if (!food) {
    return { pros: [], cons: [] };
  }

  const pros = []
  const cons = []

  const protein = food.protein_g || 0;
  const carbs = food.carbohydrates_total_g || 0;
  const fiber = food.fiber_g || 0;
  const sugar = food.sugar_g || 0;
  const fat = food.fat_total_g || 0;
  const saturatedFat = food.fat_saturated_g || 0;
  const sodium = food.sodium_mg || 0;
  const cholesterol = food.cholesterol_mg || 0;
  const calories = food.calories || 0;

  if (protein > 20) pros.push("High in protein")
  else if (protein > 10) pros.push("Good source of protein")

  if (carbs < 5) pros.push("Low in carbs")
  else if (carbs > 50) cons.push("High in carbohydrates")

  if (fiber > 5) pros.push("High in fiber")
  if (sugar > 10) cons.push("High in sugar")
  if (fat > 15) cons.push("High in fat")
  if (saturatedFat > 5) cons.push("High in saturated fat")
  if (sodium > 500) cons.push("High in sodium")
  if (cholesterol > 50) cons.push("Contains cholesterol")
  if (calories < 100) pros.push("Low calorie food")

  return { pros, cons }
}

// Helper function to get source color
function getSourceColor(source) {
  if (source?.includes('IFCT')) return 'text-blue-400';
  if (source?.includes('INDB')) return 'text-green-400';
  if (source?.includes('CalorieNinjas')) return 'text-yellow-400';
  return 'text-gray-400';
}

// Helper function to format numbers to 2 decimal places
function formatNumber(value) {
  if (value === undefined || value === null) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}

function FoodAnalyzer({ output, loading }) {
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(0);

  useEffect(() => {
    let loadingTimer;

    if (loading) {
      loadingTimer = setTimeout(() => {
        setShowLoading(true);
      }, 1400);
    } else {
      setShowLoading(false);
    }

    return () => clearTimeout(loadingTimer);
  }, [loading]);

  useEffect(() => {
    if (!loading && output?.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [loading, output]);

  // Reset to first item when new results come in
  useEffect(() => {
    if (output?.length > 0) {
      setCurrentIndex(0);
    }
  }, [output]);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!startX || !endX) return;
    
    const diff = startX - endX;
    const swipeThreshold = 50;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next item
        handleNext();
      } else {
        // Swipe right - previous item
        handlePrevious();
      }
    }
    
    setStartX(0);
    setEndX(0);
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
  };

  const handleMouseUp = (e) => {
    setEndX(e.clientX);
    
    if (!startX) return;
    
    const diff = startX - e.clientX;
    const swipeThreshold = 50;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    
    setStartX(0);
    setEndX(0);
  };

  const handleNext = () => {
    if (output && output.length > 0) {
      setCurrentIndex((prevIndex) => 
        prevIndex === output.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevious = () => {
    if (output && output.length > 0) {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? output.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading && showLoading) {
    return (
      <div className="w-full max-w-xs mx-auto">
        <LoadingCard />
      </div>
    );
  }

  if (!output || output.length === 0) {
    return null;
  }

  const currentFood = output[currentIndex];
  
  // Safe check for current food data
  if (!currentFood) {
    console.error('Current food data is undefined:', { output, currentIndex });
    return null;
  }

  const { pros, cons } = analyzeFood(currentFood);
  const sourceColor = getSourceColor(currentFood.source);

  return (
    <div className={`flex flex-col justify-center items-center w-full gap-4 transition-opacity duration-500 ease-in-out ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      
      {/* Navigation Controls */}
      {output.length > 1 && (
        <div className="flex items-center justify-center gap-4 mb-2">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            aria-label="Previous result"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          
          <div className="text-xs text-gray-400">
            {currentIndex + 1} of {output.length}
          </div>
          
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            aria-label="Next result"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Swipe Instructions */}
      {output.length > 1 && (
        <div className="text-xs text-gray-500 text-center mb-2">
          💡 Swipe or use arrows to browse results
        </div>
      )}

      <div 
        className="w-full max-w-md mx-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ cursor: output.length > 1 ? 'grab' : 'default' }}
      >
        <CardContainer className="w-full">
          <CardBody className="bg-[#0C0C0C]/90 rounded-xl p-1 sm:p-2 md:p-3 border border-white/[0.05]">
            <CardItem>
              <CardHeader className="p-2 sm:p-3">
                <CardTitle className="text-base sm:text-lg md:text-xl text-white text-center">
                  {currentFood.name || "Unknown Food"}
                </CardTitle>
                
                {/* Source Information */}
                <CardDescription className="text-xs sm:text-sm flex items-center justify-center gap-1 mt-1">
                  <Database className="w-3 h-3" />
                  <span className="text-gray-400">Source: </span>
                  <span className={sourceColor}>
                    {currentFood.source || "Unknown"}
                  </span>
                </CardDescription>

                {/* Serving Size Information */}
                <CardDescription className="text-xs sm:text-sm flex items-center justify-center gap-1 mt-1">
                  <Scale className="w-3 h-3" />
                  <span className="text-gray-400">Serving: </span>
                  <span className="text-gray-300">
                    {currentFood.serving_size_g || 100}g {currentFood.serving_description && `(${currentFood.serving_description})`}
                  </span>
                </CardDescription>

                {/* Login Prompt */}
                {!isAuthenticated && (
                  <CardDescription className="mt-1 sm:mt-2 text-blue-400 flex items-center justify-center gap-1 sm:gap-2 text-xs">
                    <LogIn className="w-3 h-3" />
                    <Link to="/login" className="underline text-red-400 hover:text-blue-300">
                      Log in to save history
                    </Link>
                  </CardDescription>
                )}
              </CardHeader>
            </CardItem>

            <CardItem>
              <CardContent className="px-2 py-1 sm:p-3">
                <div className="grid gap-2 sm:gap-3">
                  {/* Total Calories */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm md:text-base text-white">Total Calories</span>
                    <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                      {formatNumber(currentFood.calories)} kcal
                    </span>
                  </div>

                  {/* Macronutrients */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
                    <CardItem>
                      <Card className="bg-[#0C0C0C] border-white/[0.05]">
                        <CardHeader className="p-1 sm:p-2 md:p-3">
                          <CardTitle className="text-xs sm:text-sm md:text-base">Protein</CardTitle>
                          <p className="text-sm sm:text-base md:text-lg font-bold">{formatNumber(currentFood.protein_g)} g</p>
                        </CardHeader>
                      </Card>
                    </CardItem>
                    <CardItem>
                      <Card className="bg-[#0C0C0C] border-white/[0.05]">
                        <CardHeader className="p-1 sm:p-2 md:p-3">
                          <CardTitle className="text-xs sm:text-sm md:text-base">Carbs</CardTitle>
                          <p className="text-sm sm:text-base md:text-lg font-bold">{formatNumber(currentFood.carbohydrates_total_g)} g</p>
                        </CardHeader>
                      </Card>
                    </CardItem>
                    <CardItem>
                      <Card className="bg-[#0C0C0C] border-white/[0.05]">
                        <CardHeader className="p-1 sm:p-2 md:p-3">
                          <CardTitle className="text-xs sm:text-sm md:text-base">Fats</CardTitle>
                          <p className="text-sm sm:text-base md:text-lg font-bold">{formatNumber(currentFood.fat_total_g)} g</p>
                        </CardHeader>
                      </Card>
                    </CardItem>
                  </div>

                  {/* Additional Nutrients */}
                  {(currentFood.fiber_g > 0 || currentFood.sugar_g > 0) && (
                    <CardItem>
                      <div className="grid grid-cols-2 gap-2">
                        {currentFood.fiber_g > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-white">Dietary Fiber</span>
                            <span className="text-sm font-bold text-white">{formatNumber(currentFood.fiber_g)} g</span>
                          </div>
                        )}
                        {currentFood.sugar_g > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-white">Sugar</span>
                            <span className="text-sm font-bold text-white">{formatNumber(currentFood.sugar_g)} g</span>
                          </div>
                        )}
                      </div>
                    </CardItem>
                  )}

                  {/* Nutrition Analysis */}
                  <CardItem>
                    <div className="grid gap-1 sm:gap-2">
                      <h3 className="font-semibold text-white text-xs sm:text-sm md:text-base">Nutrition Analysis</h3>
                      <div className="grid gap-1 sm:gap-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                            Benefits <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                          </h4>
                          <ul className="list-disc pl-3 sm:pl-4 text-green-400 text-xs">
                            {pros.length > 0 ? (
                              pros.map((pro, i) => <li key={i}>{pro}</li>)
                            ) : (
                              <li>No major benefits identified</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                            Considerations <Info className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                          </h4>
                          <ul className="list-disc pl-3 sm:pl-4 text-red-400 text-xs">
                            {cons.length > 0 ? (
                              cons.map((con, i) => <li key={i}>{con}</li>)
                            ) : (
                              <li>No major considerations</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardItem>
                </div>
              </CardContent>
            </CardItem>
          </CardBody>
        </CardContainer>
      </div>

      {/* Dot Indicators */}
      {output.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {output.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to result ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FoodAnalyzer;
