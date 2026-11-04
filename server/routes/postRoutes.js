
const express = require("express");

const {
  createPost,
  getPosts,
  updatePost,
  toggleLike,
  toggleDislike,
  getUserPosts,
} = require("../controllers/postController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// CREATE POST / GET ALL POSTS
// ========================================

router
  .route("/")
  .post(protect, createPost)
  .get(getPosts);

// ========================================
// NEW: UPDATE EXISTING POST
// ========================================

// PUT /posts/:id
// Only the post owner can edit.

router.put(
  "/:id",
  protect,
  updatePost
);

// ========================================
// LIKE POST
// ========================================

router.put(
  "/:id/like",
  protect,
  toggleLike
);

// ========================================
// DISLIKE POST
// ========================================

router.put(
  "/:id/dislike",
  protect,
  toggleDislike
);

// ========================================
// GET USER POSTS
// ========================================

router.get(
  "/user/:id",
  getUserPosts
);

// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;
