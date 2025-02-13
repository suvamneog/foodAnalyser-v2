"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";
import { Label } from "../components/ui/label";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function CalorieCalculator() {
  const [inputData, setInputData] = useState({
    weight: 100.0,
    height: 183.0,
    currentBodyfat: 30,
    goalBodyfat: 15,
    age: 23,
    gender: "1",
    activityMultiplier: "1.4", // Keep as string for Select
    calorieDeficit: 20,
  });

  const [result, setResult] = useState(null);

  const activityLevels = {
    1.2: "Sedentary (office job)",
    1.375: "Light Exercise (1-2 days/week)",
    1.55: "Moderate Exercise (3-5 days/week)",
    1.725: "Heavy Exercise (6-7 days/week)",
    1.9: "Athlete (2x training/day)",
  };

  const calculateGoals = (e) => {
    e.preventDefault();

    const goalWeight =
      (inputData.weight * (100 - inputData.goalBodyfat)) /
      (100 - inputData.currentBodyfat);
    const bmr =
      10 * inputData.weight +
      6.25 * inputData.height -
      5 * inputData.age +
      (inputData.gender === "1" ? 5 : -161);
    const tdee = bmr * Number(inputData.activityMultiplier); // Convert to number
    const dailyCalories = tdee * (1 - inputData.calorieDeficit / 100);
    const proteinGoal = inputData.weight * 2;

    const weeklyProgress = [];
    const totalWeeks = 20;
    const weightLossPerWeek = (inputData.weight - goalWeight) / totalWeeks;

    for (let i = 1; i <= totalWeeks; i++) {
      weeklyProgress.push({
        week: i,
        weight: (inputData.weight - weightLossPerWeek * i).toFixed(1),
        bodyfat: (
          inputData.currentBodyfat -
          ((inputData.currentBodyfat - inputData.goalBodyfat) / totalWeeks) * i
        ).toFixed(1),
      });
    }

    setResult({
      goalWeight: Number(goalWeight.toFixed(2)),
      dailyCalories: Math.round(dailyCalories),
      proteinGoal: Math.round(proteinGoal),
      weeklyProgress,
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
      <Card className="max-w-4xl mx-auto bg-zinc-900 border-zinc-800">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-3xl font-bold tracking-tight">
            BIGMAN
          </CardTitle>
          <p className="text-zinc-400">Transform Better</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={calculateGoals} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Enter Current Weight (kgs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={inputData.weight}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      weight: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyfat">Current Bodyfat %</Label>
                <Input
                  id="bodyfat"
                  type="number"
                  value={inputData.currentBodyfat}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      currentBodyfat: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender (M=1, F=0)</Label>
                <Select
                  className="w-32 text-sm p-2"
                  value={inputData.gender}
                  onChange={(e) =>
                    setInputData({ ...inputData, gender: e.target.value })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue>
                      {inputData.gender === "1" ? "Male" : "Female"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Male</SelectItem>
                    <SelectItem value="0">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Activity Multiplier</Label>
                <Select
                  id="activity"
                  className="w-36 text-sm p-2"
                  value={inputData.activityMultiplier}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      activityMultiplier: e.target.value,
                    })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue>
                      {activityLevels[inputData.activityMultiplier]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(activityLevels).map(
                      ([multiplier, description]) => (
                        <SelectItem key={multiplier} value={multiplier}>
                          {description}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Enter Height (cms)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={inputData.height}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      height: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalBf">Goal Bodyfat %</Label>
                <Input
                  id="goalBf"
                  type="number"
                  value={inputData.goalBodyfat}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      goalBodyfat: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
            

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Calculate
            </button>
          </form>

          {result && (
            <div className="pt-6 border-t border-zinc-800">
              <h3 className="text-lg font-semibold mb-4 text-orange-500">
                RESULT
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {result && (
                  <>
                    <div className="p-4 border border-orange-500 rounded-lg">
                      <p className="text-sm text-zinc-400">
                        Your Goal Bodyweight is
                      </p>
                      <p className="text-xl font-bold">
                        {result.goalWeight} kgs
                      </p>
                    </div>
                    <div className="p-4 border border-orange-500 rounded-lg">
                      <p className="text-sm text-zinc-400">
                        Your Daily Calorie Goal is
                      </p>
                      <p className="text-xl font-bold">
                        {result.dailyCalories} cals
                      </p>
                    </div>
                    <div className="p-4 border border-orange-500 rounded-lg">
                      <p className="text-sm text-zinc-400">
                        Daily Protein Goal is
                      </p>
                      <p className="text-xl font-bold">
                        {result.proteinGoal} g
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </motion.div>
    </div>
  );
}
