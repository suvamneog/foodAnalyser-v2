import { useState } from "react";
import ShootingStarsAndStarsBackgroundDemo from "./pages/background";

function App() {
  const [foodName, setFoodName] = useState("");
  const [output, setOutput] = useState("");
  
  return (
    <>
      <ShootingStarsAndStarsBackgroundDemo
        foodName={foodName}
        setFoodName={setFoodName}
        output={output}
        setOutput={setOutput}
      />
    </>
  );
}
export default App;
