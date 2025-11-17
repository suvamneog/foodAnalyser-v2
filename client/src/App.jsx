import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./utils/AuthContext"
import { ReviewsProvider } from "./utils/ReviewsContext"
import ShootingStarsAndStarsBackgroundDemo from "./pages/background"
import History from "./pages/history"
import AddFood from "./pages/addFood"
import LogMeals from "./pages/logMeals"
import SignupFormDemo from "./pages/signup"
import Login from "./pages/login"
import CalorieCalculator from "./pages/Calculator"
import Home from "./pages/home"
import Text from "./pages/Text"
import BarcodeScanner from "./pages/barcodeScanner"
import FoodScanner from "./pages/FoodImageRecognition"
import NavBar from "./pages/navBar"
import About from "./pages/About"
import Review from "./pages/review"

function App() {
  const [foodName, setFoodName] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalQuery, setOriginalQuery] = useState(""); 

  return (
    <AuthProvider>
      <ReviewsProvider>
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
                loading={loading}
                setLoading={setLoading}
                setOriginalQuery={setOriginalQuery}
                originalQuery={originalQuery}
              >
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
              </ShootingStarsAndStarsBackgroundDemo>
            }
          />
          <Route path="/signup" element={<SignupFormDemo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/text" element={<Text output={[]} originalQuery="" />} />
          <Route path="/scan" element={<BarcodeScanner />} />
          <Route path="/image" element={<FoodScanner />} />
          <Route path="/calculator" element={<CalorieCalculator />} />
          <Route path="/logmeals" element={<LogMeals />} />
          <Route path="/history" element={<History />} />
          <Route path="/addfoods" element={<AddFood />} />
          <Route path="/about" element={<About />} />
          <Route path="/review" element={<Review />} />
        </Routes>
      </ReviewsProvider>
    </AuthProvider>
  );
}

export default App;