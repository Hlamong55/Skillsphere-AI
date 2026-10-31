
const express = require("express");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  getSavedPostIds,
  getSavedPosts,
  savePost,
  unsavePost,
} = require("../controllers/savedPostController");

const router = express.Router();

// All bookmark operations require login.
router.use(protect);

// Get saved post IDs for Feed icons.
router.get("/ids", getSavedPostIds);

// Get saved posts for Saved Posts Page.
router.get("/", getSavedPosts);

// Bookmark a post.
router.post("/:postId", savePost);

// Remove bookmark.
router.delete("/:postId", unsavePost);

module.exports = router;
