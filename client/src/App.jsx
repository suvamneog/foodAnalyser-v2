
// import LogMeals from "./pages/logMeals";
// function App() {
//   return (
//     <>
//       <LogMeals />
//     </>
//   );
// }
// export default App;

import { useState } from "react";
import ShootingStarsAndStarsBackgroundDemo from "./pages/background";
import Navbar from "./pages/navBar";
import LogMeals from "./pages/logMeals";
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
    <Route path="/logmeals" element={<LogMeals />} />
  </Routes>
</Router>
)
}
export default App;
