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
  children,
}) {
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-ink-950">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <ShootingStars />
        <StarsBackground />
      </div>
      <div className="relative z-10 w-full">
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
