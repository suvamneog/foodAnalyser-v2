"use client"

import { useState, useEffect } from "react"
import { Menu, X, Flame } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../utils/AuthContext"
import { levelFromXp, loadProgress, streakStatus } from "../utils/progression"
import { computeHealthScore } from "../utils/healthScore"
import ThemeToggle from "../components/ThemeToggle"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [progress, setProgress] = useState(() => loadProgress())
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const refresh = () => setProgress(loadProgress())
    refresh()
    window.addEventListener("focus", refresh)
    window.addEventListener("storage", refresh)
    const t = setInterval(refresh, 15000)
    return () => {
      window.removeEventListener("focus", refresh)
      window.removeEventListener("storage", refresh)
      clearInterval(t)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const streak = streakStatus(progress)
  const lvl = levelFromXp(progress.xp)
  const health = computeHealthScore()

  // Guest-friendly: discovery tools and unknown URLs (404) stay public.
  // Auth is only required for cloud sync actions, not for browsing pages.

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsOpen(false)
  }

  const handleLogoClick = () => {
    if (window.location.pathname === "/") {
      window.location.reload()
    } else {
      navigate("/")
    }
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  const streakChipClasses =
    streak.status === "active"
      ? "fa-sticker-ember text-ember-200"
      : streak.status === "at-risk"
      ? "fa-sticker-saffron text-saffron-100"
      : ""

  const healthChipClasses =
    health.total >= 75
      ? "fa-sticker-leaf text-mint-200"
      : health.total >= 50
      ? "fa-sticker-saffron text-saffron-100"
      : ""

  return (
    <nav
      className={`fa-nav fixed inset-x-0 top-0 z-50 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled ? "fa-nav-scrolled border-b" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <button
              onClick={handleLogoClick}
              className="cursor-target whitespace-nowrap font-display text-lg font-extrabold tracking-tight text-white sm:text-xl"
            >
              Food<span className="text-saffron-300">Analyser</span>
              <span className="mx-1 text-white/25">×</span>
              <span className="text-leaf-400">fit</span>
            </button>
          </div>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex lg:gap-2">
            {[
              ["/about", "About"],
              ["/plan", "Diet Plan"],
              ["/tracker", "Tracker"],
              ["/calculator", "Calculator"],
              ["/scan", "Scan"],
              ["/image", "Image"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="cursor-target rounded-full px-3 py-1.5 text-sm font-medium text-white/65 transition hover:bg-white/[0.06] hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right — theme + progression chips + auth */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Link
              to="/profile"
              className={`fa-chip-chunky ${streakChipClasses}`}
              title={`${streak.current}-day streak · Level ${lvl.level}`}
            >
              <Flame
                className={`h-3.5 w-3.5 ${
                  streak.status === "active" ? "fa-flame-pulse text-ember-300" : ""
                }`}
              />
              <span className="fa-num text-sm">{streak.current}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                d · Lv.{lvl.level}
              </span>
            </Link>
            <Link
              to="/profile"
              className={`fa-chip-chunky ${healthChipClasses}`}
              title={`Health Score ${health.total}/100 — ${health.band.label}`}
            >
              <span className="fa-num text-sm">{health.total}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                / 100
              </span>
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  className="cursor-target rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition hover:text-white"
                >
                  Sign up
                </Link>
                <Link to="/login" className="fa-btn-chunky !py-1.5 !px-4 text-sm">
                  Login
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="cursor-target rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-white/70 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Link
              to="/profile"
              className={`fa-chip-chunky ${streakChipClasses} !py-1 !px-2`}
              title={`${streak.current}-day streak · Level ${lvl.level}`}
            >
              <Flame
                className={`h-3 w-3 ${
                  streak.status === "active" ? "fa-flame-pulse text-ember-300" : ""
                }`}
              />
              <span className="fa-num text-xs">{streak.current}</span>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] p-2 text-white/80 transition hover:bg-white/[0.1]"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-x-0 top-14 z-40 transform border-b border-white/10 bg-ink-950/95 backdrop-blur-xl transition-all duration-300 sm:top-16 md:hidden ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 pointer-events-none opacity-0"
        }`}
      >
        <div className="max-h-[80vh] space-y-1 overflow-y-auto px-3 py-3">
          {/* Progression pills row */}
          <div className="mb-3 flex flex-wrap gap-2">
            <Link to="/profile" onClick={() => setIsOpen(false)} className={`fa-chip-chunky ${streakChipClasses}`}>
              <Flame className={`h-3.5 w-3.5 ${streak.status === "active" ? "fa-flame-pulse text-ember-300" : ""}`} />
              <span className="fa-num text-sm">{streak.current}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/60">day streak</span>
            </Link>
            <Link to="/profile" onClick={() => setIsOpen(false)} className={`fa-chip-chunky ${healthChipClasses}`}>
              <span className="fa-num text-sm">{health.total}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/60">score</span>
            </Link>
            <Link to="/profile" onClick={() => setIsOpen(false)} className="fa-chip-chunky fa-sticker-saffron">
              <span className="fa-num text-sm">Lv.{lvl.level}</span>
            </Link>
          </div>

          {[
            ["/about", "About"],
            ["/review", "Review"],
            ["/plan", "Diet Plan"],
            ["/tracker", "Daily Tracker"],
            ["/recipe", "Recipe Analyzer"],
            ["/calculator", "Calorie Calculator"],
            ["/scan", "Barcode Scan"],
            ["/image", "Image Recognition"],
            ["/profile", "Profile"],
          ].map(([to, label]) => (
            <button
              key={to}
              onClick={() => handleNavigation(to)}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/80 transition hover:bg-white/[0.05] hover:text-white"
            >
              {label}
            </button>
          ))}

          <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigation("/signup")}
                  className="block w-full rounded-lg border border-white/10 px-3 py-2.5 text-center text-sm font-medium text-white/80 transition hover:bg-white/[0.05]"
                >
                  Sign up
                </button>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="fa-btn-chunky w-full"
                >
                  Login
                </button>
              </>
            ) : (
              <button onClick={handleLogout} className="fa-btn-chunky w-full">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />
    </nav>
  )
}

export default Navbar
