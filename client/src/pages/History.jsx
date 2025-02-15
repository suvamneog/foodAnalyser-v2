import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Apple, Beef, Cookie } from "lucide-react";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";
// Mock data - replace with your actual data source
const searchHistory = [
  {
    id: 1,
    name: "Apple",
    calories: 53,
    protein: 0.3,
    carbs: 14.1,
    fats: 0.2,
    pros: ["Low calorie food", "Rich in fiber"],
    cons: ["High in sugar"],
    icon: Apple,
    date: "2024-03-20"
  },
  {
    id: 2,
    name: "Beef Steak",
    calories: 250,
    protein: 26,
    carbs: 0,
    fats: 17,
    pros: ["High in protein", "Rich in iron"],
    cons: ["High in saturated fats"],
    icon: Beef,
    date: "2024-03-19"
  },
  {
    id: 3,
    name: "Chocolate Cookie",
    calories: 180,
    protein: 2,
    carbs: 25,
    fats: 9,
    pros: ["Good source of energy"],
    cons: ["High in sugar", "High in fats"],
    icon: Cookie,
    date: "2024-03-18"
  },
];

function History() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950 mt-10">
    <div className="container mx-auto py-8 px-4">
        <div className="absolute inset-0 pointer-events-none">
            <StarsBackground />
            <ShootingStars />
            </div>
            <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      
      >
      <h1 className="text-4xl font-bold mb-8 text-white text-center">Food Search History</h1>
      <ScrollArea className="h-[800px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchHistory.map((food) => (
            <Card key={food.id} className="bg-neutral-800 text-white border-neutral-700 hover:border-neutral-600 transition-all">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <food.icon className="w-6 h-6" />
                    <h2 className="text-xl font-semibold">{food.name}</h2>
                  </div>
                  <Badge variant="secondary" className="bg-neutral-700">
                    {food.calories} kcal
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-neutral-900 p-3 rounded-lg text-center">
                    <p className="text-sm text-neutral-400">Protein</p>
                    <p className="text-lg font-semibold">{food.protein}g</p>
                  </div>
                  <div className="bg-neutral-900 p-3 rounded-lg text-center">
                    <p className="text-sm text-neutral-400">Carbs</p>
                    <p className="text-lg font-semibold">{food.carbs}g</p>
                  </div>
                  <div className="bg-neutral-900 p-3 rounded-lg text-center">
                    <p className="text-sm text-neutral-400">Fats</p>
                    <p className="text-lg font-semibold">{food.fats}g</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-400 mb-2">Pros</h3>
                    <div className="flex flex-wrap gap-2">
                      {food.pros.map((pro, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-900/30 text-green-400 hover:bg-green-900/50">
                          {pro}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-400 mb-2">Cons</h3>
                    <div className="flex flex-wrap gap-2">
                      {food.cons.map((con, index) => (
                        <Badge key={index} variant="secondary" className="bg-red-900/30 text-red-400 hover:bg-red-900/50">
                          {con}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <p className="text-sm text-neutral-400">Searched on {new Date(food.date).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
    </div>
    </div>
  );
}
export default History