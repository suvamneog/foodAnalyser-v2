import { useState, useEffect } from "react"
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { AuthProvider } from "./utils/AuthContext"
import { ThemeProvider } from "./utils/ThemeContext"
import { ReviewsProvider } from "./utils/ReviewsContext"
import { ToastProvider } from "./components/ui/toast"
import { PageTransition } from "./components/PageTransition"
import ShootingStarsAndStarsBackgroundDemo from "./pages/background"
import SignupFormDemo from "./pages/signup"
import Login from "./pages/login"
import CalorieCalculator from "./pages/Calculator"
import Home from "./pages/home"
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
import NotFoundPage from "./components/ui/page-not-found"
import { API_BASE_URL } from "./utils/apiConfig"

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

  // Clear one-shot router state after paint (Home may still read it for scroll/preset).
  // preventScrollReset: clearing state must not yank the viewport back to an old "/" scroll.
  useEffect(() => {
    if (!handoffId || handoffId !== seenHandoff) return;
    if (!location.state?.cuisineSearch) return;
    const t = window.setTimeout(() => {
      navigate(location.pathname, {
        replace: true,
        state: {},
        preventScrollReset: true,
      });
      // Beat any late browser scroll restoration after the replace
      const pin = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document
          .getElementById("search-results")
          ?.scrollIntoView({ behavior: "auto", block: "start" });
      };
      pin();
      requestAnimationFrame(pin);
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
        <Route path="/scan" element={<BarcodeScanner />} />
        <Route path="/image" element={<FoodScanner />} />
        <Route path="/calculator" element={<CalorieCalculator />} />
        <Route path="/logmeals" element={<Navigate to="/tracker" replace />} />
        <Route path="/text" element={<Navigate to="/" replace />} />
        <Route path="/addfoods" element={<Navigate to="/" replace />} />
        <Route path="/history" element={<Navigate to="/" replace />} />
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageTransition>
  );
}

function App() {
  const [foodName, setFoodName] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalQuery, setOriginalQuery] = useState("");

  // Warm up the backend as soon as the site opens. Render free-tier services
  // sleep after ~15 min idle, so the first real request can take 20-30s.
  // Pinging /health here starts the wake while the user reads the page —
  // by the time they hit search it's usually already up. Fire-and-forget.
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        credentials: "omit",
      }).catch(() => {
        /* silent — this is just a warm-up */
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

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
