/* eslint-disable react/prop-types */
"use client";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import PlaceholdersAndVanishInputDemo from "./input";
import  TextGenerateEffectDemo  from "./Output";
import FoodAnalyzer from "./Text";
// import  TypewriterEffectSmoothDemo  from "./title";

function ShootingStarsAndStarsBackgroundDemo({foodName,setFoodName, output, setOutput}) {
  return (
    <div
      className="h-screen w-screen rounded-none bg-neutral-900 flex flex-col items-center justify-center relative">
      <h2
        className="relative flex-col md:flex-row z-10 text-3xl md:text-5xl md:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-white to-white flex items-center gap-2 md:gap-8">
        <span>Food Analyser</span>
        <span className="text-white text-lg font-thin">x</span>
        <span>fit</span>
      </h2>
      <PlaceholdersAndVanishInputDemo foodName={foodName} setFoodName={setFoodName} output={output} setOutput={setOutput}/>
      <FoodAnalyzer foodName={foodName} setFoodName={setFoodName} output={output} setOutput={setOutput}/> 
      <TextGenerateEffectDemo />
      <ShootingStars />
      <StarsBackground />
    </div>
  );
}

export default ShootingStarsAndStarsBackgroundDemo;