import express from "express";
import {
  createDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  searchDocs,
  semanticSearch,
  askQuestion,
  getAllDocs,
  adminUpdateDoc,
  adminDeleteDoc,
  getPublicDocs,
} from "../controllers/docController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public", protect, getPublicDocs);
router.get("/search", protect, searchDocs);
router.post("/semantic-search", protect, semanticSearch);
router.post("/ask-question", protect, askQuestion);

router.get("/admin/all", protect, isAdmin, getAllDocs);
router.put("/admin/:id", protect, isAdmin, adminUpdateDoc);
router.delete("/admin/:id", protect, isAdmin, adminDeleteDoc);

router.post("/", protect, createDoc);
router.get("/", protect, getDocs);
router.put("/:id", protect, updateDoc);
router.delete("/:id", protect, deleteDoc);

export default router;
