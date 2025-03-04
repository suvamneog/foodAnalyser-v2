"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";

export default function CalorieCalculator() {
  const [inputData, setInputData] = useState({
    weight: 100.0,
    height: 183.0,
    currentBodyfat: 30,
    goalBodyfat: 15,
    age: 23,
    gender: "male",
    activityMultiplier: "1.4", // Keep as string for Select
    calorieDeficit: 20,
    useMetric: true,
    proteinMultiplier: 2.0,
  });

  // Add validation state
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  const [result, setResult] = useState(null);

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
    { value: 2.5, label: "High Performance (2.5g/kg)" }
  ];

  // Validation constraints
  const validationRules = {
    weight: {
      min: inputData.useMetric ? 30 : 66, // 30kg or 66lbs
      max: inputData.useMetric ? 300 : 661, // 300kg or 661lbs
      required: true,
    },
    height: {
      min: inputData.useMetric ? 100 : 39.4, // 100cm or 39.4in
      max: inputData.useMetric ? 250 : 98.4, // 250cm or 98.4in
      required: true,
    },
    currentBodyfat: {
      min: 2,
      max: 60,
      required: true,
    },
    goalBodyfat: {
      min: 2,
      max: 40,
      required: true,
    },
    age: {
      min: 16,
      max: 100,
      required: true,
    },
  };

  const convertToMetric = (weight, height) => {
    // If already metric, return as is
    if (inputData.useMetric) return { weight, height };
    
    // Convert lbs to kg and inches to cm
    return {
      weight: weight * 0.453592,
      height: height * 2.54
    };
  };

  const convertFromMetric = (weight, height) => {
    // If using metric, return as is
    if (inputData.useMetric) return { weight, height };
    
    // Convert kg to lbs and cm to inches
    return {
      weight: weight / 0.453592,
      height: height / 2.54
    };
  };

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
        height: parseFloat(height.toFixed(1))
      });
      
      // Clear any errors related to units
      setErrors({
        ...errors,
        weight: undefined,
        height: undefined
      });
    } catch (error) {
      console.error("Error toggling units:", error);
      setErrors({
        ...errors,
        general: "An error occurred while changing units. Please try again."
      });
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check each field against validation rules
    Object.keys(validationRules).forEach(field => {
      const value = inputData[field];
      const rules = validationRules[field];

      // Check if empty but required
      if (rules.required && (value === "" || value === null || value === undefined)) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
      // Check min value
      else if (value < rules.min) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.min}`;
        isValid = false;
      }
      // Check max value
      else if (value > rules.max) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${rules.max}`;
        isValid = false;
      }
    });

    // Additional validation rules
    if (inputData.goalBodyfat >= inputData.currentBodyfat && inputData.calorieDeficit > 0) {
      newErrors.goalBodyfat = "Goal bodyfat must be lower than current bodyfat for a cut";
      isValid = false;
    }

    if (inputData.goalBodyfat <= inputData.currentBodyfat && inputData.calorieDeficit < 0) {
      newErrors.goalBodyfat = "Goal bodyfat must be higher than current bodyfat for a bulk";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field, value) => {
    try {
      // Update the input data
      setInputData({
        ...inputData,
        [field]: value === "" ? "" : Number(value),
      });
      
      // Clear any error for this field as the user is correcting it
      if (errors[field]) {
        setErrors({
          ...errors,
          [field]: undefined
        });
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setErrors({
        ...errors,
        [field]: `Invalid ${field} value`
      });
    }
  };

  const calculateGoals = (e) => {
    e.preventDefault();
    setCalculationError(null);

    // Validate form before calculation
    if (!validateForm()) {
      return;
    }

    setIsCalculating(true);

    try {
      // Convert to metric for calculations if needed
      const { weight: metricWeight, height: metricHeight } = convertToMetric(
        inputData.weight,
        inputData.height
      );

      const goalWeight =
        (metricWeight * (100 - inputData.goalBodyfat)) /
        (100 - inputData.currentBodyfat);
      
      const bmr =
        10 * metricWeight +
        6.25 * metricHeight -
        5 * inputData.age +
        (inputData.gender === "male" ? 5 : -161);
      
      const tdee = bmr * Number(inputData.activityMultiplier); // Convert to number
      const dailyCalories = tdee * (1 - inputData.calorieDeficit / 100);
      const proteinGoal = metricWeight * inputData.proteinMultiplier;

      const weeklyProgress = [];
      const totalWeeks = 20;
      const weightLossPerWeek = (metricWeight - goalWeight) / totalWeeks;

      // Calculate weekly calorie plan
      const weeklyCaloriePlan = [];
      const isDeficit = inputData.calorieDeficit > 0;
      const planType = isDeficit ? "Deficit" : "Bulk";
      
      for (let i = 1; i <= totalWeeks; i++) {
        // Adjust calories based on new weight each week
        const weeklyWeight = metricWeight - weightLossPerWeek * i;
        
        // Validate calculated weight (ensure no negative weights)
        if (weeklyWeight <= 0) {
          throw new Error("Invalid weight calculation. Try adjusting your goals.");
        }
        
        const weeklyBmr = 
          10 * weeklyWeight +
          6.25 * metricHeight -
          5 * inputData.age +
          (inputData.gender === "male" ? 5 : -161);
        const weeklyTdee = weeklyBmr * Number(inputData.activityMultiplier);
        const weeklyCalories = Math.round(weeklyTdee * (1 - inputData.calorieDeficit / 100));
        
        // Validate calorie calculation
        if (weeklyCalories < 1200) {
          throw new Error("Calculated calories too low for health. Adjust your deficit.");
        }
        
        weeklyCaloriePlan.push({
          week: i,
          calories: weeklyCalories,
          protein: Math.round(weeklyWeight * inputData.proteinMultiplier),
          carbs: Math.round((weeklyCalories * 0.4) / 4), // 40% of calories from carbs
          fats: Math.round((weeklyCalories * 0.3) / 9), // 30% of calories from fats
        });

        // Convert weight back to display units if needed
        const displayWeight = inputData.useMetric 
          ? weeklyWeight 
          : weeklyWeight / 0.453592;

        weeklyProgress.push({
          week: i,
          weight: displayWeight.toFixed(1),
          bodyfat: (
            inputData.currentBodyfat -
            ((inputData.currentBodyfat - inputData.goalBodyfat) / totalWeeks) * i
          ).toFixed(1),
        });
      }

      // Convert goal weight to display units if needed
      const displayGoalWeight = inputData.useMetric 
        ? goalWeight 
        : goalWeight / 0.453592;

      setResult({
        goalWeight: Number(displayGoalWeight.toFixed(2)),
        dailyCalories: Math.round(dailyCalories),
        maintenanceCalories: Math.round(tdee),
        proteinGoal: Math.round(proteinGoal),
        weeklyProgress,
        weeklyCaloriePlan,
        planType
      });
    } catch (error) {
      console.error("Calculation error:", error);
      setCalculationError(error.message || "An error occurred during calculation. Please check your inputs.");
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
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
                BIGMAN
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">Transform Better</p>
            </div>
            
            {/* General error message */}
            {errors.general && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                {errors.general}
              </div>
            )}
            
            {/* Calculation error message */}
            {calculationError && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                <strong className="font-medium">Error:</strong> {calculationError}
              </div>
            )}
            
            <div className="p-4 sm:p-6">
              <form onSubmit={calculateGoals} className="space-y-6 sm:space-y-8">
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={toggleUnit}
                    className="text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 px-2 sm:px-3 py-1 rounded-full transition-colors"
                  >
                    {inputData.useMetric ? "Switch to Imperial (lbs/in)" : "Switch to Metric (kg/cm)"}
                  </button>
                </div>

                {/* Form Inputs */}
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

                  {/* Gender and Activity Level */}
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

                {/* Goal Type and Slider */}
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
                        min="5"
                        max="30"
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
                        <span>5% (Slow)</span>
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

                {/* Calculate Button */}
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

              {/* Results Section */}
              {result && (
                <div className="pt-4 sm:pt-6 border-t border-zinc-800 mt-4 sm:mt-6">
                  <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-orange-500">
                    RESULT
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { label: "Goal Bodyweight", value: `${result.goalWeight} ${inputData.useMetric ? "kg" : "lbs"}` },
                      { label: "Maintenance Calories", value: `${result.maintenanceCalories} cals` },
                      { label: "Daily Calorie Goal", value: `${result.dailyCalories} cals` },
                      { label: "Daily Protein Goal", value: `${result.proteinGoal} g` },
                    ].map((item, index) => (
                      <div key={index} className="p-3 sm:p-4 border border-orange-500 rounded-lg">
                        <p className="text-xs sm:text-sm text-zinc-400">{item.label}</p>
                        <p className="text-lg font-bold">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Weekly Calorie Plan */}
                  <div className="mt-6 sm:mt-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg font-semibold text-orange-500 flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${result.planType === "Deficit" ? "bg-green-500" : "bg-blue-500"}`}></span>
                        {result.planType.toUpperCase()} PLAN
                      </h3>
                      <span className="text-xs sm:text-sm text-zinc-400 bg-zinc-800 px-2 sm:px-3 py-1 rounded-full mt-2 sm:mt-0">
                        20-Week Program
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
                      <div className="flex items-center ml-auto">
                        <span className="text-zinc-500">Macros ratio: 30% protein, 40% carbs, 30% fats</span>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-zinc-800/30 rounded-lg text-xs sm:text-sm text-zinc-400">
                      <p className="mb-1"><strong>Note:</strong> Results are estimates and may vary based on individual factors like metabolism, adherence, and changes in activity level.</p>
                      <p>For best results, track your progress weekly and adjust your plan as needed.</p>
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