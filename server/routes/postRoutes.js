const express = require("express");

const {
  createPost,
  getPosts,
  toggleLike,
  toggleDislike,
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createPost).get(getPosts);

router.put("/:id/like", protect, toggleLike);

router.put("/:id/dislike", protect, toggleDislike);

router.get("/user/:id", getUserPosts);

module.exports = router;
