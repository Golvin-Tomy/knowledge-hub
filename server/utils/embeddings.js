import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values; // array of floats
  } catch (err) {
    console.error("Embedding error:", err);
    return null;
  }
};
