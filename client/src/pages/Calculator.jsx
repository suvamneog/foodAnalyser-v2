"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";

export default function CalorieCalculator() {
  // State management
  const [inputData, setInputData] = useState({
    weight: 80.0,
    height: 175.0,
    currentBodyfat: 20,
    goalBodyfat: 15,
    age: 30,
    gender: "male",
    activityMultiplier: "1.55",
    calorieDeficit: 20,
    useMetric: true,
    proteinMultiplier: 2.0,
    formula: "katch-mcardle"
  });

  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  const [result, setResult] = useState(null);
  const [showMifflinWarning, setShowMifflinWarning] = useState(false);
  const [showRecompWarning, setShowRecompWarning] = useState(false);
  const [expandedGuides, setExpandedGuides] = useState({
    howItWorks: false,
    recompGuide: false,
    usageGuide: false
  });
  
  useEffect(() => {
    if (inputData.formula === "mifflin-st-jeor" && inputData.currentBodyfat) {
      setShowMifflinWarning(true);
    } else {
      setShowMifflinWarning(false);
    }

    if (inputData.calorieDeficit < 0 && inputData.goalBodyfat < inputData.currentBodyfat) {
      setShowRecompWarning(true);
    } else {
      setShowRecompWarning(false);
    }
  }, [inputData.formula, inputData.currentBodyfat, inputData.calorieDeficit, inputData.goalBodyfat]);

  // Constants and options
  const formulaOptions = [
    { value: "katch-mcardle", label: "Katch-McArdle (body fat required)" },
    { value: "mifflin-st-jeor", label: "Mifflin-St Jeor (general estimate)" }
  ];

  const activityLevels = {
    1.2: "Sedentary (office job)",
    1.375: "Light Exercise (1-2 days/week)",
    1.55: "Moderate Exercise (3-5 days/week)",
    1.725: "Heavy Exercise (6-7 days/week)",
    1.9: "Athlete (2x training/day)",
  };

  const proteinOptions = [
    { value: 1.6, label: "Moderate (1.6g/kg)" },
    { value: 2.0, label: "Standard (2.0g/kg)" },
    { value: 2.2, label: "Athletic (2.2g/kg)" },
    { value: 2.5, label: "High Performance (2.5g/kg)" },
  ];

  const minBodyfat = {
    male: 5,
    female: 12,
  };

  // Validation rules
  const getValidationRules = () => ({
    weight: {
      min: inputData.useMetric ? 30 : 66,
      max: inputData.useMetric ? 300 : 661,
      required: true,
    },
    height: {
      min: inputData.useMetric ? 100 : 39,
      max: inputData.useMetric ? 250 : 98,
      required: true,
    },
    currentBodyfat: {
      min: minBodyfat[inputData.gender],
      max: inputData.gender === "male" ? 50 : 60,
      required: inputData.formula === "katch-mcardle",
    },
    goalBodyfat: {
      min: minBodyfat[inputData.gender],
      max: inputData.gender === "male" ? 25 : 35,
      required: true,
    },
    age: {
      min: 16,
      max: 100,
      required: true,
    },
    proteinMultiplier: {
      min: 1.2,
      max: 3.0,
      required: true,
    },
  });

  // Unit conversion
  const convertToMetric = (weight, height) => {
    if (inputData.useMetric) return { weight, height };
    return {
      weight: weight * 0.453592,
      height: height * 2.54,
    };
  };

  const convertFromMetric = (weight, height) => {
    if (inputData.useMetric) return { weight, height };
    return {
      weight: weight * 2.20462,
      height: height * 0.393701,
    };
  };

  useEffect(() => {
    if (inputData.formula === "mifflin-st-jeor" && inputData.currentBodyfat) {
      setShowMifflinWarning(true);
    } else {
      setShowMifflinWarning(false);
    }
  
    // Detect all recomp attempts
    const isRecompBulk = inputData.calorieDeficit < 0 && inputData.goalBodyfat < inputData.currentBodyfat;
    const isRecompCut = inputData.calorieDeficit > 0 && inputData.goalBodyfat > inputData.currentBodyfat;
    setShowRecompWarning(isRecompBulk || isRecompCut);
  }, [inputData.formula, inputData.currentBodyfat, inputData.calorieDeficit, inputData.goalBodyfat]);

  const validateForm = () => {
    const validationRules = getValidationRules();
    const newErrors = {};
    let isValid = true;
  
    Object.keys(validationRules).forEach((field) => {
      const value = inputData[field];
      const rules = validationRules[field];
  
      if (rules.required && (value === "" || value === null || value === undefined)) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      } else if (typeof value === "number" && value < rules.min) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.min}`;
        isValid = false;
      } else if (typeof value === "number" && value > rules.max) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${rules.max}`;
        isValid = false;
      }
    });
  
    if (inputData.goalBodyfat === inputData.currentBodyfat) {
      newErrors.goalBodyfat = "Goal bodyfat should be different from current";
      isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };

  // Core calculations
  const calculateLBM = (weight, bodyfat) => weight * (1 - bodyfat / 100);

  const calculateMifflinStJeorBMR = (weight, height, age, gender) => {
    return gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  };

  const calculateTDEE = (weight, bodyfat, activityMultiplier) => {
    const heightCm = inputData.useMetric 
      ? inputData.height 
      : inputData.height * 2.54;

    if (inputData.formula === "katch-mcardle") {
      const lbm = calculateLBM(weight, bodyfat);
      return (370 + 21.6 * lbm) * Number(activityMultiplier);
    } else {
      return calculateMifflinStJeorBMR(
        weight,
        heightCm,
        inputData.age,
        inputData.gender
      ) * Number(activityMultiplier);
    }
  };

  const calculateWeeklyWeightChange = (tdee, deficitPercentage, isRecomp) => {
    const weeklyCalorieDifference = (tdee * Math.abs(deficitPercentage) / 100) * 7;
    
    if (isRecomp) {
      // Apply gender factor to muscle gain
      const genderFactor = inputData.gender === "female" ? 0.8 : 1.0;
      return {
        fatLoss: (weeklyCalorieDifference / 7700) * 0.3,
        muscleGain: (weeklyCalorieDifference / 2000) * 0.3 * genderFactor
      };
    }
    
    return (weeklyCalorieDifference / 8500) * (deficitPercentage > 0 ? 1 : 0.85);
  };

  const calculateGoalWeight = (currentWeight, currentBodyfat, goalBodyfat, isCutting) => {
    // Determine if this is a recomp scenario
    const isRecomp = (isCutting && goalBodyfat > currentBodyfat) ||  // Cutting while trying to gain muscle
                    (!isCutting && goalBodyfat < currentBodyfat);    // Bulking while trying to lose fat
  
    if (isRecomp) {
      const currentLBM = calculateLBM(currentWeight, currentBodyfat);
      
      // For recomp, we make small adjustments to LBM based on direction
      const lbmAdjustment = isCutting ? 1.01 : 0.99; // Small increase for cut-recomp, small decrease for bulk-recomp
      const goalLBM = currentLBM * lbmAdjustment;
      
      return {
        weight: goalLBM / (1 - goalBodyfat / 100),
        isRecomp: true
      };
    }
  
    // Standard cutting calculation
    if (isCutting) {
      const currentLBM = calculateLBM(currentWeight, currentBodyfat);
      return {
        weight: currentLBM / (1 - goalBodyfat / 100),
        isRecomp: false
      };
    }
  
    // Standard bulking calculation
    const surplusSize = Math.abs(inputData.calorieDeficit);
    const baseWeeklyGain = currentWeight * 0.0025 * (surplusSize / 10);
    
    // Apply gender factor
    const genderFactor = inputData.gender === "female" ? 0.8 : 1.0;
    const weeklyGain = baseWeeklyGain * genderFactor;
    
    return {
      weight: currentWeight + (weeklyGain * 16),
      isRecomp: false
    };
  };

  const calculateMacros = (calories, proteinGrams, isCutting) => {
    const proteinCalories = proteinGrams * 4;
    const remainingCalories = calories - proteinCalories;
    const carbRatio = isCutting ? 0.4 : 0.5;
    const fatRatio = isCutting ? 0.3 : 0.2;
    
    return {
      protein: proteinGrams,
      carbs: Math.round((remainingCalories * carbRatio) / 4),
      fats: Math.round((remainingCalories * fatRatio) / 9),
    };
  };

  const calculateGoals = (e) => {
    e.preventDefault();
    setCalculationError(null);
  
    if (!validateForm()) return;
  
    setIsCalculating(true);
  
    try {
      const { weight: metricWeight } = convertToMetric(inputData.weight, inputData.height);
      const isCutting = inputData.calorieDeficit > 0;
      const isRecomp = (isCutting && inputData.goalBodyfat > inputData.currentBodyfat) || 
                      (!isCutting && inputData.goalBodyfat < inputData.currentBodyfat);
      
      const initialTDEE = calculateTDEE(
        metricWeight,
        inputData.currentBodyfat,
        inputData.activityMultiplier
      );
      
      const goalWeightResult = calculateGoalWeight(
        metricWeight,
        inputData.currentBodyfat,
        inputData.goalBodyfat,
        isCutting
      );
      
      const totalWeeks = 16;
      const weightChange = calculateWeeklyWeightChange(initialTDEE, inputData.calorieDeficit, isRecomp);
      
      const weeklyProgress = [];
      const weeklyCaloriePlan = [];
      
      for (let week = 1; week <= totalWeeks; week++) {
        let currentWeekWeight;
        let currentWeekBodyfat;
        
        if (isRecomp) {
          currentWeekWeight = metricWeight - 
            (weightChange.fatLoss * (week - 1)) + 
            (weightChange.muscleGain * (week - 1));
          currentWeekBodyfat = inputData.currentBodyfat - 
            ((inputData.currentBodyfat - inputData.goalBodyfat) / totalWeeks) * week;
        } else {
          currentWeekWeight = isCutting
            ? Math.max(metricWeight - weightChange * (week - 1), goalWeightResult.weight)
            : Math.min(metricWeight + weightChange * (week - 1), goalWeightResult.weight);
          
          const currentLBM = calculateLBM(metricWeight, inputData.currentBodyfat);
          currentWeekBodyfat = isCutting
            ? 100 * (1 - currentLBM / currentWeekWeight)
            : inputData.currentBodyfat + ((inputData.goalBodyfat - inputData.currentBodyfat) / totalWeeks) * week;
        }
        
        const metabolicAdaptationFactor = 1 - (week / totalWeeks) * 0.1 * (isCutting ? 1 : 0.5);
        const currentWeekTDEE = calculateTDEE(
          currentWeekWeight,
          currentWeekBodyfat,
          inputData.activityMultiplier
        ) * metabolicAdaptationFactor;
        
        const currentWeekCalories = Math.round(currentWeekTDEE * (1 - inputData.calorieDeficit / 100));
        
        const proteinGrams = Math.round(
          calculateLBM(currentWeekWeight, currentWeekBodyfat) * 
          (isCutting ? inputData.proteinMultiplier : inputData.proteinMultiplier * 0.95)
        );
        
        const macros = calculateMacros(currentWeekCalories, proteinGrams, isCutting);
        
        const displayWeight = inputData.useMetric
          ? currentWeekWeight
          : currentWeekWeight * 2.20462;
        
        weeklyProgress.push({
          week,
          weight: displayWeight.toFixed(1),
          bodyfat: currentWeekBodyfat.toFixed(1),
        });
        
        weeklyCaloriePlan.push({
          week,
          calories: currentWeekCalories,
          protein: macros.protein,
          carbs: macros.carbs,
          fats: macros.fats,
        });
      }
      
      const displayGoalWeight = inputData.useMetric
        ? goalWeightResult.weight
        : goalWeightResult.weight * 2.20462;
      
      const initialProteinGoal = Math.round(
        calculateLBM(metricWeight, inputData.currentBodyfat) * inputData.proteinMultiplier
      );
      
      setResult({
        goalWeight: Number(displayGoalWeight.toFixed(1)),
        dailyCalories: Math.round(initialTDEE * (1 - inputData.calorieDeficit / 100)),
        maintenanceCalories: Math.round(initialTDEE),
        proteinGoal: initialProteinGoal,
        weeklyProgress,
        weeklyCaloriePlan,
        planType: isRecomp ? "Recomp" : isCutting ? "Deficit" : "Surplus",
        totalWeeks,
        formulaUsed: inputData.formula === "katch-mcardle" ? "Katch-McArdle" : "Mifflin-St Jeor",
        isRecomp: goalWeightResult.isRecomp
      });
    } catch (error) {
      console.error("Calculation error:", error);
      setCalculationError(error.message || "An error occurred during calculation. Please check your inputs.");
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Input change handler
  const handleInputChange = (field, value) => {
    try {
      setInputData({
        ...inputData,
        [field]: value === "" ? "" : Number(value),
      });
      
      if (errors[field]) {
        setErrors({
          ...errors,
          [field]: undefined,
        });
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setErrors({
        ...errors,
        [field]: `Invalid ${field} value`,
      });
    }
  };

  // Toggle unit system
  const toggleUnit = () => {
    try {
      const newUseMetric = !inputData.useMetric;
      const { weight, height } = convertFromMetric(
        inputData.weight,
        inputData.height
      );
      
      setInputData({
        ...inputData,
        useMetric: newUseMetric,
        weight: parseFloat(weight.toFixed(1)),
        height: parseFloat(height.toFixed(1)),
      });
      
      setErrors({
        ...errors,
        weight: undefined,
        height: undefined,
      });
    } catch (error) {
      console.error("Error toggling units:", error);
      setErrors({
        ...errors,
        general: "An error occurred while changing units. Please try again.",
      });
    }
  };

  // Toggle guide expansion
  const toggleGuide = (guide) => {
    setExpandedGuides(prev => ({
      ...prev,
      [guide]: !prev[guide]
    }));
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 pointer-events-none">
        <StarsBackground />
        <ShootingStars />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full"
      >
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 mt-16 sm:mt-20">
          <div className="max-w-4xl mx-auto bg-zinc-900 border-zinc-800 rounded-lg">
            <div className="border-b border-zinc-800 p-4 sm:p-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                FITNESS CALCULATOR
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">Precision Nutrition Planning</p>
              
              {/* Guide Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => toggleGuide('howItWorks')}
                  className="text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-full transition-colors flex items-center"
                >
                  <span className="mr-1">ℹ️</span> How It Works
                </button>
                
                <button
                  onClick={() => toggleGuide('recompGuide')}
                  className="text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-full transition-colors flex items-center"
                >
                  <span className="mr-1">ℹ️</span> Recomposition Guide
                </button>
                
                <button
                  onClick={() => toggleGuide('usageGuide')}
                  className="text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-full transition-colors flex items-center"
                >
                  <span className="mr-1">ℹ️</span> How To Use
                </button>
              </div>
              
              {/* Expanded Guides */}
              {expandedGuides.howItWorks && (
                <div className="mt-3 p-3 bg-zinc-800/30 rounded-lg text-xs space-y-2">
                  <h4 className="font-medium text-zinc-300">How This Calculator Works</h4>
                  <p>This tool calculates your personalized nutrition plan based on:</p>
                  <ul className="list-disc pl-4">
                    <li>Your current body metrics</li>
                    <li>Selected formula (see explanations below)</li>
                    <li>Activity level and goals</li>
                  </ul>
                  <p>Results update weekly accounting for metabolic adaptation.</p>
                </div>
              )}
              
              {expandedGuides.recompGuide && (
                <div className="mt-3 p-3 bg-zinc-800/30 rounded-lg text-xs space-y-2">
                  <h4 className="font-medium text-zinc-300">What is Recomposition?</h4>
                  <p>Body recomposition means <strong>simultaneously losing fat and gaining muscle</strong>. This requires:</p>
                  <ul className="list-disc pl-4">
                    <li>Precise calorie control (small deficit/surplus)</li>
                    <li>Progressive strength training</li>
                    <li>High protein intake (2-2.5g/kg)</li>
                  </ul>
                  <p>Best for beginners or those returning to training after a break.</p>
                </div>
              )}
              
              {expandedGuides.usageGuide && (
                <div className="mt-3 p-3 bg-zinc-800/30 rounded-lg text-xs space-y-2">
                  <h4 className="font-medium text-zinc-300">How To Use This Calculator</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Enter your <strong>current metrics</strong> accurately</li>
                    <li>Select your <strong>activity level</strong> (be honest!)</li>
                    <li>Choose your <strong>goal type</strong> (cut/bulk/recomp)</li>
                    <li>Pick protein intake based on your goal:
                      <ul className="list-disc pl-4 mt-1">
                        <li>Cutting: 2.0-2.5g/kg</li>
                        <li>Bulking: 1.6-2.2g/kg</li>
                        <li>Recomp: 2.2-2.5g/kg</li>
                      </ul>
                    </li>
                    <li>Click Calculate and follow your weekly plan</li>
                  </ol>
                </div>
              )}
            </div>
            
            {errors.general && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                {errors.general}
              </div>
            )}
            
            {calculationError && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                <strong className="font-medium">Error:</strong> {calculationError}
              </div>
            )}

            {showMifflinWarning && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg text-yellow-300 text-sm">
                <strong>Note:</strong> Mifflin-St Jeor doesn&apos;t use body fat %. For more accuracy with your body fat data, switch to Katch-McArdle.
              </div>
            )}

            {showRecompWarning && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 bg-purple-900/30 border border-purple-800 rounded-lg text-purple-300 text-sm">
                <strong>Recomp Mode:</strong> {inputData.calorieDeficit < 0 
                  ? "Attempting to lose fat while in calorie surplus (requires precise training/nutrition)" 
                  : "Attempting to gain muscle while in calorie deficit (requires precise training/nutrition)"}
              </div>
            )}

            <div className="p-4 sm:p-6">
              <form onSubmit={calculateGoals} className="space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    {formulaOptions.map((option) => (
                      <label key={option.value} className="inline-flex items-center cursor-pointer text-sm">
                        <input
                          type="radio"
                          className="form-radio text-orange-500"
                          name="formula"
                          value={option.value}
                          checked={inputData.formula === option.value}
                          onChange={(e) => setInputData({ ...inputData, formula: e.target.value })}
                        />
                        <span className="ml-2">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={toggleUnit}
                    className="text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 px-2 sm:px-3 py-1 rounded-full transition-colors"
                  >
                    {inputData.useMetric ? "Switch to Imperial (lbs/in)" : "Switch to Metric (kg/cm)"}
                  </button>
                </div>

                {/* Formula Explanations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs text-zinc-400">
                  <div className="p-2 bg-zinc-800/30 rounded-lg">
                    <h4 className="font-medium text-zinc-300">Katch-McArdle</h4>
                    <p>Most accurate if you know your body fat % - calculates based on lean mass.</p>
                    <p className="mt-1 italic">Formula: 370 + (21.6 × LBM)</p>
                  </div>
                  <div className="p-2 bg-zinc-800/30 rounded-lg">
                    <h4 className="font-medium text-zinc-300">Mifflin-St Jeor</h4>
                    <p>General estimate based on weight, height, age and gender.</p>
                    <p className="mt-1 italic">Men: (10 × kg) + (6.25 × cm) - (5 × age) + 5</p>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 -mt-2">
                  {inputData.formula === "katch-mcardle" ? (
                    <p>±5% accuracy with body fat data</p>
                  ) : (
                    <p>±10% general estimate - no body fat needed</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { id: "weight", label: `Current Weight (${inputData.useMetric ? "kg" : "lbs"})`, value: inputData.weight },
                    { id: "height", label: `Height (${inputData.useMetric ? "cm" : "inches"})`, value: inputData.height },
                    { id: "currentBodyfat", label: "Current Bodyfat %", value: inputData.currentBodyfat },
                    { id: "goalBodyfat", label: "Goal Bodyfat %", value: inputData.goalBodyfat },
                    { id: "age", label: "Age", value: inputData.age },
                  ].map((field) => (
                    <div key={field.id} className="space-y-1 sm:space-y-2">
                      <label htmlFor={field.id} className="text-sm sm:text-base">
                        {field.label}
                      </label>
                      <input
                        id={field.id}
                        type="number"
                        step={field.id === "weight" || field.id === "height" ? "0.1" : "1"}
                        value={field.value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`bg-zinc-800 border ${errors[field.id] ? 'border-red-500' : 'border-zinc-700'} w-full p-2 rounded text-sm sm:text-base`}
                      />
                      {errors[field.id] && (
                        <p className="text-red-400 text-xs mt-1">{errors[field.id]}</p>
                      )}
                    </div>
                  ))}

                  <div className="space-y-1 sm:space-y-2">
                    <label htmlFor="activity" className="text-sm sm:text-base">
                      Activity Level
                    </label>
                    <select
                      id="activity"
                      className="w-full bg-zinc-800 border-zinc-700 p-2 rounded text-sm sm:text-base"
                      value={inputData.activityMultiplier}
                      onChange={(e) =>
                        setInputData({
                          ...inputData,
                          activityMultiplier: e.target.value,
                        })
                      }
                    >
                      {Object.entries(activityLevels).map(
                        ([multiplier, description]) => (
                          <option key={multiplier} value={multiplier}>
                            {description}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label htmlFor="gender" className="text-sm sm:text-base">
                      Gender
                    </label>
                    <select
                      id="gender"
                      className="w-full bg-zinc-800 border-zinc-700 p-2 rounded text-sm sm:text-base"
                      value={inputData.gender}
                      onChange={(e) =>
                        setInputData({ ...inputData, gender: e.target.value })
                      }
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="proteinMultiplier">Protein Intake</label>
                    <select
                      id="proteinMultiplier"
                      className="w-full bg-zinc-800 border-zinc-700 p-2 rounded"
                      value={inputData.proteinMultiplier}
                      onChange={(e) =>
                        setInputData({
                          ...inputData,
                          proteinMultiplier: Number(e.target.value),
                        })
                      }
                    >
                      {proteinOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Goal Type Section */}
                <div className="bg-zinc-800/50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Goal Type</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <label className="inline-flex items-center cursor-pointer text-sm sm:text-base">
                      <input
                        type="radio"
                        className="form-radio text-orange-500"
                        name="goalType"
                        checked={inputData.calorieDeficit > 0}
                        onChange={() => setInputData({ ...inputData, calorieDeficit: 20 })}
                      />
                      <span className="ml-2">Cut (Lose Fat)</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer text-sm sm:text-base">
                      <input
                        type="radio"
                        className="form-radio text-orange-500"
                        name="goalType"
                        checked={inputData.calorieDeficit <= 0}
                        onChange={() => setInputData({ ...inputData, calorieDeficit: -10 })}
                      />
                      <span className="ml-2">Bulk (Gain Muscle)</span>
                    </label>
                  </div>

                  {inputData.calorieDeficit > 0 ? (
                    <div className="mt-2 sm:mt-3">
                      <label htmlFor="calorieDeficit" className="text-sm sm:text-base">
                        Deficit Percentage (%)
                      </label>
                      <input
                        id="calorieDeficit"
                        type="range"
                        min="10"
                        max="30"
                        step="5"
                        value={inputData.calorieDeficit}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            calorieDeficit: Number(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>10% (Slow)</span>
                        <span>{inputData.calorieDeficit}%</span>
                        <span>30% (Aggressive)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 sm:mt-3">
                      <label htmlFor="calorieDeficit" className="text-sm sm:text-base">
                        Surplus Percentage (%)
                      </label>
                      <input
                        id="calorieDeficit"
                        type="range"
                        min="-20"
                        max="-5"
                        step="5"
                        value={inputData.calorieDeficit}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            calorieDeficit: Number(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>20% (Aggressive)</span>
                        <span>{Math.abs(inputData.calorieDeficit)}%</span>
                        <span>5% (Lean)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pre-calculation disclaimer */}
                {!isCalculating && !result && (
                  <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg text-xs text-zinc-400">
                    <p className="font-medium mb-1">Important Disclaimer:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Results are estimates - actual needs vary by ±15% due to individual metabolism</li>
                      <li>Muscle gain/fat loss rates depend on training experience, genetics, and consistency</li>
                    </ul>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCalculating}
                  className={`w-full py-2 px-4 rounded-lg transition-colors text-sm sm:text-base ${
                    isCalculating 
                      ? 'bg-orange-700 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {isCalculating ? 'Calculating...' : 'Calculate'}
                </button>
              </form>

              {result && (
                <div className="pt-4 sm:pt-6 border-t border-zinc-800 mt-4 sm:mt-6">
                  {/* Results disclaimer */}
                  <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg text-xs text-blue-300">
                    <h4 className="font-medium">Getting Best Results:</h4>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Weigh yourself <strong>weekly at the same time</strong> (morning after bathroom)</li>
                      <li>For recomp, track <strong>measurements and strength</strong> not just weight</li>
                      <li>Be consistent for <strong>at least 4 weeks</strong> before making changes</li>
                    </ul>
                  </div>
                  
                  <div className="text-xs text-zinc-400 mb-4">
                    <div className="flex items-center">
                      <span className="font-semibold">Calculations based on:</span>
                      <span className="ml-2 px-2 py-1 bg-zinc-800 rounded-full">
                        {result.formulaUsed}
                      </span>
                      {result.isRecomp && (
                        <span className="ml-2 px-2 py-1 bg-purple-800 rounded-full text-purple-300">
                          Recomp Mode
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-orange-500">
                    YOUR PERSONALIZED PLAN
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { label: "Goal Weight", value: `${result.goalWeight} ${inputData.useMetric ? "kg" : "lbs"}` },
                      { label: "Maintenance Calories", value: `${result.maintenanceCalories} kcal` },
                      { label: "Daily Calorie Goal", value: `${result.dailyCalories} kcal` },
                      { label: "Daily Protein Goal", value: `${result.proteinGoal} g` },
                    ].map((item, index) => (
                      <div key={index} className="p-3 sm:p-4 border border-orange-500 rounded-lg relative">
                        <p className="text-xs sm:text-sm text-zinc-400">{item.label}</p>
                        <p className="text-lg font-bold">{item.value}</p>
                        {item.label.includes("Goal Weight") && (
                          <div className="absolute top-1 right-1 group">
                            <span className="text-xs">ℹ️</span>
                            <div className="hidden group-hover:block absolute right-0 w-48 p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs z-10">
                              Goal weight estimates don&apos;t account for water/glycogen changes. 
                              Visible results may appear at different weights.
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 sm:mt-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg font-semibold text-orange-500 flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          result.planType === "Deficit" ? "bg-green-500" : 
                          result.planType === "Surplus" ? "bg-blue-500" : "bg-purple-500"
                        }`}></span>
                        {result.planType.toUpperCase()} PLAN
                      </h3>
                      <span className="text-xs sm:text-sm text-zinc-400 bg-zinc-800 px-2 sm:px-3 py-1 rounded-full mt-2 sm:mt-0">
                        {result.totalWeeks}-Week Program
                      </span>
                    </div>

                    <div className="bg-zinc-800/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                        {[
                          { label: "Starting Weight", value: `${inputData.weight} ${inputData.useMetric ? "kg" : "lbs"}` },
                          { label: "Goal Weight", value: `${result.goalWeight} ${inputData.useMetric ? "kg" : "lbs"}` },
                          { label: "Starting BF%", value: `${inputData.currentBodyfat}%` },
                          { label: "Goal BF%", value: `${inputData.goalBodyfat}%` },
                        ].map((item, index) => (
                          <div key={index}>
                            <p className="text-xs sm:text-sm text-zinc-400">{item.label}</p>
                            <p className="text-sm sm:text-base font-semibold">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-x-auto bg-zinc-800/30 rounded-lg">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-zinc-700 text-zinc-400">
                            <th className="text-left p-2 sm:p-3 font-medium">Week</th>
                            <th className="text-left p-2 sm:p-3 font-medium">Weight</th>
                            <th className="text-left p-2 sm:p-3 font-medium">BF%</th>
                            <th className="text-left p-2 sm:p-3 font-medium">Calories</th>
                            <th className="text-left p-2 sm:p-3 font-medium">Protein</th>
                            <th className="text-left p-2 sm:p-3 font-medium">Carbs</th>
                            <th className="text-left p-2 sm:p-3 font-medium">Fats</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.weeklyCaloriePlan.map((week, index) => (
                            <tr
                              key={index}
                              className={`border-b border-zinc-800 hover:bg-zinc-700/30 transition-colors ${index % 4 === 0 ? 'bg-zinc-800/20' : ''}`}
                            >
                              <td className="p-2 sm:p-3 font-medium">Week {week.week}</td>
                              <td className="p-2 sm:p-3">{result.weeklyProgress[index].weight} {inputData.useMetric ? "kg" : "lbs"}</td>
                              <td className="p-2 sm:p-3">{result.weeklyProgress[index].bodyfat}%</td>
                              <td className="p-2 sm:p-3 font-medium text-orange-400">{week.calories}</td>
                              <td className="p-2 sm:p-3">{week.protein}g</td>
                              <td className="p-2 sm:p-3">{week.carbs}g</td>
                              <td className="p-2 sm:p-3">{week.fats}g</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-2 text-xs text-zinc-500 italic">
                        Note: Weekly projections assume perfect adherence. Real-world results may vary 
                        by 1-2 weeks due to water retention, training intensity, and lifestyle factors.
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 text-xs text-zinc-400 flex flex-wrap gap-2 sm:gap-4">
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-orange-400 mr-1"></span>
                        <span>Calories: Daily intake</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-zinc-400 mr-1"></span>
                        <span>Macros: Protein/Carbs/Fats in grams</span>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-zinc-800/30 rounded-lg text-xs sm:text-sm text-zinc-400">
                      <p className="mb-1"><strong>Note:</strong> This plan accounts for metabolic adaptation and adjusts weekly.</p>
                      {result.planType === "Recomp" ? (
                        <p>For recomposition, progress will be slower. Focus on strength gains and body measurements.</p>
                      ) : (
                        <p>For optimal results, weigh yourself weekly and adjust calories by ±100 if progress stalls.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}