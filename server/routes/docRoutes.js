import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  searchDocs,
} from "../controllers/docController.js";

const router = express.Router();

router.post("/", protect, createDoc);
router.get("/", protect, getDocs);
router.get("/search", protect, searchDocs);
router.put("/:id", protect, updateDoc);  
router.delete("/:id", protect, deleteDoc);


export default router;
