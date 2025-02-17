/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage on initial render
    return localStorage.getItem("isAuthenticated") === "true"
  })

  useEffect(() => {
    // Persist auth state in localStorage
    localStorage.setItem("isAuthenticated", isAuthenticated)
  }, [isAuthenticated])

  const login = (token) => {
    setIsAuthenticated(true)
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("authToken", token); 
  }

    const logout = () => {
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    };

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}