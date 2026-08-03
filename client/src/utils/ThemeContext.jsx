import { createContext, useContext, useEffect, useState } from "react"

const STORAGE_KEY = "fa-theme"
const ThemeContext = createContext({
  theme: "dark",
  resolved: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
})

function getSystemTheme() {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {
    /* ignore */
  }
  return "system"
}

function applyTheme(resolved) {
  const root = document.documentElement
  root.setAttribute("data-theme", resolved)
  root.style.colorScheme = resolved
  root.classList.toggle("dark", resolved === "dark")
  root.classList.toggle("light", resolved === "light")
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStoredTheme())
  const [resolved, setResolved] = useState(() => {
    const stored = readStoredTheme()
    return stored === "system" ? getSystemTheme() : stored
  })

  useEffect(() => {
    const next = theme === "system" ? getSystemTheme() : theme
    setResolved(next)
    applyTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    if (theme !== "system") return undefined
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const onChange = () => {
      const next = getSystemTheme()
      setResolved(next)
      applyTheme(next)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme])

  const setTheme = (value) => {
    if (value === "light" || value === "dark" || value === "system") {
      setThemeState(value)
    }
  }

  const toggleTheme = () => {
    setThemeState((prev) => {
      const current = prev === "system" ? getSystemTheme() : prev
      return current === "dark" ? "light" : "dark"
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
