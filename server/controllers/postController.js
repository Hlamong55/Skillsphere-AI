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

module.exports = {
  createPost,
  getPosts,
};