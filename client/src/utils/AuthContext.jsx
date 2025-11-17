/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, FRONTEND_URLS } from "../utils/apiConfig";

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
    return new Promise((resolve, reject) => {
      try {
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          API_ENDPOINTS.AUTH_PROVIDER(provider),
          `${provider}Login`,
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          throw new Error("Popup blocked. Please allow popups for this site.");
        }

        // Enhanced message handler
        const messageHandler = (event) => {
          console.log('🔍 Auth message received:', event.data, 'from:', event.origin);
          
          // Allow multiple origins (both frontend URLs)
          const allowedOrigins = [
            FRONTEND_URLS.DEVELOPMENT,
            FRONTEND_URLS.PRODUCTION,
            'https://foodanalyser.onrender.com' // Backend origin for fallback
          ];
          
          if (!allowedOrigins.includes(event.origin) && event.origin !== 'null') {
            console.log('Origin not in allowed list:', event.origin);
            return;
          }

          if (event.data.type === "social_auth_success") {
            console.log('✅ Auth success received');
            const { token } = event.data;
            if (token) {
              login(token);
              navigate("/");
              resolve(token);
            } else {
              console.error('No token in success message');
              reject(new Error('No token received'));
            }
            popup.close();
            window.removeEventListener("message", messageHandler);
          }

          if (event.data.type === "social_auth_failure") {
            console.error(`${provider} login failed:`, event.data.error);
            reject(new Error(event.data.error || `${provider} login failed`));
            popup.close();
            window.removeEventListener("message", messageHandler);
          }
        };

        window.addEventListener("message", messageHandler);

        // Check if popup closed without auth
        const popupCheck = setInterval(() => {
          if (popup.closed) {
            clearInterval(popupCheck);
            window.removeEventListener("message", messageHandler);
            if (!isAuthenticated) {
              reject(new Error('Authentication cancelled'));
            }
          }
        }, 1000);

      } catch (error) {
        console.error(`${provider} login failed:`, error);
        reject(error);
      }
    });
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