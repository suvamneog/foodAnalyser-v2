/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("authToken") !== null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleSocialLogin = async (provider) => {
    try {
      // Open the OAuth provider's login page in a popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `http://localhost:3000/api/auth/${provider}`,
        `${provider}Login`,
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Listen for messages from the popup
      const messageHandler = (event) => {
        if (event.origin !== "http://localhost:3000") return;

        if (event.data.type === "social_auth_success") {
          const { token } = event.data;
          login(token);
          navigate("/");
       
        }

        if (event.data.type === "social_auth_failure") {
          console.error(`${provider} login failed:`, event.data.error);
          popup.close(); // Close the popup on failure
        }

        // Clean up the event listener
        window.removeEventListener("message", messageHandler);
      };

      window.addEventListener("message", messageHandler);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      throw error;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, handleSocialLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};