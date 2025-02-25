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
import  Text from "./pages/Text"
import Navbar from "./pages/navBar"

function App() {
  const [foodName, setFoodName] = useState("")
  const [output, setOutput] = useState("")


  return (
    <AuthProvider>
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
        <Route path="/signup" element={<SignupFormDemo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login" element={<Text/>} />
        <Route path="/calculator" element={<CalorieCalculator />} />
        <Route path="/logmeals" element={<LogMeals />} />
        <Route path="/history" element={<History />} />
        <Route path="/addfoods" element={<AddFood />} />
      </Routes>
    </AuthProvider>
  )
}

export default App