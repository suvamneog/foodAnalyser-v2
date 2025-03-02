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

  if (food.protein_g > 20) pros.push("High in protein")
  else if (food.protein_g > 10) pros.push("Good source of protein")

  if (food.carbohydrates_total_g < 5) pros.push("Low in carbs")
  else if (food.carbohydrates_total_g > 50) cons.push("High in carbohydrates")

  if (food.fiber_g && food.fiber_g > 5) pros.push("High in fiber")
  if (food.sugar_g && food.sugar_g > 10) cons.push("High in sugar")
  if (food.fat_total_g > 15) cons.push("High in fat")
  if (food.fat_saturated_g && food.fat_saturated_g > 5) cons.push("High in saturated fat")
  if (food.sodium_mg && food.sodium_mg > 500) cons.push("High in sodium")
  if (food.cholesterol_mg && food.cholesterol_mg > 50) cons.push("Contains cholesterol")
  if (food.calories < 100) pros.push("Low calorie food")

  return { pros, cons }
}

function FoodAnalyzer({ output }) {
  const { isAuthenticated } = useAuth()

  if (!output || output.length === 0) return null

  return (
    <div className="flex flex-col justify-center items-center w-full">
      {output.map((food, index) => {
        const { pros, cons } = analyzeFood(food)
        return (
          <CardContainer key={index} className="w-full max-w-xs mx-auto">
            <CardBody className="bg-[#0C0C0C]/90 rounded-xl p-1 sm:p-2 md:p-3">
              <CardItem>
                <CardHeader className="p-2 sm:p-3">
                  <CardTitle className="text-base sm:text-lg md:text-xl text-white">{food.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Nutritional Analysis</CardDescription>
                  {!isAuthenticated && (
                    <CardDescription className="mt-1 sm:mt-2 text-blue-400 flex items-center gap-1 sm:gap-2 text-xs">
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm md:text-base text-white">Total Calories</span>
                      <span className="text-base sm:text-lg md:text-xl font-bold text-white">{food.calories} kcal</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
                      <CardItem>
                        <Card className="bg-[#0C0C0C] border-white/[0.05]">
                          <CardHeader className="p-1 sm:p-2 md:p-3">
                            <CardTitle className="text-xs sm:text-sm md:text-base">Protein</CardTitle>
                            <p className="text-sm sm:text-base md:text-lg font-bold">{food.protein_g} g</p>
                          </CardHeader>
                        </Card>
                      </CardItem>
                      <CardItem>
                        <Card className="bg-[#0C0C0C] border-white/[0.05]">
                          <CardHeader className="p-1 sm:p-2 md:p-3">
                            <CardTitle className="text-xs sm:text-sm md:text-base">Carbs</CardTitle>
                            <p className="text-sm sm:text-base md:text-lg font-bold">{food.carbohydrates_total_g} g</p>
                          </CardHeader>
                        </Card>
                      </CardItem>
                      <CardItem>
                        <Card className="bg-[#0C0C0C] border-white/[0.05]">
                          <CardHeader className="p-1 sm:p-2 md:p-3">
                            <CardTitle className="text-xs sm:text-sm md:text-base">Fats</CardTitle>
                            <p className="text-sm sm:text-base md:text-lg font-bold">{food.fat_total_g} g</p>
                          </CardHeader>
                        </Card>
                      </CardItem>
                    </div>

                    <CardItem>
                      <div className="grid gap-1 sm:gap-2">
                        <h3 className="font-semibold text-white text-xs sm:text-sm md:text-base">Pros & Cons</h3>
                        <div className="grid gap-1 sm:gap-2">
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                              Pros <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            </h4>
                            <ul className="list-disc pl-3 sm:pl-4 text-green-400 text-xs">
                              {pros.length > 0 ? (
                                pros.map((pro, i) => <li key={i}>{pro}</li>)
                              ) : (
                                <li>No major pros</li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                              Cons <Info className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                            </h4>
                            <ul className="list-disc pl-3 sm:pl-4 text-red-400 text-xs">
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
            </CardBody>
          </CardContainer>
        )
      })}
    </div>
  )
}

export default FoodAnalyzer