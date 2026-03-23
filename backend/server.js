import dotenv from "dotenv";

dotenv.config();
console.log(
  "OpenRouter key:",
  process.env.OPENROUTER_API_KEY ? "✅ Loaded" : "❌ MISSING",
);
console.log(
  "HuggingFace key:",
  process.env.HUGGINGFACE_TOKEN ? "✅ Loaded" : "❌ MISSING",
);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import docRoutes from "./routes/docRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);

app.get("/", (req, res) => res.send("API is running"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(process.env.PORT || 5000, () =>
      console.log("✅ Server running on port 5000"),
    ),
  )
  .catch((err) => console.error("❌ DB connection error:", err));
