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
router.get("/me/following", protect, getFollowing);

router.put("/:id", protect, updateUser);

router.delete("/:id", protect, isAdmin, deleteUser);

router.post("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);

export default router;
