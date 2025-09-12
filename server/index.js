import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import docRoutes from "./routes/docRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/docs", docRoutes);

app.get("/", (req, res) => res.send("API is running"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(5000, () => console.log("server is running on 5000")))
  .catch((err) => console.error(err));
