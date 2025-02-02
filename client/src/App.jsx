import {  useState } from "react";
import ShootingStarsAndStarsBackgroundDemo from "./pages/background";


function App() {
  const [foodName, setFoodName] = useState("");
  const [output, setOutput] = useState("");

  // useEffect(() => {
  //    const data = fetchFoodData(foodName);
  //       console.log("submitted", data);
  // })
  
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
