/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, FRONTEND_URLS } from "../utils/apiConfig";
import { pullFromCloud } from "./cloudSync";

const AuthContext = createContext();

const ALLOWED_ORIGINS = new Set([
  FRONTEND_URLS.DEVELOPMENT,
  FRONTEND_URLS.PRODUCTION,
  FRONTEND_URLS.BASE,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://foodanalyser.onrender.com",
  "https://foodanalyserr.vercel.app",
]);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("authToken") !== null
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const authSuccessRef = useRef(false);

  useEffect(() => {
    const hasToken = localStorage.getItem("authToken") !== null;
    setIsAuthenticated(hasToken);
    setIsLoading(false);
    if (hasToken) {
      pullFromCloud().catch(() => {});
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
    authSuccessRef.current = true;
    pullFromCloud().catch(() => {});
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    authSuccessRef.current = false;
    navigate("/login");
  };

  const handleSocialLogin = (provider) => {
    return new Promise((resolve, reject) => {
      authSuccessRef.current = false;
      let settled = false;

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      let popup;
      try {
        popup = window.open(
          API_ENDPOINTS.AUTH_PROVIDER(provider),
          `${provider}Login`,
          `width=${width},height=${height},left=${left},top=${top}`
        );
      } catch (err) {
        reject(new Error("Could not open authentication window."));
        return;
      }

      if (!popup) {
        reject(new Error("Popup blocked. Please allow popups for this site."));
        return;
      }

      const cleanup = () => {
        window.removeEventListener("message", messageHandler);
        clearInterval(popupCheck);
      };

      const settle = (fn, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        fn(value);
      };

      const messageHandler = (event) => {
        const originOk =
          ALLOWED_ORIGINS.has(event.origin) ||
          event.origin === window.location.origin ||
          event.origin === "null";

        if (!originOk) return;
        if (!event.data || typeof event.data !== "object") return;

        if (event.data.type === "social_auth_success") {
          const { token } = event.data;
          if (!token) {
            settle(reject, new Error("No token received"));
            return;
          }
          login(token);
          try {
            popup.close();
          } catch {
            /* COOP may block close */
          }
          navigate("/");
          settle(resolve, token);
          return;
        }

        if (event.data.type === "social_auth_failure") {
          try {
            popup.close();
          } catch {
            /* ignore */
          }
          settle(reject, new Error(event.data.error || `${provider} login failed`));
        }
      };

      window.addEventListener("message", messageHandler);

      // Poll carefully — COOP can throw when reading popup.closed cross-origin
      const popupCheck = setInterval(() => {
        let closed = false;
        try {
          closed = popup.closed;
        } catch {
          // COOP blocked closed check; keep waiting for postMessage
          return;
        }

        if (closed) {
          if (authSuccessRef.current || settled) {
            settle(resolve, localStorage.getItem("authToken"));
          } else {
            settle(reject, new Error("Authentication cancelled"));
          }
        }
      }, 800);

      // Safety timeout
      setTimeout(() => {
        if (!settled) {
          settle(reject, new Error("Authentication timed out"));
        }
      }, 120000);
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-white/60">
        Loading...
      </div>
    );
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
