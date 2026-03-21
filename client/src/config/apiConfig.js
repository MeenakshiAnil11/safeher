const DEFAULT_LOCAL_ORIGIN = "http://localhost:5000";
const DEFAULT_PROD_ORIGIN = "https://safeher-3.onrender.com";

const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const DEFAULT_API_ORIGIN = isLocalHost ? DEFAULT_LOCAL_ORIGIN : DEFAULT_PROD_ORIGIN;

const rawApiUrl = (process.env.REACT_APP_API_URL || "").trim();
const normalizedApiUrl = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, "")
  : `${DEFAULT_API_ORIGIN}/api`;

export const API_BASE_URL = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export const resolveApiPath = (path = "") => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
};
