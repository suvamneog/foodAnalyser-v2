"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../utils/AuthContext"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated === false && !["/", "/calculator", "/signup", "/scan", "/image", "/about", "/review"].includes(window.location.pathname)) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

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

  const AuthenticatedLinks = () => (
    <>
      <Link
        to="/logmeals"
        className="cursor-target text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
      >
        Log Meals
      </Link>
      <Link to="/history" className="cursor-target text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
        History
      </Link>
      <Link
        to="/addfoods"
        className="cursor-target text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
      >
        Add Food
      </Link>
    </>
  )

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <button onClick={handleLogoClick} className="cursor-target text-xl font-semibold text-gray-900">
              Food Analyser <span className="text-gray-400">×</span>
              <span className="text-gray-900"> fit</span>
            </button>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/about"
              className="cursor-target text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              to="/review"
              className="cursor-target text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Review
            </Link>
            <Link
              to="/calculator"
              className="cursor-target text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Calories Calculator
            </Link>
            <Link
              to="/scan"
              className="cursor-target text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
             Scan
            </Link>
            <Link
              to="/image"
              className="cursor-target text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
             Image
            </Link>
            {isAuthenticated && <AuthenticatedLinks />}
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/signup"
                    className="cursor-target text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    className="cursor-target bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="cursor-target bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 transition-all duration-300"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Slides from top to bottom */}
      <div className={`md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg z-40 transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
      }`}>
        <div className="px-4 py-4 space-y-1 border-t border-gray-200 max-h-[70vh] overflow-y-auto">
          {/* Common Links */}
          <button
            onClick={() => handleNavigation("/about")}
            className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            About
          </button>
          <button
            onClick={() => handleNavigation("/review")}
            className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Review
          </button>
          <button
            onClick={() => handleNavigation("/calculator")}
            className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Calories Calculator
          </button>
          <button
            onClick={() => handleNavigation("/scan")}
            className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Scan
          </button>
          <button
            onClick={() => handleNavigation("/image")}
            className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Image
          </button>

          {/* Authenticated Links */}
          {isAuthenticated && (
            <>
              <button
                onClick={() => handleNavigation("/logmeals")}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Log Meals
              </button>
              <button
                onClick={() => handleNavigation("/history")}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                History
              </button>
              <button
                onClick={() => handleNavigation("/addfoods")}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Add Food
              </button>
            </>
          )}

          {/* Auth Buttons */}
          <div className="pt-3 space-y-2 border-t border-gray-200 mt-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigation("/signup")}
                  className="block w-full text-center px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  Sign up
                </button>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="block w-full text-center bg-gray-900 text-white px-4 py-3 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
                >
                  Login
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="block w-full text-center bg-gray-900 text-white px-4 py-3 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
    </nav>
  )
}

export default Navbar