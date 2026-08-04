import { useState, useEffect } from "react"
import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
import { AuthProvider } from "./utils/AuthContext"
import { ThemeProvider } from "./utils/ThemeContext"
import { ReviewsProvider } from "./utils/ReviewsContext"
import { ToastProvider } from "./components/ui/toast"
import { PageTransition } from "./components/PageTransition"
import ShootingStarsAndStarsBackgroundDemo from "./pages/background"
import AddFood from "./pages/addFood"
import LogMeals from "./pages/logMeals"
import SignupFormDemo from "./pages/signup"
import Login from "./pages/login"
import CalorieCalculator from "./pages/Calculator"
import Home from "./pages/home"
import History from "./pages/History"
import Text from "./pages/Text"
import BarcodeScanner from "./pages/barcodeScanner"
import FoodScanner from "./pages/FoodImageRecognition"
import NavBar from "./pages/navBar"
import About from "./pages/About"
import Review from "./pages/review"
import CuisinePage from "./pages/CuisinePage"
import CategoryPage from "./pages/CategoryPage"
import CompareStaples from "./pages/CompareStaples"
import DietPlan from "./pages/DietPlan"
import DailyTracker from "./pages/DailyTracker"
import RecipeAnalyzer from "./pages/RecipeAnalyzer"
import Profile from "./pages/Profile"

function AppRoutes({
  foodName,
  setFoodName,
  output,
  setOutput,
  loading,
  setLoading,
  originalQuery,
  setOriginalQuery,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const handoff = location.state?.cuisineSearch;
  const handoffId = handoff?.query
    ? `${handoff.query}::${handoff.results?.[0]?.food_code || ""}::${
        Array.isArray(handoff.results) ? handoff.results.length : 0
      }`
    : null;
  const [seenHandoff, setSeenHandoff] = useState(null);

  // Apply analyse handoff during render so Home paints with results (no empty-home flash)
  if (handoffId && handoffId !== seenHandoff) {
    setSeenHandoff(handoffId);
    if (Array.isArray(handoff.results) && handoff.results.length > 0) {
      const results = [...handoff.results];
      results.originalQuery = handoff.query;
      setOutput(results);
      setOriginalQuery(handoff.query);
      setFoodName("");
    }
  }

  // Clear one-shot router state after paint (Home may still read it for scroll/preset)
  useEffect(() => {
    if (!handoffId || handoffId !== seenHandoff) return;
    if (!location.state?.cuisineSearch) return;
    const t = window.setTimeout(() => {
      navigate(location.pathname, { replace: true, state: {} });
    }, 0);
    return () => window.clearTimeout(t);
  }, [handoffId, seenHandoff, location.pathname, location.state, navigate]);

  return (
    <PageTransition>
      <Routes location={location}>
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
                searchHandoff={Boolean(handoffId || (originalQuery && output?.length))}
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
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/compare" element={<CompareStaples />} />
        <Route path="/compare/:familyId" element={<CompareStaples />} />
        <Route path="/plan" element={<DietPlan />} />
        <Route path="/tracker" element={<DailyTracker />} />
        <Route path="/recipe" element={<RecipeAnalyzer />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </PageTransition>
  );
}

function App() {
  const [foodName, setFoodName] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalQuery, setOriginalQuery] = useState(""); 

  return (
    <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
      <ReviewsProvider>
        <NavBar />
        <AppRoutes
          foodName={foodName}
          setFoodName={setFoodName}
          output={output}
          setOutput={setOutput}
          loading={loading}
          setLoading={setLoading}
          originalQuery={originalQuery}
          setOriginalQuery={setOriginalQuery}
        />
      </ReviewsProvider>
      </ToastProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
