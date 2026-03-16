const DEFAULT_API_ORIGIN = "https://safeher-3.onrender.com";

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
