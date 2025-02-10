// import CalorieCalculator from "./pages/Calculator";
// import SignupFormDemo from "./pages/signup";
// import Navbar from "./pages/navBar";
// function App() {
//   return (
//     <>
//       <SignupFormDemo />
//     </>
//   );
// }
// export default App;

import {  useState } from "react";
import ShootingStarsAndStarsBackgroundDemo from "./pages/background";
import Navbar from "./pages/navBar";

function App() {
  const [foodName, setFoodName] = useState("");
  const [output, setOutput] = useState("");

  return (
    <>
    <Navbar/>
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
