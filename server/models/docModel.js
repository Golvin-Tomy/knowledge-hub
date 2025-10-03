import mongoose from "mongoose";

const docSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    summary: { type: String },
    embedding: { type: [Number], index: "2dsphere" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } 
);

export default mongoose.model("Doc", docSchema);
