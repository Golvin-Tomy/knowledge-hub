import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
export const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

export async function summarizeText(content) {
  const result = await textModel.generateContent(
    `Summarize this document:\n${content}`
  );
  return result.response.text();
}

export async function generateTags(content) {
  const result = await textModel.generateContent(
    `Generate 5 short tags (comma separated) for this content:\n${content}`
  );
  return result.response
    .text()
    .split(",")
    .map((tag) => tag.trim());
}

export async function getEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}
