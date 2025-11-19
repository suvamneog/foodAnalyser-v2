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
      className="min-h-screen w-full " // Added padding-top for fixed navbar
    >
      <div className="flex flex-col justify-center items-center px-2 sm:px-4">
        {/* Header Section */}
        <div className="w-full z-20 flex flex-col items-center bg-neutral-900/80 pb-4 min-h-[50px]">
          <h2 className="relative z-10 text-2xl sm:text-3xl md:text-5xl md:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white flex items-center gap-1 sm:gap-2 md:gap-8 mt-16 sm:mt-20">
            <span className="text-base sm:text-xl md:text-3xl lg:text-5xl">Food Analyser</span>
            <span className="text-white text-sm sm:text-base md:text-lg font-thin">x</span>
            <span className="text-base sm:text-xl md:text-3xl lg:text-5xl">fit</span>
          </h2>
          <h3 className="text-white text-xs sm:text-sm md:text-lg font-thin mb-2 sm:mb-4 px-2 text-center mt-2">
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

          {/* "How to Use" Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="mt-3 sm:mt-4 text-xs sm:text-sm text-neutral-400 hover:text-white underline focus:outline-none"
          >
            How to Use?
          </button>
        </div>

        {/* Food Analyzer Section */}
        <div className="w-full px-3 sm:px-4 md:px-0 mt-4">
          <FoodAnalyzer
            output={output}
            loading={loading}
            originalQuery={originalQuery}
             searchAttempted={searchAttempted}
          />
        </div>

        {/* Buy Me a Coffee Button - Responsive sizing */}
        <a
          href="https://www.buymeacoffee.com/suvamneog"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 hover:scale-105 transition-transform duration-200 z-40"
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            className="shadow-lg h-10 w-auto sm:h-12 md:h-14 lg:h-16"
            style={{ 
              height: "40px", 
              width: "auto",
              maxWidth: "140px"
            }}
          />
        </a>
      </div>

      {/* Guide Modal - Responsive */}
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
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="font-medium text-white text-sm sm:text-base">1. Search for a Food Item</p>
                <p className="ml-2 sm:ml-4 mt-1">
                  Type the name of a food or drink in the search bar. For example:
                </p>
                <ul className="ml-4 sm:ml-6 md:ml-8 list-disc mt-1">
                  <li><code className="text-xs sm:text-sm">Rice</code></li>
                  <li><code className="text-xs sm:text-sm">Chicken breast</code></li>
                  <li><code className="text-xs sm:text-sm">Dal</code></li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-white text-sm sm:text-base">2. Add Quantities (Optional)</p>
                <p className="ml-2 sm:ml-4 mt-1">
                  You can specify a quantity in grams for more accurate results. For example:
                </p>
                <ul className="ml-4 sm:ml-6 md:ml-8 list-disc mt-1">
                  <li className="mb-1">
                    <code className="text-xs sm:text-sm">100g chicken breast</code> - for 100 grams of chicken
                  </li>
                  <li className="mb-1">
                    <code className="text-xs sm:text-sm">200g pasta</code> - for 200 grams of pasta
                  </li>
                  <li>
                    <code className="text-xs sm:text-sm">50g rice</code> - for 50 grams of rice
                  </li>
                </ul>
                <p className="ml-2 sm:ml-4 mt-2 text-neutral-400 text-xs sm:text-sm">
                  If no quantity is specified, the default is <strong>100 grams</strong>.
                  <br />
                  <em>Note: Currently only gram units are supported (e.g., 100g, 250g)</em>
                </p>
              </div>

              <div>
                <p className="font-medium text-white text-sm sm:text-base">3. Get Nutritional Info</p>
                <p className="ml-2 sm:ml-4 mt-1">
                  Press <kbd className="px-1 sm:px-2 py-1 text-xs bg-neutral-700 rounded">Enter</kbd> or click the search button to see the nutritional
                  information, including calories, protein, carbs, and fats.
                </p>
              </div>

              <div>
                <p className="font-medium text-white text-sm sm:text-base">4. Try Different Foods</p>
                <p className="ml-2 sm:ml-4 mt-1">
                  Compare nutritional values by searching for different foods or quantities!
                </p>
              </div>
            </div>

            {/* Close Button */}
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