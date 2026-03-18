import express from "express";
import {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupById,
  getGroupDocs,
  leaveGroup,
  deleteGroup,
  groupSemanticSearch,
  groupAskAI,
} from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require login
router.use(protect);

router.post("/", createGroup);
router.post("/join", joinGroup);
router.get("/", getMyGroups);
router.get("/:id", getGroupById);
router.delete("/:id", deleteGroup);
router.post("/:id/leave", leaveGroup);

router.get("/:id/docs", getGroupDocs);

router.post("/:id/semantic-search", groupSemanticSearch);
router.post("/:id/ask", groupAskAI);

export default router;
