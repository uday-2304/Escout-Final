import axios from "axios";

// NOTE: VITE_API_BASE_URL should point to the backend root (e.g. http://localhost:8000)
// API endpoints should include their full route (e.g. /api/auth/login, /api/dashboard/videos).
// Prefer local backend during development; fall back to production if env var is not set.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
