const Post = require("../models/Post");


// CREATE POST
const createPost = async (req, res) => {
  try {
    const { content, image, video } = req.body;

    const post = await Post.create({
      user: req.user._id,
      content,
      image,
      video,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL POSTS
const getPosts = async (req, res) => {
  try {
    const pageSize = 5;

    const page = Number(req.query.page) || 1;

    const count = await Post.countDocuments();

    const posts = await Post.find()
      .populate("user", "name username profilePicture")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(count / pageSize),
      totalPosts: count,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// LIKE POST
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const userId = req.user._id;

    // Already liked?
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);

      // Remove dislike if exists
      post.dislikes = post.dislikes.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    await post.save();

    res.status(200).json({
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
      likes: post.likes,
      dislikes: post.dislikes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// DISLIKE POST
const toggleDislike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const userId = req.user._id;

    // Already disliked?
    const alreadyDisliked = post.dislikes.includes(userId);

    if (alreadyDisliked) {
      post.dislikes = post.dislikes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.dislikes.push(userId);

      // Remove like if exists
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    await post.save();

    res.status(200).json({
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
      likes: post.likes,
      dislikes: post.dislikes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  toggleDislike,
};