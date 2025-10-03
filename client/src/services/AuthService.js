import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Login user
export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

// Register user
export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

// Get current logged-in user
export const getMe = async () => {
  const res = await axios.get(`${API_URL}/me`, getAuthHeader());
  return res.data;
};
