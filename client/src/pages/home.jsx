/* eslint-disable react/prop-types */
import { useState } from "react";
import PlaceholdersAndVanishInputDemo from "./input";
import FoodAnalyzer from "./Text";
import { motion } from "framer-motion";

function Home({ foodName, setFoodName, output, setOutput, loading, setLoading }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen w-full"
    >
      <div className="flex flex-col justify-center items-center px-2 sm:px-4">
        {/* Header Section */}
        <div className="w-full z-20 flex flex-col items-center bg-neutral-900/80 pb-4 min-h-[50px]">
          <h2 className="relative z-10 text-2xl sm:text-3xl md:text-5xl md:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white flex items-center gap-1 sm:gap-2 md:gap-8 mt-16 sm:mt-20">
            <span>Food Analyser</span>
            <span className="text-white text-base sm:text-lg font-thin">x</span>
            <span>fit</span>
          </h2>
          <h3 className="text-white text-sm sm:text-lg font-thin mb-2 sm:mb-4 px-2 text-center">
            Discover nutritional information for any food
          </h3>
          <PlaceholdersAndVanishInputDemo
            foodName={foodName}
            setFoodName={setFoodName}
            output={output}
            setOutput={setOutput}
            loading={loading} // Pass loading state
            setLoading={setLoading} // Pass setLoading function
          />

          {/* "How to Use" Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="mt-4 text-sm text-neutral-400 hover:text-white underline focus:outline-none"
          >
            How to Use?
          </button>
        </div>

        {/* Food Analyzer Section */}
        <div className="w-full px-2 sm:px-0">
          <FoodAnalyzer
            output={output}
            loading={loading} // Pass loading state
          />
        </div>

        {/* Buy Me a Coffee Button */}
        <a
          href="https://www.buymeacoffee.com/suvamneog"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 hover:scale-105 transition-transform duration-200"
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            style={{ height: "60px", width: "217px" }}
            className="shadow-lg"
          />
        </a>
      </div>

      {/* Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 text-sm sm:text-base text-neutral-300"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
              How to Use the Food Analyser 
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-white">1. Search for a Food Item</p>
                <p className="ml-4">
                  Type the name of a food or drink in the search bar. For example:
                </p>
                <ul className="ml-8 list-disc">
                  <li><code>apple</code></li>
                  <li><code>chicken breast</code></li>
                  <li><code>pasta</code></li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-white">2. Add Quantities (Optional)</p>
                <p className="ml-4">
                  You can specify a quantity for more accurate results. For example:
                </p>
                <ul className="ml-8 list-disc">
                  <li><code>3 tomatoes</code> - for 3 tomatoes</li>
                  <li><code>1lb beef brisket</code> - for 1 pound of beef</li>
                  <li><code>200g pasta</code> - for 200 grams of pasta</li>
                  <li><code>1.5kg watermelon</code> - for 1.5 kilograms of watermelon</li>
                </ul>
                <p className="ml-4 mt-2 text-neutral-400">
                  If no quantity is specified, the default is <strong>100 grams</strong>.
                </p>
              </div>

              <div>
                <p className="font-medium text-white">3. Get Nutritional Info</p>
                <p className="ml-4">
                  Press <kbd>Enter</kbd> or click the search button to see the nutritional
                  information, including calories, protein, carbs, and fats.
                </p>
              </div>

              <div>
                <p className="font-medium text-white">4. Try Different Foods</p>
                <p className="ml-4">
                  Compare nutritional values by searching for different foods or quantities!
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsGuideOpen(false)}
              className="mt-6 w-full sm:w-auto px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg focus:outline-none"
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