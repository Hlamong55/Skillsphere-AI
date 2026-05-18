const express = require("express");

const {
  createComment,
  getComments,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:postId")
  .post(protect, createComment)
  .get(getComments);

module.exports = router;