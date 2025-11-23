/* eslint-disable react/prop-types */
import { useState } from "react";
import PlaceholdersAndVanishInputDemo from "./input";
import FoodAnalyzer from "./Text";
import { motion } from "framer-motion";

function Home({ foodName, setFoodName, output, setOutput, loading, setLoading, setOriginalQuery, originalQuery }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen w-full flex flex-col"
    >
      {/* Fixed Header Section - Made more compact */}
      <div className="w-full z-20 flex flex-col items-center bg-neutral-900/80 pb-3 sm:pt-16 sticky top-0 border-b border-neutral-700/50">
        <h2 className="relative z-10 text-xl sm:text-2xl md:text-4xl max-w-5xl mx-auto text-center tracking-tight font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white flex items-center gap-1 sm:gap-2 md:gap-6">
          <span className="text-sm sm:text-lg md:text-2xl lg:text-4xl">Food Analyser</span>
          <span className="text-white text-xs sm:text-sm md:text-base font-thin">x</span>
          <span className="text-sm sm:text-lg md:text-2xl lg:text-4xl">fit</span>
        </h2>
        <h3 className="text-white text-xs sm:text-sm md:text-base font-thin mb-2 px-2 text-center mt-1">
          Discover nutritional information for any food
        </h3>
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl px-2">
          <PlaceholdersAndVanishInputDemo
            foodName={foodName}
            setFoodName={setFoodName}
            output={output}
            setOutput={setOutput}
            loading={loading}
            setLoading={setLoading}
            setOriginalQuery={setOriginalQuery}
            setSearchAttempted={setSearchAttempted}
          />
        </div>

        {/* "How to Use" Button - Always visible */}
        <button
          onClick={() => setIsGuideOpen(true)}
          className="mt-2 text-xs text-neutral-400 hover:text-white underline focus:outline-none transition-colors"
        >
          How to Use?
        </button>
      </div>

      {/* Scrollable Content Section with better spacing */}
      <div className="flex-1 flex flex-col items-center justify-start px-2 sm:px-0 ">
        <div className=" sm:mt-10"> 
        <FoodAnalyzer
          output={output}
          loading={loading}
          originalQuery={originalQuery}
          searchAttempted={searchAttempted}
        />
         </div>
      </div>

      {/* Buy Me a Coffee Button - Fixed position */}
      <a
        href="https://www.buymeacoffee.com/suvamneog"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 hover:scale-105 transition-transform duration-200 z-40"
      >
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          className="shadow-lg h-10 w-auto sm:h-12"
          style={{ 
            height: "40px", 
            width: "auto",
            maxWidth: "140px"
          }}
        />
      </a>

      {/* Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-neutral-800 rounded-lg p-4 sm:p-6 max-w-2xl w-full mx-auto text-xs sm:text-sm md:text-base text-neutral-300 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 sm:mb-4">
              How to Use the Food Analyser 
            </h3>

            <button
              onClick={() => setIsGuideOpen(false)}
              className="mt-4 sm:mt-6 w-full px-3 sm:px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg focus:outline-none text-sm sm:text-base"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default Home;