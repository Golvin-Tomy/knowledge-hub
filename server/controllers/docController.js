import Doc from "../models/docModel.js";

export const createDoc = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const newDoc = await Doc.create({
      title,
      content,
      tags: tags || [],
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

    const updatedDoc = await Doc.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { title, content },
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

