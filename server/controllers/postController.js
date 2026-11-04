
const Post = require("../models/Post");

// ========================================
// IMAGE / VIDEO URL VALIDATION
// ========================================

const isValidImageUrl = (value) => {
  if (value === "" || value == null) {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  if (value.length > 2048) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      ["http:", "https:"].includes(url.protocol) &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
};

// ========================================
// CREATE POST
// ========================================

const createPost = async (req, res) => {
  try {
    const { content, image, video } = req.body || {};

    // Content validation
    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Post content is required.",
      });
    }

    // Accept persistent HTTP/HTTPS images,
    // including images from our upload API.
    // Reject temporary blob: and data: URLs.
    const imageUrl = image ?? "";

    if (!isValidImageUrl(imageUrl)) {
      return res.status(400).json({
        message: "Invalid image URL.",
      });
    }

    // Validate persistent video URL.
    // Reuse the existing HTTP/HTTPS URL validator.
    const videoUrl = video ?? "";

    if (!isValidImageUrl(videoUrl)) {
      return res.status(400).json({
        message: "Invalid video URL.",
      });
    }

    const post = await Post.create({
      user: req.user._id,
      content: content.trim(),
      image: imageUrl.trim(),
      video: videoUrl.trim(),
    });

    // Return author details for instant UI update.
    await post.populate(
      "user",
      "name username profilePicture"
    );

    return res.status(201).json(post);

  } catch (error) {
    console.error("Create Post Error:", error);

    return res.status(500).json({
      message: "Failed to create post.",
    });
  }
};

// ========================================
// GET ALL POSTS
// ========================================

const getPosts = async (req, res) => {
  try {
    const pageSize = 5;

    const page = Number(req.query.page) || 1;

    const count = await Post.countDocuments();

    const posts = await Post.find()
      .populate(
        "user",
        "name username profilePicture"
      )
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

// ========================================
// NEW: UPDATE POST
// ========================================

// Allows:
// 1. Text editing
// 2. Image replacement
// 3. Video replacement
// 4. Image/video removal
//
// Only the post owner can update it.
//
// Intended endpoint:
// PUT /posts/:id

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // ------------------------------------
    // POST EXISTENCE
    // ------------------------------------

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    // ------------------------------------
    // OWNER AUTHORIZATION
    // ------------------------------------

    const postOwnerId =
      post.user?._id || post.user;

    const loggedInUserId =
      req.user?._id;

    if (
      !loggedInUserId ||
      String(postOwnerId) !== String(loggedInUserId)
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to edit this post.",
      });
    }

    // ------------------------------------
    // REQUEST BODY
    // ------------------------------------

    const body = req.body || {};

    const hasContent =
      Object.prototype.hasOwnProperty.call(
        body,
        "content"
      );

    const hasImage =
      Object.prototype.hasOwnProperty.call(
        body,
        "image"
      );

    const hasVideo =
      Object.prototype.hasOwnProperty.call(
        body,
        "video"
      );

    // At least one editable field required.
    if (
      !hasContent &&
      !hasImage &&
      !hasVideo
    ) {
      return res.status(400).json({
        message:
          "Provide content, image, or video to update.",
      });
    }

    // ------------------------------------
    // CONTENT VALIDATION
    // ------------------------------------

    if (hasContent) {
      if (
        typeof body.content !== "string" ||
        !body.content.trim()
      ) {
        return res.status(400).json({
          message:
            "Post content cannot be empty.",
        });
      }
    }

    // ------------------------------------
    // IMAGE VALIDATION
    // ------------------------------------

    if (hasImage) {
      if (
        typeof body.image !== "string" ||
        !isValidImageUrl(body.image)
      ) {
        return res.status(400).json({
          message: "Invalid image URL.",
        });
      }
    }

    // ------------------------------------
    // VIDEO VALIDATION
    // ------------------------------------

    if (hasVideo) {
      if (
        typeof body.video !== "string" ||
        !isValidImageUrl(body.video)
      ) {
        return res.status(400).json({
          message: "Invalid video URL.",
        });
      }
    }

    // ------------------------------------
    // APPLY VALIDATED CHANGES
    // ------------------------------------

    // Update content only when provided.
    if (hasContent) {
      post.content = body.content.trim();
    }

    // Empty string removes the image.
    if (hasImage) {
      post.image = body.image.trim();
    }

    // Empty string removes the video.
    if (hasVideo) {
      post.video = body.video.trim();
    }

    // Only content, image and video are
    // editable. Other fields such as user,
    // likes and dislikes are untouched.

    // ------------------------------------
    // SAVE TO MONGODB
    // ------------------------------------

    await post.save();

    // Return populated author information,
    // including the dynamic profile picture.
    await post.populate(
      "user",
      "name username profilePicture"
    );

    return res.status(200).json({
      message: "Post updated successfully.",
      post,
    });

  } catch (error) {
    console.error(
      "Update Post Error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    return res.status(500).json({
      message: "Failed to update post.",
    });
  }
};

// ========================================
// LIKE POST
// ========================================

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const userId = req.user._id;

    const alreadyLiked =
      post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) =>
          id.toString() !== userId.toString()
      );

    } else {
      post.likes.push(userId);

      // Remove dislike if exists.
      post.dislikes = post.dislikes.filter(
        (id) =>
          id.toString() !== userId.toString()
      );
    }

    await post.save();

    res.status(200).json({
      isLiked: !alreadyLiked,
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

// ========================================
// DISLIKE POST
// ========================================

const toggleDislike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const userId = req.user._id;

    const alreadyDisliked =
      post.dislikes.includes(userId);

    if (alreadyDisliked) {
      post.dislikes = post.dislikes.filter(
        (id) =>
          id.toString() !== userId.toString()
      );

    } else {
      post.dislikes.push(userId);

      // Remove like if exists.
      post.likes = post.likes.filter(
        (id) =>
          id.toString() !== userId.toString()
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

// ========================================
// GET USER POSTS
// ========================================

const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.params.id,
    })
      .populate(
        "user",
        "name username profilePicture"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json(posts);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
  createPost,
  getPosts,
  updatePost,
  toggleLike,
  toggleDislike,
  getUserPosts,
};
