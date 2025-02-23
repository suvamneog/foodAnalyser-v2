/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion } from "framer-motion";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { cn } from "../utils/cn";
import axios from "axios";
import { useAuth } from "../utils/AuthContext";
import { useToast } from "../components/ui/toast";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconEye,
  IconEyeOff,
  IconAlertCircle
} from "@tabler/icons-react";

function SignupFormDemo() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleSocialLogin } = useAuth();
  const [user, setUser] = useState({ name: "", email: "", password: "" });

  const validateForm = () => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = "Name is required";
    if (!user.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!user.password) {
      newErrors.password = "Password is required";
    } else if (user.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    if (errors[name]) {
      setErrors({...errors, [name]: null});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await axios.post("http://localhost:3000/api/auth/signup", user);
      toast({
        title: "Account created!",
        description: "Please log in with your credentials",
        variant: "success",
      });
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response?.status === 400) {
        setErrors({...errors, email: "Email already exists"});
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast({
          title: "Registration failed",
          description: error.response?.data?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    try {
      setIsLoading(true);
      await handleSocialLogin(provider);
      toast({
        title: "Success!",
        description: `Signed up with ${provider}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: `Could not sign up with ${provider}. Please try again.`,
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setIsLoading(false);
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
        className="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] max-w-md mx-auto rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg bg-white dark:bg-black relative z-10"
      >
        <h2 className="font-bold text-lg sm:text-xl text-neutral-800 dark:text-neutral-200">
          Welcome to Food Analyser x fit
        </h2>
        <p className="text-neutral-600 text-xs sm:text-sm max-w-sm mt-2 dark:text-neutral-300">
          Sign up here
        </p>

        <form className="my-6 sm:my-8" onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4"
          >
            <LabelInputContainer>
              <Label htmlFor="name" className="text-sm">Your name</Label>
              <Input 
                id="name" 
                className={`text-white text-sm ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`} 
                placeholder="Tyler" 
                type="text" 
                value={user.name} 
                onChange={handleChange} 
                name="name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <IconAlertCircle className="h-3 w-3 mr-1" />
                  {errors.name}
                </p>
              )}
            </LabelInputContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mb-4"
          >
            <LabelInputContainer>
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <Input 
                id="email" 
                className={`text-white text-sm ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`} 
                placeholder="youremail@gmail.com" 
                type="email" 
                value={user.email} 
                onChange={handleChange} 
                name="email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <IconAlertCircle className="h-3 w-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </LabelInputContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mb-4"
          >
            <LabelInputContainer>
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  className={`text-white text-sm pr-10 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={user.password}
                  onChange={handleChange}
                  name="password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-white"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex="-1"
                >
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <IconAlertCircle className="h-3 w-3 mr-1" />
                  {errors.password}
                </p>
              )}
            </LabelInputContainer>
          </motion.div>

          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className={`bg-gradient-to-br from-black to-neutral-600 dark:from-zinc-900 dark:to-zinc-900 block w-full text-white rounded-md h-9 sm:h-10 font-medium shadow-md text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span> : 
              "Sign up →"
            }
          </motion.button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-6 sm:my-8 h-[1px] w-full" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-9 sm:h-10 font-medium shadow-md bg-gray-50 dark:bg-zinc-900"
              type="button"
              onClick={() => handleSocialSignup('github')}
              disabled={isLoading}
            >
              <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm">
                Continue with GitHub
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-9 sm:h-10 font-medium shadow-md bg-gray-50 dark:bg-zinc-900"
              type="button"
              onClick={() => handleSocialSignup('google')}
              disabled={isLoading}
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm">
                Continue with Google
              </span>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

const LabelInputContainer = ({ children, className }) => {
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};

export default SignupFormDemo;