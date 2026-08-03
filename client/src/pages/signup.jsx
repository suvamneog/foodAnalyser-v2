/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../utils/AuthContext";
import { useToast } from "../components/ui/toast";
import { API_ENDPOINTS } from "../utils/apiConfig";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
} from "@tabler/icons-react";
import { User, Mail, Lock } from "lucide-react";

function SignupFormDemo() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, handleSocialLogin } = useAuth();
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
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH_SIGNUP, {
        name: user.name.trim(),
        email: user.email.trim(),
        password: user.password,
      });

      if (response.data.token) {
        login(response.data.token);
        toast({
          title: "Account created!",
          description: "You're signed in",
          variant: "success",
        });
        navigate("/");
      } else {
        toast({
          title: "Account created!",
          description: "Please log in with your credentials",
          variant: "success",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const message =
        error.response?.data?.message || "Something went wrong. Please try again.";
      if (error.response?.status === 400) {
        setErrors({ ...errors, email: message });
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast({
          title: "Registration failed",
          description: message,
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
      if (error?.message !== "Authentication cancelled") {
        toast({
          title: "Authentication failed",
          description:
            error?.message || `Could not sign up with ${provider}. Please try again.`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-ink-950 px-4 py-20">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 80% 8%, rgba(212,137,42,0.16), transparent 55%), radial-gradient(ellipse 50% 40% at 15% 25%, rgba(79,154,98,0.1), transparent 50%), radial-gradient(ellipse 40% 30% at 50% 100%, rgba(255,106,46,0.05), transparent 55%)",
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Track Indian meals, earn streaks, and sync your diet plan.
          </p>
        </div>

        <form className="relative space-y-4" onSubmit={handleSubmit}>
          <Field
            label="Your name"
            icon={<User className="h-4 w-4" />}
            error={errors.name}
          >
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Priya Sharma"
              className={`fa-input !pl-10 ${errors.name ? "!border-red-400/60" : ""}`}
              value={user.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Field>

          <Field
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email}
          >
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@email.com"
              className={`fa-input !pl-10 ${errors.email ? "!border-red-400/60" : ""}`}
              value={user.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Field>

          <Field
            label="Password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password}
          >
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              className={`fa-input !pl-10 !pr-10 ${errors.password ? "!border-red-400/60" : ""}`}
              value={user.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </Field>

          <button type="submit" className="fa-btn-chunky w-full" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Sign up →"}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-ink-900 px-2 text-white/40">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSocialSignup("github")}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/25 hover:text-white disabled:opacity-50"
            >
              <IconBrandGithub className="h-4 w-4" />
              GitHub
            </button>
            <button
              type="button"
              onClick={() => handleSocialSignup("google")}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/25 hover:text-white disabled:opacity-50"
            >
              <IconBrandGoogle className="h-4 w-4" />
              Google
            </button>
          </div>

          <p className="pt-1 text-center text-sm text-white/45">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-saffron-300 underline decoration-saffron-400/40 underline-offset-2 hover:text-saffron-200"
            >
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ label, icon, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-300">
          <IconAlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

export default SignupFormDemo;
