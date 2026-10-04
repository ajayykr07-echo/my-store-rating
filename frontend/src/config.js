// Single point of configuration for the backend base URL and environment settings

const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000/api";

const cleanUrl = rawBaseUrl.trim().replace(/\/+$/, "");

/**
 * Base API URL (guaranteed to end with /api without trailing slash)
 * e.g., "http://localhost:3000/api" or "https://api.yourdomain.com/api"
 */
export const API_BASE_URL = cleanUrl.endsWith("/api")
  ? cleanUrl
  : `${cleanUrl}/api`;

/**
 * Root Backend URL (without /api)
 * e.g., "http://localhost:3000" or "https://api.yourdomain.com"
 */
export const BACKEND_URL = API_BASE_URL.replace(/\/api$/, "");

export default {
  API_BASE_URL,
  BACKEND_URL,
};
