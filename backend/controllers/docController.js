import mongoose from "mongoose";
import Doc from "../models/docModel.js";
import {
  summarizeText,
  generateTags,
  getEmbedding,
  textModel,
} from "../utils/gemini.js";

export const createDoc = async (req, res) => {
  try {
    const { title, content, groupId, isPublic } = req.body;

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
      console.warn("Summarize error:", err.message);
    }

    try {
      tags = (await generateTags(content)) || [];
    } catch (err) {
      console.warn("Tags error:", err.message);
    }

    try {
      embedding = (await getEmbedding(content)) || [];
    } catch (err) {
      console.warn("Embedding error:", err.message);
    }

    const newDoc = await Doc.create({
      title,
      content,
      summary,
      embedding,
      tags,
      createdBy: req.user._id,
      groupId: groupId || null,
      isPublic: isPublic || false,
    });

    res.status(201).json(newDoc);
  } catch (error) {
    console.error("Error creating doc:", error);
    res.status(500).json({ message: "Error creating doc" });
  }
};

// get personal docs
export const getDocs = async (req, res) => {
  try {
    const docs = await Doc.find({
      createdBy: req.user._id,
      groupId: null,
    }).sort({ createdAt: -1 });

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
    } catch (err) {}
    try {
      tags = (await generateTags(content)) || [];
    } catch (err) {}
    try {
      embedding = (await getEmbedding(content)) || [];
    } catch (err) {}

    const updatedDoc = await Doc.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { title, content, summary, tags, embedding },
      { new: true, runValidators: true },
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

// keyword Search
export const searchDocs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ message: "Invalid search query" });
    }

    const docs = await Doc.find({
      createdBy: req.user._id,
      groupId: null,
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

// semantic Search
export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query is required" });
    }

    const queryEmbedding = await getEmbedding(query);

    const docs = await Doc.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 20,
          limit: 5,
          filter: {
            createdBy: { $eq: new mongoose.Types.ObjectId(req.user._id) },
            groupId: { $eq: null },
          },
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          summary: 1,
          tags: 1,
          createdAt: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    res.json(docs);
  } catch (error) {
    console.error("Error in semantic search:", error);
    res
      .status(500)
      .json({ message: "Error in semantic search", error: error.message });
  }
};

//  ask AI
export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // embed the question
    const queryEmbedding = await getEmbedding(question);

    // find relevant personal docs
    const relevantDocs = await Doc.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 20,
          limit: 5,
          filter: {
            createdBy: { $eq: new mongoose.Types.ObjectId(req.user._id) },
            groupId: { $eq: null },
          },
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    // build context
    const context = relevantDocs
      .map((doc, i) => `[Note ${i + 1}] ${doc.title}:\n${doc.content}`)
      .join("\n\n---\n\n");

    // ask Gemini with context
    const prompt = context.length
      ? `You are a helpful assistant. Answer using ONLY the notes below.
If the answer is not in the notes, say "This isn't covered in your notes yet."

YOUR NOTES:
${context}

QUESTION: ${question}

Answer:`
      : `You are a helpful assistant. Answer this question:\n${question}`;

    const result = await textModel.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer, sources: relevantDocs });
  } catch (error) {
    console.error("Error in askQuestion:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const getAllDocs = async (req, res) => {
  try {
    const docs = await Doc.find({})
      .populate("createdBy", "name email")
      .populate("groupId", "name")
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
      console.warn("AI helpers error:", err.message);
    }

    const updatedDoc = await Doc.findByIdAndUpdate(
      req.params.id,
      { title, content, summary, tags, embedding },
      { new: true, runValidators: true },
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

export const getPublicDocs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const docs = await Doc.find({ isPublic: true })
      .populate("createdBy", "name email")
      .populate("groupId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "title content summary tags createdAt updatedAt createdBy isPublic views groupId",
      );

    const total = await Doc.countDocuments({ isPublic: true });

    res.json({
      docs,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
