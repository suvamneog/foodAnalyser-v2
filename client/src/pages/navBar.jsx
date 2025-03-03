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
    if (isAuthenticated === false && !["/", "/calculator", "/signup", "/scan", "/image"].includes(window.location.pathname)) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleLogoClick = () => {
    if (window.location.pathname === "/") {
      // If already on the home page, refresh the page
      window.location.reload()
    } else {
      // Otherwise, navigate to the home page without refreshing
      navigate("/")
    }
  }

  const AuthenticatedLinks = () => (
    <>
      <Link
        to="/logmeals"
        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
      >
        Log Meals
      </Link>
      <Link to="/history" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
        History
      </Link>
      <Link
        to="/addfoods"
        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
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
            <button onClick={handleLogoClick} className="text-xl font-semibold text-gray-900">
              Food Analyser <span className="text-gray-400">×</span>
              <span className="text-gray-900"> fit</span>
            </button>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/calculator"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Calories Calculator
            </Link>
            <Link
              to="/scan"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
             Scan
            </Link>
            <Link
              to="/image"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
             Image
            </Link>
            {isAuthenticated && <AuthenticatedLinks />}
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/signup"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link
              to="/calculator"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Calories Calculator
            </Link>
            <Link
              to="/scan"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
             Scan
            </Link>
            <Link
              to="/image"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
             Image
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/logmeals"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Log Meals
                </Link>
                <Link
                  to="/history"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  History
                </Link>
                <Link
                  to="/addfoods"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Add Food
                </Link>
              </>
            )}
            <div className="px-3 py-2 space-y-1">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full text-center bg-gray-900 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="block w-full text-center bg-gray-900 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar