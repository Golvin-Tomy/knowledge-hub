import express from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, isAdmin, getAllUsers);

router.put("/:id", protect, isAdmin, updateUser);

router.delete("/:id", protect, isAdmin, deleteUser);

export default router;
