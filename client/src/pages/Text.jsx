
/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Sparkles, Info, LogIn, Database, Scale, ChevronLeft, ChevronRight, AlertCircle, Beef, Carrot, ChefHat, Drumstick } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "../components/ui/3D-card";
import { useAuth } from "../utils/AuthContext";
import { Link } from "react-router-dom";
import LoadingCard from '../components/ui/loadingCard';

// Helper function to extract gram amount from query
function extractGramAmount(query) {
  if (!query) return null;
  
  // Match patterns like "50g rice", "100g chicken", "25 g pasta", "200g", etc.
  const gramMatch = query.match(/(\d+)\s*g\s*/i);
  if (gramMatch) {
    return parseInt(gramMatch[1]);
  }
  return null;
}

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

// 🆕 Enhanced food type detection with badges
function getFoodTypeBadge(food) {
  if (!food) return { type: 'generic', label: 'Food', color: 'bg-gray-500', icon: Beef };
  
  const name = (food.displayName || food.name || '').toLowerCase();
  const source = food.source || '';
  
  // Raw ingredients from IFCT
  if (food.isRaw || name.includes('raw') || (source.includes('IFCT') && !name.includes('curry') && !name.includes('masala'))) {
    return { type: 'raw', label: 'Raw Ingredient', color: 'bg-green-500', icon: Carrot };
  }
  
  // Chicken-specific badges
  if (name.includes('chicken')) {
    if (name.includes('breast')) return { type: 'breast', label: 'Chicken Breast', color: 'bg-blue-500', icon: Drumstick };
    if (name.includes('thigh')) return { type: 'thigh', label: 'Chicken Thigh', color: 'bg-purple-500', icon: Drumstick };
    if (name.includes('leg') || name.includes('drumstick')) return { type: 'leg', label: 'Chicken Leg', color: 'bg-indigo-500', icon: Drumstick };
    if (name.includes('wing')) return { type: 'wing', label: 'Chicken Wings', color: 'bg-pink-500', icon: Drumstick };
    if (name.includes('mince') || name.includes('keema')) return { type: 'mince', label: 'Chicken Mince', color: 'bg-orange-500', icon: ChefHat };
  }
  
  // Preparation styles
  if (name.includes('curry') || name.includes('masala') || name.includes('gravy')) {
    return { type: 'curry', label: 'Curry Dish', color: 'bg-orange-500', icon: ChefHat };
  }
  if (name.includes('fried')) {
    return { type: 'fried', label: 'Fried', color: 'bg-red-500', icon: ChefHat };
  }
  if (name.includes('grilled') || name.includes('roast') || name.includes('tandoori')) {
    return { type: 'grilled', label: 'Grilled', color: 'bg-yellow-500', icon: ChefHat };
  }
  if (name.includes('biryani') || name.includes('pulao')) {
    return { type: 'biryani', label: 'Biryani', color: 'bg-purple-500', icon: ChefHat };
  }
  
  // Cooked dishes from INDB
  if (food.isCooked || source.includes('INDB')) {
    return { type: 'cooked', label: 'Prepared Dish', color: 'bg-blue-500', icon: ChefHat };
  }
  
  return { type: 'generic', label: 'Food Item', color: 'bg-gray-500', icon: Beef };
}

// 🆕 Get preparation style for display
function getPreparationStyle(food) {
  if (!food) return null;
  
  const name = (food.displayName || food.name || '').toLowerCase();
  
  if (name.includes('curry')) return 'Curry';
  if (name.includes('masala')) return 'Masala';
  if (name.includes('biryani')) return 'Biryani';
  if (name.includes('tandoori')) return 'Tandoori';
  if (name.includes('fried')) return 'Fried';
  if (name.includes('grilled') || name.includes('roast')) return 'Grilled';
  if (name.includes('steam')) return 'Steamed';
  if (name.includes('boil')) return 'Boiled';
  
  return null;
}

// 🆕 Calculate protein density for comparison
function calculateProteinDensity(protein_g, calories) {
  if (!calories || calories === 0) return 0;
  return (protein_g / calories) * 100;
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

// 🆕 Get health indicators based on nutrition values
function getHealthIndicators(food) {
  if (!food) return [];
  
  const indicators = [];
  const protein = food.protein_g || 0;
  const fiber = food.fiber_g || 0;
  const sugar = food.sugar_g || 0;
  const saturatedFat = food.fat_saturated_g || 0;
  const sodium = food.sodium_mg || 0;
  
  if (protein > 15) indicators.push({ type: 'high-protein', label: 'High Protein', color: 'text-green-400' });
  if (fiber > 5) indicators.push({ type: 'high-fiber', label: 'High Fiber', color: 'text-green-400' });
  if (sugar > 20) indicators.push({ type: 'high-sugar', label: 'High Sugar', color: 'text-red-400' });
  if (saturatedFat > 5) indicators.push({ type: 'high-satfat', label: 'High Sat Fat', color: 'text-red-400' });
  if (sodium > 500) indicators.push({ type: 'high-sodium', label: 'High Sodium', color: 'text-red-400' });
  
  return indicators;
}

function FoodAnalyzer({ output, loading, originalQuery, searchAttempted }) {
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

  // Show error message only when a search has been attempted and no results found
  if (!loading && searchAttempted && (!output || output.length === 0)) {
    return (
      <div className="w-full max-w-md mx-auto">
        <CardContainer className="w-full">
          <CardBody className="bg-[#0C0C0C]/90 rounded-xl p-4 border border-red-500/[0.3]">
            <CardItem>
              <CardHeader className="text-center p-4">
                <div className="flex justify-center mb-3">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <CardTitle className="text-lg text-white mb-2">
                  Food Not Found
                </CardTitle>
                <CardDescription className="text-gray-300">
                  We couldn&apos;t find nutrition data for &quot;<span className="text-yellow-400">{originalQuery}</span>&quot;
                </CardDescription>
              </CardHeader>
            </CardItem>
            
            <CardItem>
              <CardContent className="text-center">
                <div className="space-y-3 text-sm text-gray-400">
                  <p>This could be because:</p>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>There might be a typo in the food name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>The food is not in our database</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>Try using more specific names (e.g., &quot;chicken breast&quot; instead of &quot;chicken&quot;)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>Check your spelling and try again</span>
                    </li>
                  </ul>
                  
                  <div className="pt-2 text-xs text-blue-400">
                    <p>Examples: &quot;chicken breast&quot;, &quot;chicken curry&quot;, &quot;100g rice&quot;</p>
                  </div>
                </div>
              </CardContent>
            </CardItem>
          </CardBody>
        </CardContainer>
      </div>
    );
  }

  // Don't show anything if no search has been attempted or no results
  if (!searchAttempted || !output || output.length === 0) {
    return null;
  }

  const currentFood = output[currentIndex];
  
  // Safe check for current food data
  if (!currentFood) {
    console.error('Current food data is undefined:', { output, currentIndex });
    return (
      <div className="w-full max-w-md mx-auto text-center text-red-500 p-4">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Error loading food data. Please try again.</p>
      </div>
    );
  }

  const { pros, cons } = analyzeFood(currentFood);
  const sourceColor = getSourceColor(currentFood.source);
  const badge = getFoodTypeBadge(currentFood);
  const BadgeIcon = badge.icon;
  const preparationStyle = getPreparationStyle(currentFood);
  const healthIndicators = getHealthIndicators(currentFood);
  
  // Extract gram amount from ORIGINAL QUERY (not food name)
  const searchedGrams = extractGramAmount(originalQuery);
  
  // Use displayName from the food data (provided by the enhanced API)
  const displayName = currentFood.displayName || currentFood.name || "Unknown Food";
  
  // Calculate multiplier for nutrition values if searched grams are different from serving size
  const servingSize = currentFood.serving_size_g || 100;
  const multiplier = searchedGrams ? searchedGrams / servingSize : 1;
  
  // Calculate adjusted values for display
  const adjustedCalories = (currentFood.calories || 0) * multiplier;
  const adjustedProtein = (currentFood.protein_g || 0) * multiplier;
  const adjustedCarbs = (currentFood.carbohydrates_total_g || 0) * multiplier;
  const adjustedFat = (currentFood.fat_total_g || 0) * multiplier;
  const adjustedFiber = (currentFood.fiber_g || 0) * multiplier;
  const adjustedSugar = (currentFood.sugar_g || 0) * multiplier;
  const adjustedSaturatedFat = (currentFood.fat_saturated_g || 0) * multiplier;
  const adjustedSodium = (currentFood.sodium_mg || 0) * multiplier;
  const adjustedCholesterol = (currentFood.cholesterol_mg || 0) * multiplier;

  // 🆕 Calculate protein density
  const proteinDensity = calculateProteinDensity(adjustedProtein, adjustedCalories);

  return (
    <div className={`flex flex-col justify-start w-full transition-opacity duration-500 ease-in-out pb-10 ${
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
          💡 Swipe or use arrows to browse different preparations
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
          <CardBody className="bg-[#0C0C0C]/90 rounded-xl p-1 sm:p-2 md:p-3 border border-white/[0.05] min-h-[420px] sm:min-h-[450px] md:min-h-[480px]">
            <CardItem>
              <CardHeader className="p-2 sm:p-3">
                {/* 🆕 Food Type Badge */}
                <div className="flex justify-center mb-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${badge.color} text-white`}>
                    <BadgeIcon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>

                <CardTitle className="text-base sm:text-lg md:text-xl text-white text-center">
                  {displayName}
                </CardTitle>

                {/* 🆕 Food Specifics Row */}
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {/* Cut Type */}
                  {currentFood.cut && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30">
                      🍗 {currentFood.cut}
                    </span>
                  )}
                  
                  {/* Preparation Style */}
                  {preparationStyle && (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs border border-orange-500/30">
                      👨‍🍳 {preparationStyle}
                    </span>
                  )}
                  
                  {/* Protein Density */}
                  {proteinDensity > 0 && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs border border-green-500/30">
                       {proteinDensity.toFixed(1)}g/100kcal
                    </span>
                  )}
                  
                  {/* Raw/Cooked Indicator */}
                  {currentFood.isRaw && (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs border border-gray-500/30">
                      ⚪ Raw
                    </span>
                  )}
                  {currentFood.isCooked && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs border border-yellow-500/30">
                      🟡 Cooked
                    </span>
                  )}
                </div>

                {/* 🆕 Health Indicators */}
                {healthIndicators.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mb-3">
                    {healthIndicators.map((indicator, index) => (
                      <span 
                        key={index}
                        className={`px-2 py-1 rounded text-xs border ${indicator.color} border-current/30`}
                      >
                        {indicator.label}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Searched Gram Information */}
                {searchedGrams && (
                  <CardDescription className="text-xs sm:text-sm text-yellow-400 text-center mt-1">
                    Showing nutrition for: <strong>{searchedGrams}g</strong>
                    {servingSize !== searchedGrams && (
                      <span className="text-gray-400 ml-1">
                        (adjusted from {servingSize}g base)
                      </span>
                    )}
                  </CardDescription>
                )}
                
                {/* Source Information */}
                <CardDescription className="text-xs sm:text-sm flex items-center justify-center gap-1 mt-1">
                  <Database className="w-3 h-3" />
                  <span className="text-gray-400">Source: </span>
                  <span className={sourceColor}>
                    {currentFood.source || "Unknown"}
                  </span>
                </CardDescription>

                {/* Serving Size Information */}
                <CardDescription className="ext-xs sm:text-sm flex items-center justify-center gap-1 mt-1">
                  <Scale className="w-3 h-3" />
                  <span className="text-gray-400">Base Serving: </span>
                  <span className="text-gray-300">
                    {servingSize}g {currentFood.serving_description && `(${currentFood.serving_description})`}
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
                      {formatNumber(adjustedCalories)} kcal
                    </span>
                  </div>

                  {/* Macronutrients */}
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
                    <CardItem>
                      <Card className="bg-[#0C0C0C] border-white/[0.05]">
                        <CardHeader className="p-1 sm:p-2 md:p-3">
                          <CardTitle className="text-xs sm:text-sm md:text-base">Protein</CardTitle>
                          <p className="text-sm sm:text-base md:text-lg font-bold">{formatNumber(adjustedProtein)} g</p>
                        </CardHeader>
                      </Card>
                    </CardItem>
                    <CardItem>
                      <Card className="bg-[#0C0C0C] border-white/[0.05]">
                        <CardHeader className="p-1 sm:p-2 md:p-3">
                          <CardTitle className="text-xs sm:text-sm md:text-base">Carbs</CardTitle>
                          <p className="text-sm sm:text-base md:text-lg font-bold">{formatNumber(adjustedCarbs)} g</p>
                        </CardHeader>
                      </Card>
                    </CardItem>
                    <CardItem>
                      <Card className="bg-[#0C0C0C] border-white/[0.05]">
                        <CardHeader className="p-1 sm:p-2 md:p-3">
                          <CardTitle className="text-xs sm:text-sm md:text-base">Fats</CardTitle>
                          <p className="text-sm sm:text-base md:text-lg font-bold">{formatNumber(adjustedFat)} g</p>
                        </CardHeader>
                      </Card>
                    </CardItem>
                  </div>

                  {/* Additional Nutrients */}
                  {(adjustedFiber > 0 || adjustedSugar > 0 || adjustedSaturatedFat > 0 || adjustedSodium > 0 || adjustedCholesterol > 0) && (
                    <CardItem>
                      <div className="grid grid-cols-2 gap-2">
                        {adjustedFiber > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-white">Dietary Fiber</span>
                            <span className="text-sm font-bold text-white">{formatNumber(adjustedFiber)} g</span>
                          </div>
                        )}
                        {adjustedSugar > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-white">Sugar</span>
                            <span className="text-sm font-bold text-white">{formatNumber(adjustedSugar)} g</span>
                          </div>
                        )}
                        {adjustedSaturatedFat > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-white">Saturated Fat</span>
                            <span className="text-sm font-bold text-white">{formatNumber(adjustedSaturatedFat)} g</span>
                          </div>
                        )}
                        {adjustedSodium > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-white">Sodium</span>
                            <span className="text-sm font-bold text-white">{formatNumber(adjustedSodium)} mg</span>
                          </div>
                        )}
                        {adjustedCholesterol > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-white">Cholesterol</span>
                            <span className="text-sm font-bold text-white">{formatNumber(adjustedCholesterol)} mg</span>
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
        <div className="flex justify-center gap-2 mt-1">
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
