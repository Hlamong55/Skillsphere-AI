const express = require("express");

const {
  createPost,
  getPosts,
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .post(protect, createPost)
  .get(getPosts);

module.exports = router;