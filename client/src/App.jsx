import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./utils/AuthContext"
import ShootingStarsAndStarsBackgroundDemo from "./pages/background"
import AddFood from "./pages/addFood"
import LogMeals from "./pages/logMeals"
import SignupFormDemo from "./pages/signup"
import Login from "./pages/login"
import CalorieCalculator from "./pages/Calculator"
import Home from "./pages/home"
import History from "./pages/history"
import Text from "./pages/Text"
import BarcodeScanner from "./pages/barcodeScanner"
import FoodScanner from "./pages/FoodImageRecognition"
import NavBar from "./pages/navBar"

function App() {
  const [foodName, setFoodName] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={
            <ShootingStarsAndStarsBackgroundDemo
              foodName={foodName}
              setFoodName={setFoodName}
              output={output}
              setOutput={setOutput}
              loading={loading} // Pass loading state
              setLoading={setLoading} // Pass setLoading function
            >
              <Home
                foodName={foodName}
                setFoodName={setFoodName}
                output={output}
                setOutput={setOutput}
                loading={loading} // Pass loading state
                setLoading={setLoading} // Pass setLoading function
              />
            </ShootingStarsAndStarsBackgroundDemo>
          }
        />
        <Route path="/signup" element={<SignupFormDemo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login" element={<Text />} />
        <Route path="/scan" element={<BarcodeScanner />} />
        <Route path="/image" element={<FoodScanner />} />
        <Route path="/calculator" element={<CalorieCalculator />} />
        <Route path="/logmeals" element={<LogMeals />} />
        <Route path="/history" element={<History />} />
        <Route path="/addfoods" element={<AddFood />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;