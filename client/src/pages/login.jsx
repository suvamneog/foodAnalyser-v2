import { useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../utils/AuthContext";
import { useToast } from "../components/ui/toast";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post("https://foodanalyser.onrender.com/api/auth/login", formData);
      if (response.data.token) {
        login(response.data.token);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
          variant: "success",
        });
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to log in";
      if (error.response?.status === 400) {
        setErrors({ 
          email: "Invalid email or password",
          password: "Invalid email or password"
        });
      } else {
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
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
        className="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] max-w-md mx-auto rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg bg-black relative z-10"
      >
        <Card className="w-full bg-black border-none">
          <div className="p-4 sm:p-6 bg-black">
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-sm sm:text-base text-neutral-400">Sign in to your Food Analyser account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-neutral-500" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    className={`pl-10 bg-neutral-800 border-neutral-700 text-white text-sm placeholder:text-neutral-500 focus-visible:ring-neutral-600 h-9 sm:h-10 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <div className="flex items-center mt-1 text-red-500 text-xs sm:text-sm">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-neutral-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className={`pl-10 pr-10 bg-neutral-800 border-neutral-700 text-white text-sm placeholder:text-neutral-500 focus-visible:ring-neutral-600 h-9 sm:h-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-400"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                  {errors.password && (
                    <div className="flex items-center mt-1 text-red-500 text-xs sm:text-sm">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 font-semibold h-9 sm:h-10 text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-neutral-900 mr-2" />
                    <span className="text-sm">Signing in...</span>
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="relative my-4 sm:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-800"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-2 bg-black text-neutral-500">
                    Don&apos;t have an account?
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-200 h-9 sm:h-10 text-sm"
                type="button"
                disabled={isLoading}
              >
                <Link to="/signup" className="w-full">Create an account</Link>
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default Login;