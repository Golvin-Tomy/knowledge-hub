import Doc from "../models/docModel.js";
import {
  summarizeText,
  generateTags,
  getEmbedding,
  textModel,
} from "../utils/gemini.js";

export const createDoc = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    let summary = "",
      tags = [],
      embedding = [];
    try {
      summary = (await summarizeText(content)) || "";
    } catch (err) {
      console.warn("Error summarizing text:", err.message);
    }
    try {
      tags = (await generateTags(content)) || [];
    } catch (err) {
      console.warn("Error generating tags:", err.message);
    }
    try {
      embedding = (await getEmbedding(content)) || [];
    } catch (err) {
      console.warn("Error generating embedding:", err.message);
    }

    const newDoc = await Doc.create({
      title,
      content,
      summary,
      embedding,
      tags,
      createdBy: req.user._id,
    });

    res.status(201).json(newDoc);
  } catch (error) {
    console.error("Error creating doc:", error);
    res.status(500).json({ message: "Error creating doc" });
  }
};

export const getDocs = async (req, res) => {
  try {
    const docs = await Doc.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(docs);
  } catch (error) {
    console.error("Error fetching docs:", error);
    res.status(500).json({ message: "Error fetching docs" });
  }
};

export const updateDoc = async (req, res) => {
  try {
    const { title, content } = req.body;

    let summary = "",
      tags = [],
      embedding = [];
    try {
      summary = (await summarizeText(content)) || "";
    } catch (err) {
      console.warn("Error summarizing text:", err.message);
    }
    try {
      tags = (await generateTags(content)) || [];
    } catch (err) {
      console.warn("Error generating tags:", err.message);
    }
    try {
      embedding = (await getEmbedding(content)) || [];
    } catch (err) {
      console.warn("Error generating embedding:", err.message);
    }

    const updatedDoc = await Doc.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { title, content, summary, tags, embedding },
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: "Doc not found or unauthorized" });
    }

    res.json(updatedDoc);
  } catch (error) {
    console.error("Error updating doc:", error);
    res.status(500).json({ message: "Error updating doc" });
  }
};

export const deleteDoc = async (req, res) => {
  try {
    const deletedDoc = await Doc.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!deletedDoc) {
      return res.status(404).json({ message: "Doc not found or unauthorized" });
    }

    res.json({ message: "Doc deleted successfully" });
  } catch (error) {
    console.error("Error deleting doc:", error);
    res.status(500).json({ message: "Error deleting doc" });
  }
};

export const searchDocs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ message: "Invalid search query" });
    }

    const docs = await Doc.find({
      createdBy: req.user._id,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    });

    res.json(docs);
  } catch (error) {
    console.error("Error searching docs:", error);
    res.status(500).json({ message: "Error searching docs" });
  }
};

export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query is required" });
    }

    const queryEmbedding = await getEmbedding(query);

    console.log("🔎 Query:", query);
    console.log("📊 Embedding length:", queryEmbedding.length);

    const docs = await Doc.aggregate([
      {
        $vectorSearch: {
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 10,
          limit: 5,
        },
      },
    ]);

    res.json(docs);
  } catch (error) {
    console.error("❌ Error in semantic search:", error);
    res
      .status(500)
      .json({ message: "Error in semantic search", error: error.message });
  }
};

export const askQuestion = async (req, res) => {
  try {
    console.log("Incoming question request:", req.body);

    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const result = await textModel.generateContent(
      `You are a helpful assistant. Answer this user question clearly:\n${question}`
    );

    const answer = result.response.text();
    console.log("✅ Gemini answer:", answer);

    res.json({ answer });
  } catch (error) {
    console.error("❌ Error in askQuestion:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const getAllDocs = async (req, res) => {
  try {
    const docs = await Doc.find({})
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    console.error("Error fetching all docs:", error);
    res.status(500).json({ message: "Error fetching all documents" });
  }
};

export const adminUpdateDoc = async (req, res) => {
  try {
    const { title, content } = req.body;

    let summary = "",
      tags = [],
      embedding = [];
    try {
      summary = (await summarizeText(content)) || "";
      tags = (await generateTags(content)) || [];
      embedding = (await getEmbedding(content)) || [];
    } catch (err) {
      console.warn("⚠️ Error with AI helpers:", err.message);
    }

    const updatedDoc = await Doc.findByIdAndUpdate(
      req.params.id,
      { title, content, summary, tags, embedding },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!updatedDoc) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(updatedDoc);
  } catch (error) {
    console.error("Error updating doc (admin):", error);
    res.status(500).json({ message: "Error updating document" });
  }
};

export const adminDeleteDoc = async (req, res) => {
  try {
    const deletedDoc = await Doc.findByIdAndDelete(req.params.id);

    if (!deletedDoc) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting doc (admin):", error);
    res.status(500).json({ message: "Error deleting document" });
  }
};
