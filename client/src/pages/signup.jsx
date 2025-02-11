/* eslint-disable react/prop-types */
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { cn } from "../utils/cn";
import {
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react";

import { IconEye, IconEyeOff } from "@tabler/icons-react";

function SignupFormDemo() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative bg-neutral-900">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <StarsBackground />
        <ShootingStars />
      </div>

      {/* Animated Form Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full mx-auto rounded-2xl p-8 shadow-lg bg-white dark:bg-black mt-20 relative z-10"
      >
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          Welcome to Aceternity
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Login to aceternity if you can because we don&apos;t have a login flow yet
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4"
          >
            <LabelInputContainer>
              <Label htmlFor="firstname">Your name</Label>
              <Input id="firstname" className="text-white" placeholder="Tyler" type="text" />
            </LabelInputContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mb-4"
          >
            <LabelInputContainer>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" className="text-white" placeholder="youremail@gmail.com" type="email" />
            </LabelInputContainer>
          </motion.div>

          {/* Password Input with Toggle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mb-4"
          >
            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  className="text-white pr-10"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-white"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                </button>
              </div>
            </LabelInputContainer>
          </motion.div>

          {/* Animated Signup Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-black to-neutral-600 dark:from-zinc-900 dark:to-zinc-900 block w-full text-white rounded-md h-10 font-medium shadow-md"
            type="submit"
          >
            Sign up &rarr;
          </motion.button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          {/* Animated Social Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-md bg-gray-50 dark:bg-zinc-900"
              type="button"
            >
              <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                GitHub
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-md bg-gray-50 dark:bg-zinc-900"
              type="button"
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                Google
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