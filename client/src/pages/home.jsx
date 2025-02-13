/* eslint-disable react/prop-types */
import PlaceholdersAndVanishInputDemo from "./input";
import FoodAnalyzer from "./Text";
import { motion } from "framer-motion";
function Home({ foodName, setFoodName, output, setOutput }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
    <div className="h-screen w-screen rounded-none flex flex-col items-center justify-center relative">
    <h2
      className="relative flex-col md:flex-row z-10 text-3xl md:text-5xl md:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white flex items-center gap-2 md:gap-8">
      <span>Food Analyser</span>
      <span className="text-white text-lg font-thin">x</span>
      <span>fit</span>
    </h2>
    <h3 className="text-white text-lg font-thin">Discover nutritional information for any food</h3>
    <PlaceholdersAndVanishInputDemo foodName={foodName} setFoodName={setFoodName} output={output} setOutput={setOutput}/>
    <div className="grid gap-6 max-w-4xl mx-auto p-4 sm:p-8 md:p-12 lg:p-20 absolute z-10 mb-20 min-h-[500px] max-h-screen overflow-auto">
    <FoodAnalyzer foodName={foodName} setFoodName={setFoodName} output={output} setOutput={setOutput}/> 
    </div>
  </div>
  </motion.div>
  );
}

export default Home;


