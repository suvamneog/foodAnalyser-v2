import { useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext"
function Login() {
    const navigate = useNavigate(); 
      const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", formData);
      login(response.data);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Error signing up");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative bg-neutral-900">
              <div className="absolute inset-0 pointer-events-none">
                <StarsBackground />
                <ShootingStars />
              </div>
              <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full mx-auto rounded-2xl p-8 shadow-lg bg-white dark:bg-black mt-20 relative z-10"
      >
  <Card className="w-full max-w-md bg-black border-none ">
        <div className="p-6 sm:p-8 bg-black ">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-neutral-400">Sign in to your Food Analyser account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-600"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pl-10 pr-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-600"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="link"
                  className="text-sm text-neutral-400 hover:text-neutral-300 p-0"
                >
                  Forgot password?
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 font-semibold"
            >
              Sign in
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-900 text-neutral-500">
                  Dont have an account?
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-200"
            ><Link to="/signup">
              Create an account
              </Link>
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
    </div>
  );
}
export default Login