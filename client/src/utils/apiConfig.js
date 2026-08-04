// Single API base — prefer VITE_API_URL, else local / production defaults.

const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const DEFAULT_API = isLocalHost
  ? "http://localhost:3001"
  : "https://foodanalyser.onrender.com";

const DEFAULT_FRONTEND = isLocalHost
  ? `${window.location.protocol}//${window.location.host}`
  : "https://foodanalyserr.vercel.app";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  DEFAULT_API
).replace(/\/$/, "");

export const FRONTEND_BASE_URL = (
  import.meta.env.VITE_FRONTEND_URL ||
  DEFAULT_FRONTEND
).replace(/\/$/, "");

export const API_ENDPOINTS = {
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  AUTH_PROVIDER: (provider) => `${API_BASE_URL}/api/auth/${provider}`,

  FOOD_SEARCH: `${API_BASE_URL}/api/food/search`,
  FOOD_SUGGEST: `${API_BASE_URL}/api/food/suggest`,
  FOOD_BY_ID: `${API_BASE_URL}/api/food/by-id`,
  FOOD_CATEGORY: (id) => `${API_BASE_URL}/api/food/category/${encodeURIComponent(id)}`,
  FOOD_CATEGORIES: `${API_BASE_URL}/api/food/categories`,

  SCAN_UPLOAD: `${API_BASE_URL}/api/scan/upload`,
  SCAN_PRODUCT: (barcode) => `${API_BASE_URL}/api/scan/product/${barcode}`,
  SCAN_HEALTH_SCORE: `${API_BASE_URL}/api/scan/health-score`,

  IMAGE_ANALYZE: `${API_BASE_URL}/api/image/analyzefood`,
  IMAGE_QUICK: `${API_BASE_URL}/api/image/quick-score`,

  REVIEWS: `${API_BASE_URL}/api/reviews`,
  SYNC: `${API_BASE_URL}/api/sync`,
};

export const FRONTEND_URLS = {
  BASE: FRONTEND_BASE_URL,
  DEVELOPMENT: "http://localhost:5173",
  PRODUCTION: "https://foodanalyserr.vercel.app",
};

export const isDevelopment = isLocalHost;

export default API_BASE_URL;
