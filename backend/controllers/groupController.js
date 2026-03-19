import mongoose from "mongoose";
import Group from "../models/groupModel.js";
import Doc from "../models/docModel.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await Group.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    await group.populate("owner", "name email");

    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Error creating group" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!group) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    const alreadyMember = group.members.some(
      (id) => id.toString() === req.user._id.toString(),
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "You are already in this group" });
    }

    group.members.push(req.user._id);
    await group.save();

    await group.populate("owner", "name email");
    await group.populate("members", "name email");

    res.json({ message: "Joined group successfully", group });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Error joining group" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Error fetching groups" });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    res.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ message: "Error fetching group" });
  }
};

export const getGroupDocs = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const docs = await Doc.find({ groupId: req.params.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    console.error("Error fetching group docs:", error);
    res.status(500).json({ message: "Error fetching group docs" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Owner cannot leave. Delete the group instead.",
      });
    }

    group.members = group.members.filter(
      (m) => m.toString() !== req.user._id.toString(),
    );

    await group.save();
    res.json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Error leaving group" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can edit this group" });
    }
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    await group.save();
    await group.populate("owner", "name email");
    await group.populate("members", "name email");
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Error updating group" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can remove members" });
    }
    if (memberId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Owner cannot remove themselves" });
    }
    group.members = group.members.filter((m) => m.toString() !== memberId);
    await group.save();
    res.json({ message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error removing member" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can delete this group" });
    }

    await Doc.updateMany({ groupId: req.params.id }, { groupId: null });

    await group.deleteOne();
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Error deleting group" });
  }
};

import { getEmbedding } from "../utils/gemini.js";

export const groupSemanticSearch = async (req, res) => {
  try {
    const { query } = req.body;
    const groupId = req.params.id;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    const queryEmbedding = await getEmbedding(query);

    const docs = await Doc.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 20,
          limit: 5,
          filter: { groupId: { $eq: new mongoose.Types.ObjectId(groupId) } },
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          summary: 1,
          tags: 1,
          createdBy: 1,
          createdAt: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    await Doc.populate(docs, { path: "createdBy", select: "name email" });

    res.json(docs);
  } catch (error) {
    console.error("Error in group semantic search:", error);
    res.status(500).json({
      message: "Error in group semantic search",
      error: error.message,
    });
  }
};

import { getEmbedding as embed, textModel } from "../utils/gemini.js";


export const groupAskAI = async (req, res) => {
  try {
    const { question } = req.body;
    const groupId = req.params.id;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    const queryEmbedding = await getEmbedding(question);

    const relevantDocs = await Doc.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 20,
          limit: 5,
          filter: { groupId: { $eq: new mongoose.Types.ObjectId(groupId) } },
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          createdBy: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    if (relevantDocs.length === 0) {
      return res.json({
        answer:
          "No relevant notes found in this group to answer your question. Try adding more notes!",
        sources: [],
      });
    }

    const context = relevantDocs
      .map((doc, i) => `[Note ${i + 1}] ${doc.title}:\n${doc.content}`)
      .join("\n\n---\n\n");

    const prompt = `You are a helpful study assistant for a student group.
Answer the following question using ONLY the notes provided below.
If the answer is not in the notes, say "This topic isn't covered in the group's notes yet."

STUDENT NOTES:
${context}

QUESTION: ${question}

Answer clearly and concisely:`;

    const result = await textModel.generateContent(prompt);
    const answer = result.response.text();

    await Doc.populate(relevantDocs, {
      path: "createdBy",
      select: "name email",
    });

    res.json({
      answer,
      sources: relevantDocs.map((d) => ({
        _id: d._id,
        title: d.title,
        createdBy: d.createdBy,
        score: d.score,
      })),
    });
  } catch (error) {
    console.error("Error in group ask AI:", error);
    res
      .status(500)
      .json({ message: "Error in group ask AI", error: error.message });
  }
};
