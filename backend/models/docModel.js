import mongoose from "mongoose";

const docSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    summary: { type: String },

    embedding: { type: [Number] },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    isPublic: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

docSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.model("Doc", docSchema);
