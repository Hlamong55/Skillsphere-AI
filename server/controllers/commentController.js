const Comment = require("../models/Comment");
const Post = require("../models/Post");

// CREATE COMMENT
const createComment = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user._id,
      text,
    });

    // Increase comments count
    post.commentsCount += 1;

    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name username profilePicture",
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET COMMENTS FOR A POST
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
    })
      .populate("user", "name username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createComment,
  getComments,
};
