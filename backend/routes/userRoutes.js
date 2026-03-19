import express from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowing,
} from "../controllers/userController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, isAdmin, getAllUsers);

router.put("/:id", protect, isAdmin, updateUser);

router.delete("/:id", protect, isAdmin, deleteUser);

router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);
router.get("/me/following", protect, getFollowing);

export default router;
