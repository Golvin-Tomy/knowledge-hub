import axios from "axios";

const API_URL = "http://localhost:5000/api/docs";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const createDoc = async (docData) => {
  const res = await axios.post(API_URL, docData, getAuthHeader());
  return res.data;
};

export const getDocs = async () => {
  try {
    const res = await axios.get(API_URL, getAuthHeader());
    return res.data;
  } catch (err) {
    console.error("Error fetching docs:", err.response?.data || err.message);
    throw err;
  }
};

export const searchDoc = async (query) => {
  try {
    const res = await axios.get(`${API_URL}/search?q=${query}`, getAuthHeader());
    return res.data;
  } catch (err) {
    console.error("Error searching docs:", err.response?.data || err.message);
    throw err;
  }
};

export const updateDoc = async (id, docData) => {
  const res = await axios.put(`${API_URL}/${id}`, docData, getAuthHeader());
  return res.data;
};

export const deleteDoc = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return res.data;
};
