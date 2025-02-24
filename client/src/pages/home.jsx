/* eslint-disable react/prop-types */
import PlaceholdersAndVanishInputDemo from "./input";
import FoodAnalyzer from "./Text";
import { motion } from "framer-motion";

function Home({ foodName, setFoodName, output, setOutput}) {
  return (
    <motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="min-h-screen w-full"
>
  <div className="sm:h-[30rem] md:h-[40rem]flex flex-col justify-center items-center px-4 ">
    <div className="w-full z-20 flex flex-col items-center bg-neutral-900/80 pb-4 min-h-[50px] ">
      <h2 className="relative z-10 text-3xl md:text-5xl md:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white flex items-center gap-2 md:gap-8 mt-20">
        <span>Food Analyser</span>
        <span className="text-white text-lg font-thin">x</span>
        <span>fit</span>
      </h2>
      <h3 className="text-white text-lg font-thin mb-4">
        Discover nutritional information for any food
      </h3>
      <PlaceholdersAndVanishInputDemo 
        foodName={foodName} 
        setFoodName={setFoodName} 
        output={output} 
        setOutput={setOutput} 
      />
    </div>
    
    <div className="w-full">
      <FoodAnalyzer 
        foodName={foodName} 
        setFoodName={setFoodName} 
        output={output} 
        setOutput={setOutput}
      /> 
  </div>
    </div>
</motion.div>
  )
}

export default Home;