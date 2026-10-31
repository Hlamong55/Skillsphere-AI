
const mongoose = require("mongoose");

const SavedPost = require("../models/SavedPost");
const Post = require("../models/Post");

// ========================================
// GET LOGGED-IN USER ID
// ========================================

const getCurrentUserId = (req) => {
  return req.user?._id || req.user?.id;
};

// ========================================
// GET ALL SAVED POST IDS
// ========================================
// GET /api/saved-posts/ids
//
// Used to display saved/unsaved icons
// in the Feed.

const getSavedPostIds = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    const saved = await SavedPost.find({
      user: userId,
    })
      .select("post")
      .lean();

    const postIds = saved.map((item) =>
      String(item.post)
    );

    return res.status(200).json({
      postIds,
    });

  } catch (error) {
    console.error(
      "Get Saved Post IDs Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load saved post IDs.",
    });
  }
};

// ========================================
// GET SAVED POSTS WITH PAGINATION
// ========================================
// GET /api/saved-posts?page=1
//
// Returns full Post objects for PostCard.

const getSavedPosts = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = 5;

    const [total, savedRecords] = await Promise.all([
      SavedPost.countDocuments({
        user: userId,
      }),

      SavedPost.find({
        user: userId,
      })
        .sort({
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "post",
          populate: {
            path: "user",
            select: "name username profilePicture",
          },
        })
        .lean(),
    ]);

    // Deleted posts may leave old bookmarks.
    // Do not return null posts to PostCard.
    const posts = savedRecords
      .filter((item) => item.post)
      .map((item) => item.post);

    return res.status(200).json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total,
    });

  } catch (error) {
    console.error(
      "Get Saved Posts Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load saved posts.",
    });
  }
};

// ========================================
// SAVE POST
// ========================================
// POST /api/saved-posts/:postId

const savePost = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { postId } = req.params;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    // Make sure the Post actually exists.
    const existingPost = await Post.exists({
      _id: postId,
    });

    if (!existingPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    // Upsert prevents duplicate bookmarks.
    const result = await SavedPost.updateOne(
      {
        user: userId,
        post: postId,
      },
      {
        $setOnInsert: {
          user: userId,
          post: postId,
        },
      },
      {
        upsert: true,
      }
    );

    const newlySaved =
      result.upsertedCount > 0;

    return res.status(
      newlySaved ? 201 : 200
    ).json({
      message: newlySaved
        ? "Post saved successfully."
        : "Post is already saved.",
      saved: true,
      postId,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        message: "Post is already saved.",
        saved: true,
        postId: req.params.postId,
      });
    }

    console.error(
      "Save Post Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to save post.",
    });
  }
};

// ========================================
// REMOVE BOOKMARK
// ========================================
// DELETE /api/saved-posts/:postId

const unsavePost = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const { postId } = req.params;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    await SavedPost.deleteOne({
      user: userId,
      post: postId,
    });

    return res.status(200).json({
      message: "Post removed from saved posts.",
      saved: false,
      postId,
    });

  } catch (error) {
    console.error(
      "Unsave Post Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to unsave post.",
    });
  }
};

module.exports = {
  getSavedPostIds,
  getSavedPosts,
  savePost,
  unsavePost,
};
