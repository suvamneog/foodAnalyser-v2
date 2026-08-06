/**
 * Abuse protection for costly / upload-heavy endpoints.
 * express-rate-limit is already a project dependency.
 */
const rateLimit = require("express-rate-limit");

const jsonHandler = (message) => (_req, res) => {
  res.status(429).json({
    error: message,
    retryAfterMinutes: Math.ceil((_req.rateLimit?.resetTime
      ? (_req.rateLimit.resetTime - Date.now()) / 60000
      : 60)),
  });
};

/** OpenAI-backed full image analysis — strict */
const imageAnalyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler(
    "Too many image analyses from this network. Limit is 10 per hour. Try again later."
  ),
});

/** Quick image score — slightly higher cap */
const imageQuickLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler(
    "Too many quick scans from this network. Limit is 20 per hour. Try again later."
  ),
});

/** Barcode image upload */
const scanUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler(
    "Too many barcode uploads from this network. Limit is 30 per hour. Try again later."
  ),
});

/** Product / health-score lookups */
const scanLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler(
    "Too many product lookups. Please wait a few minutes and try again."
  ),
});

/** General food search / API — light shield */
const apiSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler(
    "Too many API requests. Please wait a few minutes and try again."
  ),
});

module.exports = {
  imageAnalyzeLimiter,
  imageQuickLimiter,
  scanUploadLimiter,
  scanLookupLimiter,
  apiSearchLimiter,
};
