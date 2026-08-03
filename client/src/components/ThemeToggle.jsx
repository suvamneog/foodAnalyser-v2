import { Moon, Sun } from "lucide-react"
import { useTheme } from "../utils/ThemeContext"

/**
 * Compact sun/moon toggle for the navbar.
 * Cycles dark ↔ light (explicit choice, not system).
 */
export default function ThemeToggle({ className = "" }) {
  const { resolved, toggleTheme } = useTheme()
  const isDark = resolved === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${className} ${
        isDark
          ? "border-white/15 bg-white/[0.06] text-saffron-300 hover:border-saffron-400/40 hover:bg-white/[0.1]"
          : "border-black/10 bg-black/[0.04] text-saffron-600 hover:border-saffron-500/35 hover:bg-black/[0.07]"
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark
            ? "scale-50 rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 -rotate-90 opacity-0"
        }`}
      />
    </button>
  )
}
