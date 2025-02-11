// import CalorieCalculator from "./pages/Calculator";
// import SignupFormDemo from "./pages/signup";
// import Navbar from "./pages/navBar";
// function App() {
//   return (
//     <>
//       <CalorieCalculator />
//     </>
//   );
// }
// export default App;

import { useState } from "react";
import ShootingStarsAndStarsBackgroundDemo from "./pages/background";
import Navbar from "./pages/navBar";
import SignupFormDemo from "./pages/signup";
import CalorieCalculator from "./pages/Calculator";
import Home from "./pages/home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  const [foodName, setFoodName] = useState("");
  const [output, setOutput] = useState("");
 return (
  <Router>
  <Navbar />
  <Routes>
    <Route
      path="/"
      element={
        <ShootingStarsAndStarsBackgroundDemo
          foodName={foodName}
          setFoodName={setFoodName}
          output={output}
          setOutput={setOutput}
        >
          <Home foodName={foodName} setFoodName={setFoodName} output={output} setOutput={setOutput} />
        </ShootingStarsAndStarsBackgroundDemo>
      }
    />
    <Route path="/" element={<Home/>} />
    <Route path="/signup" element={<SignupFormDemo />} />
    <Route path="/calculator" element={<CalorieCalculator />} />
  </Routes>
</Router>
)
}
export default App;
