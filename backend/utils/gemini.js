import dotenv from "dotenv";
dotenv.config();

const MODEL = "google/gemma-3-4b-it:free";

async function chatCompletion(prompt) {

  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

  console.log("Using OpenRouter key:", OPENROUTER_KEY ? "✅ " + OPENROUTER_KEY.slice(0, 15) + "..." : "❌ MISSING");

  if (!OPENROUTER_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in environment");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

// Embeddings via HuggingFace 
export async function getEmbedding(text) {
  const urls = [
    "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
    "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const embedding = Array.isArray(data[0]) ? data[0] : data;

      if (Array.isArray(embedding) && embedding.length > 10) {
        return embedding;
      }
    } catch (err) {
      continue;
    }
  }
  throw new Error("All HuggingFace embedding URLs failed");
}

// Text generation functions 
export async function summarizeText(content) {
  try {
    return await chatCompletion(
      `Summarize this document in 2-3 sentences:\n${content}`
    );
  } catch (err) {
    console.warn("Summarize error:", err.message);
    return "";
  }
}

export async function generateTags(content) {
  try {
    const text = await chatCompletion(
      `Generate 5 short tags (comma separated, lowercase, no hashtags) for this:\n${content}`
    );
    return text.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  } catch (err) {
    console.warn("Tags error:", err.message);
    return [];
  }
}

// textModel used in askQuestion and groupAskAI
export const textModel = {
  generateContent: async (prompt) => {
    const text = await chatCompletion(prompt);
    return {
      response: {
        text: () => text,
      },
    };
  },
};