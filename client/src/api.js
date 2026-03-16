// client/src/services/api.js
import axios from "axios";
import { API_BASE_URL } from "./config/apiConfig";

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // assuming you store JWT in localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // If FormData is being sent, let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized: maybe redirect to login
      console.error("Unauthorized! Redirecting to login...");
      // window.location.href = "/login"; // uncomment if needed
    }
    return Promise.reject(error);
  }
);

export default api;
