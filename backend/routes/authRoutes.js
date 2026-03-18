import express from "express";
import { registerUser , loginUser} from "../controllers/authController.js";
import{ protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    role: req.user.role,
    email: req.user.email,
  });
});

export default router