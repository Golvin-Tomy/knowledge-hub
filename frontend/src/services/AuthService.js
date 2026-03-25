import API from "./api";

// Login user
export const login = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

// Register user
export const register = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

// Get current logged-in user
export const getMe = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};