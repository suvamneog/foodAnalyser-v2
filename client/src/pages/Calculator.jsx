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
  };

  const calculateGoals = (e) => {
    e.preventDefault();

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
      const weeklyBmr = 
        10 * weeklyWeight +
        6.25 * metricHeight -
        5 * inputData.age +
        (inputData.gender === "male" ? 5 : -161);
      const weeklyTdee = weeklyBmr * Number(inputData.activityMultiplier);
      const weeklyCalories = Math.round(weeklyTdee * (1 - inputData.calorieDeficit / 100));
      
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
          <div className="min-h-screen bg-black text-white p-6 mt-20">
            <div className="max-w-4xl mx-auto bg-zinc-900 border-zinc-800">
              <div className="border-b border-zinc-800 p-6">
                <h2 className="text-3xl font-bold tracking-tight">
                  BIGMAN
                </h2>
                <p className="text-zinc-400">Transform Better</p>
              </div>
              <div className="p-6">
                <form onSubmit={calculateGoals} className="space-y-8">
                  <div className="flex justify-end mb-2">
                    <button
                      type="button"
                      onClick={toggleUnit}
                      className="text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-full transition-colors"
                    >
                      {inputData.useMetric ? "Switch to Imperial (lbs/in)" : "Switch to Metric (kg/cm)"}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="weight">Current Weight ({inputData.useMetric ? "kg" : "lbs"})</label>
                      <input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={inputData.weight}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            weight: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 w-full p-2 rounded"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="height">Height ({inputData.useMetric ? "cm" : "inches"})</label>
                      <input
                        id="height"
                        type="number"
                        step="0.1"
                        value={inputData.height}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            height: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 w-full p-2 rounded"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bodyfat">Current Bodyfat %</label>
                      <input
                        id="bodyfat"
                        type="number"
                        value={inputData.currentBodyfat}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            currentBodyfat: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 w-full p-2 rounded"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="goalBf">Goal Bodyfat %</label>
                      <input
                        id="goalBf"
                        type="number"
                        value={inputData.goalBodyfat}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            goalBodyfat: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 w-full p-2 rounded"
                      />
                      <p className="text-xs text-zinc-400">
                        Healthy range: {inputData.gender === "male" ? "10-20%" : "18-28%"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="gender">Gender</label>
                      <select
                        className="w-full bg-zinc-800 border-zinc-700 p-2 rounded"
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
                      <label htmlFor="activity">Activity Level</label>
                      <select
                        id="activity"
                        className="w-full bg-zinc-800 border-zinc-700 p-2 rounded"
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
                    
                    <div className="space-y-2">
                      <label htmlFor="age">Age</label>
                      <input
                        id="age"
                        type="number"
                        value={inputData.age}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            age: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className="bg-zinc-800 border-zinc-700 w-full p-2 rounded"
                      />
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
                  
                  <div className="bg-zinc-800/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Goal Type</h3>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio text-orange-500"
                          name="goalType"
                          checked={inputData.calorieDeficit > 0}
                          onChange={() => setInputData({ ...inputData, calorieDeficit: 20 })}
                        />
                        <span className="ml-2">Cut (Lose Fat)</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
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
                      <div className="mt-3">
                        <label htmlFor="calorieDeficit">Deficit Percentage (%)</label>
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
                      <div className="mt-3">
                        <label htmlFor="calorieDeficit">Surplus Percentage (%)</label>
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

                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Calculate
                  </button>
                </form>

                {result && (
                  <div className="pt-6 border-t border-zinc-800 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-orange-500">
                      RESULT
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="p-4 border border-orange-500 rounded-lg">
                        <p className="text-sm text-zinc-400">
                          Goal Bodyweight
                        </p>
                        <p className="text-xl font-bold">
                          {result.goalWeight} {inputData.useMetric ? "kg" : "lbs"}
                        </p>
                      </div>
                      <div className="p-4 border border-orange-500 rounded-lg">
                        <p className="text-sm text-zinc-400">
                          Maintenance Calories
                        </p>
                        <p className="text-xl font-bold">
                          {result.maintenanceCalories} cals
                        </p>
                      </div>
                      <div className="p-4 border border-orange-500 rounded-lg">
                        <p className="text-sm text-zinc-400">
                          Daily Calorie Goal
                        </p>
                        <p className="text-xl font-bold">
                          {result.dailyCalories} cals
                        </p>
                      </div>
                      <div className="p-4 border border-orange-500 rounded-lg">
                        <p className="text-sm text-zinc-400">
                          Daily Protein Goal
                        </p>
                        <p className="text-xl font-bold">
                          {result.proteinGoal} g
                        </p>
                      </div>
                    </div>
                    
                    {/* Weekly Calorie Plan Section */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-orange-500 flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${result.planType === "Deficit" ? "bg-green-500" : "bg-blue-500"}`}></span>
                          {result.planType.toUpperCase()} PLAN
                        </h3>
                        <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">20-Week Program</span>
                      </div>
                      
                      <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-xs text-zinc-400">Starting Weight</p>
                            <p className="text-lg font-semibold">{inputData.weight} {inputData.useMetric ? "kg" : "lbs"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400">Goal Weight</p>
                            <p className="text-lg font-semibold">{result.goalWeight} {inputData.useMetric ? "kg" : "lbs"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400">Starting BF%</p>
                            <p className="text-lg font-semibold">{inputData.currentBodyfat}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400">Goal BF%</p>
                            <p className="text-lg font-semibold">{inputData.goalBodyfat}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto bg-zinc-800/30 rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-zinc-700 text-zinc-400">
                              <th className="text-left p-3 font-medium">Week</th>
                              <th className="text-left p-3 font-medium">Weight</th>
                              <th className="text-left p-3 font-medium">BF%</th>
                              <th className="text-left p-3 font-medium">Calories</th>
                              <th className="text-left p-3 font-medium">Protein</th>
                              <th className="text-left p-3 font-medium">Carbs</th>
                              <th className="text-left p-3 font-medium">Fats</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.weeklyCaloriePlan.map((week, index) => (
                              <tr 
                                key={index} 
                                className={`border-b border-zinc-800 hover:bg-zinc-700/30 transition-colors ${index % 4 === 0 ? 'bg-zinc-800/20' : ''}`}
                              >
                                <td className="p-3 font-medium">Week {week.week}</td>
                                <td className="p-3">{result.weeklyProgress[index].weight} {inputData.useMetric ? "kg" : "lbs"}</td>
                                <td className="p-3">{result.weeklyProgress[index].bodyfat}%</td>
                                <td className="p-3 font-medium text-orange-400">{week.calories}</td>
                                <td className="p-3">{week.protein}g</td>
                                <td className="p-3">{week.carbs}g</td>
                                <td className="p-3">{week.fats}g</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-4 text-xs text-zinc-400 flex flex-wrap gap-4">
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
                      
                      <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg text-sm text-zinc-400">
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
