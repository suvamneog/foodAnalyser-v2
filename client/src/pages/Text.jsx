/* eslint-disable react/prop-types */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function FoodAnalyzer({output}) {
  console.log(output);  
  if (!output ||  output.length === 0) {
    return <p>No data available</p>; // Handle empty data case
  }
return (
  <>
    <div className="grid gap-6 max-w-4xl mx-auto p-40">
      { output.map((food, index) => (
      <Card key={index} className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl">{food.name}</CardTitle>
          <CardDescription>Nutritional Analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <span className="text-xl">Calories</span>
              <span className="text-2xl font-bold text-primary">{food.calories} kcal</span>
            </div>

            <div className="grid gap-4">
              <h3 className="font-semibold">Macronutrients</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">Protein</CardTitle>
                    <p className="text-2xl font-bold">{food.protein_g} g</p>
                  </CardHeader>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">Carbs</CardTitle>
                    <p className="text-2xl font-bold">{food.carbohydrates_total_g} g</p>
                  </CardHeader>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">Fats</CardTitle>
                    <p className="text-2xl font-bold">{food.fat_total_g} g</p>
                  </CardHeader>
                </Card>
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="font-semibold">Benefits & Considerations</h3>
              <div className="grid gap-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Pros</h4>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Cons</h4>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      ))}
    </div>
  </>
)
}
export default FoodAnalyzer