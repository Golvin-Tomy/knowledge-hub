import Document from "../models/docModel.js";
import { getEmbedding } from "../utils/embeddings.js";

export const textSearch = async (req, res) => {
  try {
    const { query } = req.query;
    const results = await Document.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.query;
    const queryEmbedding = await getEmbedding(query);

    const docs = await Document.find();

    const cosineSim = (a, b) => {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dot / (normA * normB);
    };

    const results = docs
      .map((doc) => ({
        doc,
        score: cosineSim(queryEmbedding, doc.embedding),
      }))
      .sort((a, b) => b.score - a.score);

    res.json(results.map((r) => ({ ...r.doc._doc, similarity: r.score })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
