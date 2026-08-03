import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./utils/AuthContext"
import { ReviewsProvider } from "./utils/ReviewsContext"
import { ToastProvider } from "./components/ui/toast"
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
import About from "./pages/About"
import Review from "./pages/review"
import CuisinePage from "./pages/CuisinePage"
import CompareStaples from "./pages/CompareStaples"
import DietPlan from "./pages/DietPlan"
import DailyTracker from "./pages/DailyTracker"
import RecipeAnalyzer from "./pages/RecipeAnalyzer"
import Profile from "./pages/Profile"

function App() {
  const [foodName, setFoodName] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalQuery, setOriginalQuery] = useState(""); 

  return (
    <AuthProvider>
      <ToastProvider>
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
          <Route path="/cuisine/:slug" element={<CuisinePage />} />
          <Route path="/compare" element={<CompareStaples />} />
          <Route path="/compare/:familyId" element={<CompareStaples />} />
          <Route path="/plan" element={<DietPlan />} />
          <Route path="/tracker" element={<DailyTracker />} />
          <Route path="/recipe" element={<RecipeAnalyzer />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </ReviewsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;