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
  const res = await axios.get(API_URL, getAuthHeader());
  return res.data;
};

export const updateDoc = async (id, docData) => {
  const res = await axios.put(`${API_URL}/${id}`, docData, getAuthHeader());
  return res.data;
};

export const deleteDoc = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return res.data;
};

export const searchDoc = async (q) => {
  const res = await axios.get(
    `${API_URL}/search?q=${encodeURIComponent(q)}`,
    getAuthHeader()
  );
  return res.data;
};

export const semanticSearchDocs = async (query) => {
  const res = await axios.post(
    `${API_URL}/semantic-search`,
    { query },
    getAuthHeader()
  );
  return res.data;
};

export const generateSummaryAndTags = async (content) => {
  const res = await axios.post(
    `${API_URL}/generate-summary-tags`,
    { content },
    getAuthHeader()
  );
  return res.data;
};

export const askQuestion = async (question) => {
  const res = await axios.post(
    `${API_URL}/ask-question`,
    { question },
    getAuthHeader()
  );
  return res.data;
};
