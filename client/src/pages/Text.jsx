
/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Sparkles, Info, LogIn, Database, Scale, ChevronLeft, ChevronRight, AlertCircle, Beef, Carrot, ChefHat, Drumstick } from "lucide-react";
import { CardItem } from "../components/ui/3D-card";
import { useAuth } from "../utils/AuthContext";
import { Link } from "react-router-dom";
import LoadingCard from '../components/ui/loadingCard';
import PortionCustomizer, { computeCustomNutrition } from '../components/PortionCustomizer';
import { defaultCustomizeState } from '../utils/portionCustomize';
import RegionChips from '../components/RegionChips';
import TrustBadge from '../components/TrustBadge';
import AddToTrackerButton from '../components/AddToTrackerButton';
import {
  customizeStateFromVariant,
  REGIONAL_VARIANTS,
} from '../data/regionalVariants';
import { fetchSuggest } from '../utils/searchSuggest';
import { POPULAR_SEARCHES } from '../data/discoveryData';

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

function FoodAnalyzer({ output, loading, originalQuery, searchAttempted, regionalPreset = null, onSuggestionClick }) {
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(0);
  const [customize, setCustomize] = useState(() => defaultCustomizeState(100));
  const [selectedRegionId, setSelectedRegionId] = useState("all");
  const [selectedVariantId, setSelectedVariantId] = useState(null);

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
      const first = output[0];
      const grams = extractGramAmount(originalQuery);

      if (regionalPreset?.customize) {
        setCustomize({ ...regionalPreset.customize, open: true });
        setSelectedRegionId(regionalPreset.regionId || "all");
        setSelectedVariantId(regionalPreset.variantId || null);
      } else if (regionalPreset?.variantId) {
        const variant = REGIONAL_VARIANTS.find((v) => v.id === regionalPreset.variantId);
        if (variant) {
          setCustomize(customizeStateFromVariant(variant));
          setSelectedRegionId(variant.regionId);
          setSelectedVariantId(variant.id);
        } else {
          setCustomize(defaultCustomizeState(first?.serving_size_g || 100, grams));
          setSelectedRegionId("all");
          setSelectedVariantId(null);
        }
      } else {
        setCustomize(defaultCustomizeState(first?.serving_size_g || 100, grams));
        setSelectedRegionId("all");
        setSelectedVariantId(null);
      }
    }
  }, [output, originalQuery, regionalPreset]);

  // Keep portion customizer base in sync when swiping between preparations
  useEffect(() => {
    if (!output?.[currentIndex]) return;
    if (selectedVariantId) return; // regional preset owns portion/fat
    const food = output[currentIndex];
    const grams = extractGramAmount(originalQuery);
    setCustomize((prev) => ({
      ...defaultCustomizeState(food?.serving_size_g || 100, grams),
      open: prev.open,
      fatId: prev.fatId,
      fatAmountId: prev.fatAmountId,
      portionPresetId: prev.portionPresetId,
      customGrams: prev.customGrams,
    }));
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

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
    return <NoResultsCard query={originalQuery} onPick={onSuggestionClick} />;
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
  
  const searchedGrams = extractGramAmount(originalQuery);
  const displayName = currentFood.displayName || currentFood.name || "Unknown Food";
  const servingSize = currentFood.serving_size_g || 100;

  const plate = computeCustomNutrition(currentFood, customize);

  const adjustedCalories = plate.calories;
  const adjustedProtein = plate.protein_g;
  const adjustedCarbs = plate.carbohydrates_total_g;
  const adjustedFat = plate.fat_total_g;
  const adjustedFiber = plate.fiber_g;
  const adjustedSugar = plate.sugar_g;
  const adjustedSaturatedFat = plate.fat_saturated_g;
  const adjustedSodium = plate.sodium_mg;
  const adjustedCholesterol = plate.cholesterol_mg;

  const proteinDensity = calculateProteinDensity(adjustedProtein, adjustedCalories);

  return (
   <div className={`flex flex-col justify-center items-center w-full gap-4 transition-opacity duration-500 ease-in-out ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      
      {/* Navigation Controls */}
      {output.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePrevious}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-saffron-400/40"
            aria-label="Previous result"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          
          <div className="fa-chip-chunky text-[11px] text-white/70">
            <span className="fa-num text-saffron-200">{currentIndex + 1}</span>
            <span className="text-white/40">/</span>
            <span>{output.length}</span>
          </div>
          
          <button
            onClick={handleNext}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-saffron-400/40"
            aria-label="Next result"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </div>
      )}

      {/* Swipe Instructions */}
      {output.length > 1 && (
        <div className="text-center text-[11px] text-white/40">
          Swipe or use arrows to browse different preparations
        </div>
      )}

      <RegionChips
        query={originalQuery}
        foodName={displayName}
        selectedRegionId={selectedRegionId}
        selectedVariantId={selectedVariantId}
        onSelectRegion={(regionId) => {
          setSelectedRegionId(regionId);
          if (regionId === "all") {
            setSelectedVariantId(null);
            const grams = extractGramAmount(originalQuery);
            setCustomize((prev) => ({
              ...defaultCustomizeState(servingSize, grams),
              open: prev.open,
            }));
          }
        }}
        onSelectVariant={(variantId, nextCustomize) => {
          setSelectedVariantId(variantId);
          if (nextCustomize) setCustomize(nextCustomize);
        }}
      />

      <div 
        className="w-full max-w-md mx-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ cursor: output.length > 1 ? 'grab' : 'default' }}
      >
        <div className="fa-sticker relative w-full overflow-hidden border-white/12 bg-ink-900/90 p-2 sm:p-3 md:p-4">
          <CardItem>
  <CardHeader className="p-2 sm:p-3">
    {/* Food Type Badge */}
    <div className="mb-2 flex justify-center sm:mb-3">
      <span className={`fa-chip-chunky text-[11px] ${badge.color.includes('green') || badge.color.includes('emerald') ? 'fa-sticker-leaf' : badge.color.includes('orange') || badge.color.includes('yellow') || badge.color.includes('red') ? 'fa-sticker-ember' : badge.color.includes('purple') ? 'fa-sticker-plum' : badge.color.includes('blue') ? 'fa-sticker-sky' : 'fa-sticker-saffron'}`}>
        <BadgeIcon className="h-3.5 w-3.5" />
        {badge.label}
      </span>
    </div>

    <CardTitle className="break-words px-1 text-center font-display text-base font-extrabold tracking-tight text-white sm:text-lg md:text-xl">
      {displayName}
    </CardTitle>

    {/* Food Specifics Row */}
    <div className="mb-2 flex flex-wrap justify-center gap-1.5 sm:mb-3">
      {currentFood.cut && (
        <span className="rounded-full border border-sky2-400/35 bg-sky2-500/12 px-2 py-0.5 text-[10px] font-semibold text-sky2-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {currentFood.cut}
        </span>
      )}
      {preparationStyle && (
        <span className="rounded-full border border-ember-400/35 bg-ember-500/12 px-2 py-0.5 text-[10px] font-semibold text-ember-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {preparationStyle}
        </span>
      )}
      {proteinDensity > 0 && (
        <span className="rounded-full border border-mint-400/35 bg-mint-500/12 px-2 py-0.5 text-[10px] font-semibold text-mint-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {proteinDensity.toFixed(1)}g / 100 kcal
        </span>
      )}
      {currentFood.isRaw && (
        <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
          Raw
        </span>
      )}
      {currentFood.isCooked && (
        <span className="rounded-full border border-saffron-400/35 bg-saffron-500/12 px-2 py-0.5 text-[10px] font-semibold text-saffron-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          Cooked
        </span>
      )}
    </div>

    {/* Health Indicators */}
    {healthIndicators.length > 0 && (
      <div className="mb-2 flex flex-wrap justify-center gap-1.5 sm:mb-3">
        {healthIndicators.map((indicator, index) => (
          <span 
            key={index}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              indicator.color.includes('green')
                ? 'border-mint-400/35 bg-mint-500/10 text-mint-300'
                : 'border-ember-400/35 bg-ember-500/10 text-ember-300'
            }`}
          >
            {indicator.label}
          </span>
        ))}
      </div>
    )}
    
    {searchedGrams && (
      <CardDescription className="mt-1 break-words px-1 text-center text-xs text-saffron-200/90">
        Showing nutrition for: <strong className="fa-num">{searchedGrams}g</strong>
        {servingSize !== searchedGrams && (
          <span className="ml-1 text-[11px] text-white/40">
            (adjusted from {servingSize}g base)
          </span>
        )}
      </CardDescription>
    )}
    
    {/* Source + trust — keep sober */}
    <CardDescription className="mt-1.5 flex flex-wrap items-center justify-center gap-1 text-xs">
      <Database className="h-3 w-3 text-white/45" />
      <span className="text-white/45">Source:</span>
      <span className={`font-semibold ${sourceColor}`}>
        {currentFood.source || "Unknown"}
      </span>
    </CardDescription>
    <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
      <TrustBadge
        source={currentFood.source}
        kind="macros"
        portionAdjusted={plate.portionGrams !== 100 || plate.oilCalories > 0}
        compact
      />
      {plate.oilCalories > 0 && (
        <TrustBadge kind="oil" compact />
      )}
    </div>

    <CardDescription className="mt-1.5 flex flex-wrap items-center justify-center gap-1 text-xs">
      <Scale className="h-3 w-3 text-white/45" />
      <span className="text-white/45">Showing for:</span>
      <span className="font-semibold text-white/80">
        {plate.portionGrams}g
        {plate.oilCalories > 0 && (
          <span className="text-amber-300/80"> + fat</span>
        )}
      </span>
    </CardDescription>

    {!isAuthenticated && (
      <CardDescription className="mt-2 flex items-center justify-center gap-1.5 text-xs text-saffron-200/90">
        <LogIn className="h-3 w-3" />
        <Link to="/login" className="font-semibold underline decoration-saffron-400/50 underline-offset-2 hover:text-saffron-100">
          Log in to save history
        </Link>
      </CardDescription>
    )}
  </CardHeader>
</CardItem>

            <CardItem>
              <CardContent className="px-2 py-1 sm:p-3">
                <div className="grid gap-3">
                  <PortionCustomizer
                    food={currentFood}
                    state={customize}
                    onChange={setCustomize}
                  />

                  {/* Plate total — hero number */}
                  <div className="fa-sticker fa-sticker-saffron relative flex items-center justify-between px-3.5 py-3">
                    <div className="relative">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron-200/80">
                        Your plate
                      </p>
                      {plate.oilCalories > 0 && (
                        <p className="mt-0.5 text-[10px] text-white/45">
                          Food {Math.round(plate.foodCalories)} + fat {Math.round(plate.oilCalories)}
                        </p>
                      )}
                    </div>
                    <p className="fa-num relative text-2xl text-white sm:text-3xl">
                      {Math.round(Number(adjustedCalories) || 0)}
                      <span className="ml-1 text-sm font-semibold text-white/55">kcal</span>
                    </p>
                  </div>

                  <AddToTrackerButton
                    name={currentFood.displayName || currentFood.name}
                    calories={plate.calories}
                    protein={plate.protein_g}
                    carbs={plate.carbohydrates_total_g}
                    fat={plate.fat_total_g}
                    grams={plate.portionGrams}
                    source={currentFood.source}
                    className="mt-0.5 justify-center"
                  />

                  {/* Macronutrients — sticker tiles */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Protein", value: adjustedProtein, tone: "fa-sticker-leaf" },
                      { label: "Carbs", value: adjustedCarbs, tone: "fa-sticker-sky" },
                      { label: "Fats", value: adjustedFat, tone: "fa-sticker-ember" },
                    ].map((m) => (
                      <div key={m.label} className={`fa-sticker ${m.tone} p-2.5 text-center sm:p-3`}>
                        <p className="relative text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                          {m.label}
                        </p>
                        <p className="fa-num relative mt-1 text-lg text-white sm:text-xl">
                          {formatNumber(m.value)}
                          <span className="ml-0.5 text-[11px] font-semibold text-white/50">g</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Additional Nutrients — keep quiet/reliable */}
                  {(adjustedFiber > 0 || adjustedSugar > 0 || adjustedSaturatedFat > 0 || adjustedSodium > 0 || adjustedCholesterol > 0) && (
                    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {adjustedFiber > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Fiber</span>
                            <span className="font-semibold text-white/85">{formatNumber(adjustedFiber)} g</span>
                          </div>
                        )}
                        {adjustedSugar > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Sugar</span>
                            <span className="font-semibold text-white/85">{formatNumber(adjustedSugar)} g</span>
                          </div>
                        )}
                        {adjustedSaturatedFat > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Sat. fat</span>
                            <span className="font-semibold text-white/85">{formatNumber(adjustedSaturatedFat)} g</span>
                          </div>
                        )}
                        {adjustedSodium > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Sodium</span>
                            <span className="font-semibold text-white/85">{formatNumber(adjustedSodium)} mg</span>
                          </div>
                        )}
                        {adjustedCholesterol > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Cholesterol</span>
                            <span className="font-semibold text-white/85">{formatNumber(adjustedCholesterol)} mg</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nutrition Analysis */}
                  <div className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                      Nutrition analysis
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-mint-400/20 bg-mint-500/8 p-2.5">
                        <h4 className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-mint-300">
                          Benefits <Sparkles className="h-3 w-3" />
                        </h4>
                        <ul className="space-y-0.5 text-[11px] leading-relaxed text-white/70">
                          {pros.length > 0 ? (
                            pros.map((pro, i) => <li key={i}>• {pro}</li>)
                          ) : (
                            <li>• No major benefits identified</li>
                          )}
                        </ul>
                      </div>
                      <div className="rounded-lg border border-ember-400/20 bg-ember-500/8 p-2.5">
                        <h4 className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-ember-300">
                          Considerations <Info className="h-3 w-3" />
                        </h4>
                        <ul className="space-y-0.5 text-[11px] leading-relaxed text-white/70">
                          {cons.length > 0 ? (
                            cons.map((con, i) => <li key={i}>• {con}</li>)
                          ) : (
                            <li>• No major considerations</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CardItem>
        </div>
      </div>

      {/* Dot Indicators */}
      {output.length > 1 && (
        <div className="mt-1 flex justify-center gap-2">
          {output.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-6 bg-saffron-400 shadow-[0_0_8px_rgba(232,168,74,0.55)]' 
                  : 'w-2.5 bg-white/25 hover:bg-white/40'
              }`}
              aria-label={`Go to result ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NoResultsCard({ query, onPick }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSug, setLoadingSug] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const q = String(query || "").trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    setLoadingSug(true);
    fetchSuggest(q).then(({ items }) => {
      if (!cancelled) {
        setSuggestions(Array.isArray(items) ? items.slice(0, 6) : []);
        setLoadingSug(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const trigger = (term) => {
    if (typeof onPick === "function") onPick(term);
    else {
      const el = document.getElementById("food-input");
      if (el) {
        el.value = term;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="fa-sticker fa-sticker-saffron relative p-5 sm:p-6">
        <div className="relative flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-amber-400/40 bg-amber-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <AlertCircle className="h-4 w-4 text-amber-300" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">
              No exact match
            </p>
            <h3 className="mt-1 font-display text-xl font-extrabold text-white">
              We couldn&apos;t find &ldquo;<span className="text-saffron-300">{query}</span>&rdquo;
            </h3>
            <p className="mt-1 text-sm text-white/55">
              Try a closely-matching dish, or switch to the Hindi/regional name.
            </p>
          </div>
        </div>

        {loadingSug && (
          <p className="relative mt-4 text-xs text-white/40">Looking for close matches…</p>
        )}

        {!loadingSug && suggestions.length > 0 && (
          <div className="relative mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
              Did you mean
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => trigger(s.displayName || s.name)}
                  className="fa-chip-chunky fa-sticker-saffron !text-[11px]"
                >
                  {s.displayName || s.name}
                  {s.sourceShort && (
                    <span
                      className={`rounded-full border px-1.5 py-[1px] text-[9px] font-semibold ${
                        s.sourceShort === "IFCT"
                          ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                          : "border-sky-400/40 bg-sky-500/15 text-sky-100"
                      }`}
                    >
                      {s.sourceShort}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
            Try popular Indian searches
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => trigger(term)}
                className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[11px] font-semibold text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:-translate-y-0.5 hover:border-saffron-400/40 hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <ul className="relative mt-5 space-y-1.5 border-t border-white/10 pt-4 text-[11px] text-white/50">
          <li>• Try the Hindi/regional name — <span className="text-white/75">rajma</span>, <span className="text-white/75">kadhi</span>, <span className="text-white/75">moong dal</span>.</li>
          <li>• Search the dish, not just the ingredient — &quot;chicken curry&quot; ≠ &quot;chicken&quot;.</li>
          <li>• Check spelling — &quot;panner&quot; → paneer, &quot;chiken&quot; → chicken.</li>
          <li>• Add the amount if needed — e.g. <span className="text-white/75">100g rice</span>.</li>
        </ul>
      </div>
    </div>
  );
}

export default FoodAnalyzer;
