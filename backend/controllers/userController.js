import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password"); // hide password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update user (name/email)
export const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (
      req.user._id.toString() !== req.params.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You can only edit your own profile" });
    }
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    const me = await User.findById(req.user._id);
    if (me.following.includes(targetId)) {
      return res.status(400).json({ message: "Already following" });
    }
    me.following.push(targetId);
    await me.save();
    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const me = await User.findById(req.user._id);
    me.following = me.following.filter((id) => id.toString() !== targetId);
    await me.save();
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get my following list
export const getFollowing = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate(
      "following",
      "name email",
    );
    res.json(me.following);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
