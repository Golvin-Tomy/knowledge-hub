import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSummary = async (content) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Summarize the following document in 3-4 sentences:\n\n${content}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini summary error:", err);
    return null;
  }
};

export const generateTags = async (content) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate 5 short keyword-style tags for this document. Return as a comma-separated list:\n\n${content}`;
    const result = await model.generateContent(prompt);
    const tagsText = result.response.text();
    return tagsText.split(",").map((tag) => tag.trim());
  } catch (err) {
    console.error("Gemini tags error:", err);
    return [];
  }
};
