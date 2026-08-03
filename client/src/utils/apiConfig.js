// src/utils/apiConfig.js

const getBaseURL = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3001";
  }
  return "https://foodanalyser.onrender.com";
};

const API_BASE_URL = getBaseURL();

const getFrontendURL = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return "https://foodanalyserr.vercel.app";
};

const FRONTEND_BASE_URL = getFrontendURL();

export const API_ENDPOINTS = {
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  // OAuth must hit the host that owns the registered callback URLs
  AUTH_PROVIDER: (provider) =>
    `https://foodanalyser.onrender.com/api/auth/${provider}`,

  FOOD_SEARCH: `${API_BASE_URL}/api/food/search`,
  FOOD_SUGGEST: `${API_BASE_URL}/api/food/suggest`,
  FOOD_BY_ID: `${API_BASE_URL}/api/food/by-id`,
  FOOD_HISTORY: `${API_BASE_URL}/api/food/history`,
  FOOD_HISTORY_ITEM: (id) => `${API_BASE_URL}/api/food/history/${id}`,
  FOOD_HISTORY_BULK: `${API_BASE_URL}/api/food/history/bulk`,
  FOOD_HISTORY_CLEAR: `${API_BASE_URL}/api/food/history/clear`,

  SCAN_UPLOAD: `${API_BASE_URL}/api/scan/upload`,
  SCAN_PRODUCT: (barcode) => `${API_BASE_URL}/api/scan/product/${barcode}`,
  SCAN_HEALTH_SCORE: `${API_BASE_URL}/api/scan/health-score`,

  IMAGE_ANALYZE: `${API_BASE_URL}/api/image/analyzefood`,
  IMAGE_QUICK: `${API_BASE_URL}/api/image/quick-score`,

  SYNC: `${API_BASE_URL}/api/sync`,
};

export const FRONTEND_URLS = {
  BASE: FRONTEND_BASE_URL,
  DEVELOPMENT: "http://localhost:5173",
  PRODUCTION: "https://foodanalyserr.vercel.app",
};

export const isDevelopment =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export default API_BASE_URL;
