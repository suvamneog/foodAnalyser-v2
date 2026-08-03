import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../utils/AuthContext";
import { useToast } from "../components/ui/toast";
import { API_ENDPOINTS } from "../utils/apiConfig";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";

function Login() {
  const navigate = useNavigate();
  const { login, handleSocialLogin } = useAuth();
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
      const response = await axios.post(API_ENDPOINTS.AUTH_LOGIN, {
        email: formData.email.trim(),
        password: formData.password,
      });

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
      setErrors({
        form: errorMessage,
        email: error.response?.status === 400 ? errorMessage : null,
        password: error.response?.status === 400 ? errorMessage : null,
      });
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    try {
      setIsLoading(true);
      await handleSocialLogin(provider);
      toast({
        title: "Welcome!",
        description: `Signed in with ${provider}`,
        variant: "success",
      });
    } catch (error) {
      if (error?.message !== "Authentication cancelled") {
        toast({
          title: "Authentication failed",
          description: error?.message || `Could not sign in with ${provider}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.form) {
      setErrors((prev) => ({ ...prev, [name]: null, form: null }));
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-ink-950 px-4 py-20">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(212,137,42,0.16), transparent 55%), radial-gradient(ellipse 50% 40% at 85% 20%, rgba(79,154,98,0.1), transparent 50%), radial-gradient(ellipse 40% 30% at 50% 100%, rgba(140,88,216,0.06), transparent 55%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fa-sticker fa-dots relative z-10 w-full max-w-md p-6 sm:p-8"
      >
        <div className="relative mb-7 text-center">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-saffron-300/90">
            FoodAnalyser × fit
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Sign in to sync streaks, meals and progress across devices.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                className={`fa-input !pl-10 ${errors.email ? "!border-red-400/60" : ""}`}
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-300">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Your password"
                className={`fa-input !pl-10 !pr-10 ${errors.password ? "!border-red-400/60" : ""}`}
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-300">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="fa-btn-chunky w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSocial("github")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/25 hover:text-white disabled:opacity-50"
            >
              <IconBrandGithub className="h-4 w-4" />
              GitHub
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSocial("google")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/25 hover:text-white disabled:opacity-50"
            >
              <IconBrandGoogle className="h-4 w-4" />
              Google
            </button>
          </div>

          <p className="pt-2 text-center text-sm text-white/45">
            New here?{" "}
            <Link
              to="/signup"
              className="font-semibold text-saffron-300 underline decoration-saffron-400/40 underline-offset-2 hover:text-saffron-200"
            >
              Create an account
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
