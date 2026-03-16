export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  // Store role separately for easy access
  if (user && user.role) {
    localStorage.setItem("role", user.role);
  }
};

export const getUser = () => {
  const s = localStorage.getItem("user");
  return s ? JSON.parse(s) : null;
};

export const getRole = () => {
  return localStorage.getItem("role") || null;
};

export const logout = () => {
  // Clear all authentication data
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
};
