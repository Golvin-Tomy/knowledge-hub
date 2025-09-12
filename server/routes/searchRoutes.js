import express from "express";
import { textSearch, semanticSearch } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/text", protect, textSearch);
router.get("/semantic", protect, semanticSearch);

export default router;
