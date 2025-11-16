/* eslint-disable react/prop-types */
"use client";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import Home from "./home";

function ShootingStarsAndStarsBackgroundDemo({ 
  foodName, 
  setFoodName, 
  output, 
  setOutput, 
  loading, 
  setLoading, 
  setOriginalQuery,
  originalQuery,
  children 
}) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative bg-neutral-900">
      <div className="absolute inset-0 pointer-events-none">
        <ShootingStars />
        <StarsBackground />
      </div>
      <div className="relative z-10 w-full flex flex-col items-center">
        {children || (
          <Home
            foodName={foodName}
            setFoodName={setFoodName}
            output={output}
            setOutput={setOutput}
            loading={loading}
            setLoading={setLoading}
            setOriginalQuery={setOriginalQuery}
            originalQuery={originalQuery}
          />
        )}
      </div>
    </div>
  );
}

export default ShootingStarsAndStarsBackgroundDemo;