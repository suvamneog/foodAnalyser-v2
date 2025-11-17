// src/utils/apiConfig.js

// Determine the base URL based on environment
const getBaseURL = () => {
  // If we're in development and using localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001'; // Your backend port (usually 3001, 5000, or 8000)
  }
  // For production (your Render backend URL)
  return 'https://foodanalyser.onrender.com';
};

const API_BASE_URL = getBaseURL();

// Frontend URL for OAuth callbacks
const getFrontendURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000'; // Your frontend port
  }
  return 'https://foodanalyserr.vercel.app';
};

const FRONTEND_BASE_URL = getFrontendURL();

export const API_ENDPOINTS = {
  // Food endpoints
  FOOD_SEARCH: `${API_BASE_URL}/api/food/search`,
  FOOD_HISTORY: `${API_BASE_URL}/api/food/history`,
  FOOD_HISTORY_ITEM: (id) => `${API_BASE_URL}/api/food/history/${id}`,
  FOOD_HISTORY_BULK: `${API_BASE_URL}/api/food/history/bulk`,
  FOOD_HISTORY_CLEAR: `${API_BASE_URL}/api/food/history/clear`,
  
  // Auth endpoints - POINT TO BACKEND
  AUTH_PROVIDER: (provider) => `${API_BASE_URL}/api/auth/${provider}`,
  
  // Scan endpoints
  SCAN_UPLOAD: `${API_BASE_URL}/api/scan/upload`,
  SCAN_PRODUCT: (barcode) => `${API_BASE_URL}/api/scan/product/${barcode}`,
  SCAN_HEALTH_SCORE: `${API_BASE_URL}/api/scan/health-score`,
};

export const FRONTEND_URLS = {
  BASE: FRONTEND_BASE_URL,
  DEVELOPMENT: 'http://localhost:3000',
  PRODUCTION: 'https://foodanalyserr.vercel.app'
};

export const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export default API_BASE_URL;