/* eslint-disable react/prop-types */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Info, LogIn } from "lucide-react"
import { CardBody, CardContainer, CardItem } from "../components/ui/3D-card"
import { useAuth } from "../utils/AuthContext"
import { Link } from "react-router-dom"

function analyzeFood(food) {
  const pros = []
  const cons = []

  // Analyze protein
  if (food.protein_g > 20) {
    pros.push("High in protein")
  } else if (food.protein_g > 10) {
    pros.push("Good source of protein")
  }

  // Analyze carbohydrates
  if (food.carbohydrates_total_g < 5) {
    pros.push("Low in carbs")
  } else if (food.carbohydrates_total_g > 50) {
    cons.push("High in carbohydrates")
  }

  // Analyze fiber if available
  if (food.fiber_g && food.fiber_g > 5) {
    pros.push("High in fiber")
  }

  // Analyze sugar if available
  if (food.sugar_g && food.sugar_g > 10) {
    cons.push("High in sugar")
  }

  // Analyze fat content
  if (food.fat_total_g > 15) {
    cons.push("High in fat")
  }

  // Analyze saturated fat if available
  if (food.fat_saturated_g && food.fat_saturated_g > 5) {
    cons.push("High in saturated fat")
  }

  // Analyze sodium if available
  if (food.sodium_mg && food.sodium_mg > 500) {
    cons.push("High in sodium")
  }

  // Analyze cholesterol if available
  if (food.cholesterol_mg && food.cholesterol_mg > 50) {
    cons.push("Contains cholesterol")
  }

  // Add general nutrition facts
  if (food.calories < 100) {
    pros.push("Low calorie food")
  }

  return { pros, cons }
}

function FoodAnalyzer({ output }) {
  const { isAuthenticated } = useAuth()

  if (!output || output.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col justify-center items-center w-full">
      {output.map((food, index) => {
        const { pros, cons } = analyzeFood(food)
        return (
          <CardContainer key={index} className="w-full max-w-[650px] transform scale-100 sm:scale-95 md:scale-90 lg:scale-85">
            <CardBody className="bg-[#0C0C0C]/90 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="relative">
                <CardItem translateZ="50">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl md:text-2xl lg:text-2xl text-white">{food.name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Nutritional Analysis</CardDescription>
                    {!isAuthenticated && (
                      <CardDescription className="mt-2 text-blue-400 flex items-center gap-2 text-xs sm:text-sm">
                        <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                        <Link to="/login" className="underline text-red-400 hover:text-blue-300">
                          Log in and search to save your search history!
                        </Link>
                      </CardDescription>
                    )}
                  </CardHeader>
                </CardItem>

                <CardItem translateZ="60">
                  <CardContent>
                    <div className="grid gap-4 sm:gap-5 md:gap-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg sm:text-xl text-white">Total Calories</span>
                        <span className="text-xl sm:text-2xl font-bold text-white">{food.calories} kcal</span>
                      </div>

                      <div className="grid gap-3 sm:gap-4">
                        <CardItem translateZ="70">
                          <h3 className="font-semibold text-white text-base sm:text-lg">Macronutrients</h3>
                        </CardItem>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          <CardItem translateZ="80">
                            <Card className="bg-[#0C0C0C] border-white/[0.05]">
                              <CardHeader className="p-3 sm:p-4">
                                <CardTitle className="text-base sm:text-lg">Protein</CardTitle>
                                <p className="text-xl sm:text-2xl font-bold">{food.protein_g} g</p>
                              </CardHeader>
                            </Card>
                          </CardItem>
                          <CardItem translateZ="90">
                            <Card className="bg-[#0C0C0C] border-white/[0.05]">
                              <CardHeader className="p-3 sm:p-4">
                                <CardTitle className="text-base sm:text-lg">Carbs</CardTitle>
                                <p className="text-xl sm:text-2xl font-bold">{food.carbohydrates_total_g} g</p>
                              </CardHeader>
                            </Card>
                          </CardItem>
                          <CardItem translateZ="80">
                            <Card className="bg-[#0C0C0C] border-white/[0.05]">
                              <CardHeader className="p-3 sm:p-4">
                                <CardTitle className="text-base sm:text-lg">Fats</CardTitle>
                                <p className="text-xl sm:text-2xl font-bold">{food.fat_total_g} g</p>
                              </CardHeader>
                            </Card>
                          </CardItem>
                        </div>
                      </div>

                      <CardItem translateZ="100">
                        <div className="grid gap-3 sm:gap-4">
                          <h3 className="font-semibold text-white text-base sm:text-lg">Benefits & Considerations</h3>
                          <div className="grid gap-2 sm:gap-3">
                            <div>
                              <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                                Pros
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              </h4>
                              <ul className="list-disc pl-4 sm:pl-5 text-green-400 text-sm sm:text-base">
                                {pros.length > 0 ? (
                                  pros.map((pro, i) => <li key={i}>{pro}</li>)
                                ) : (
                                  <li>No major pros</li>
                                )}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                                Cons
                                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                              </h4>
                              <ul className="list-disc pl-4 sm:pl-5 text-red-400 text-sm sm:text-base">
                                {cons.length > 0 ? (
                                  cons.map((con, i) => <li key={i}>{con}</li>)
                                ) : (
                                  <li>No major cons</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardItem>
                    </div>
                  </CardContent>
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
        )
      })}
    </div>
  )
}

export default FoodAnalyzer