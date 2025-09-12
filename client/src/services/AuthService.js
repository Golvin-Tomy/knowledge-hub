import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Get current logged-in user
export const getMe = async () => {
  const res = await axios.get(`${API_URL}/me`, getAuthHeader());
  return res.data;
};
