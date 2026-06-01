const express = require("express");

const router =
  express.Router();

const {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
} = require(
  "../controllers/userController"
);

const protect = require(
  "../middleware/authMiddleware"
);

// GET USER PROFILE
router.get(
  "/:id",
  getUserProfile
);

// UPDATE PROFILE
router.put(
  "/profile",
  protect,
  updateProfile
);

// FOLLOW USER
router.put(
  "/follow/:id",
  protect,
  followUser
);

// UNFOLLOW USER
router.put(
  "/unfollow/:id",
  protect,
  unfollowUser
);

module.exports = router;