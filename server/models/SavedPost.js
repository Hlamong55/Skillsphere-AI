
const mongoose = require("mongoose");

const savedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// A user can save a particular post only once.
savedPostSchema.index(
  { user: 1, post: 1 },
  { unique: true }
);

// Faster retrieval of recently saved posts.
savedPostSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "SavedPost",
  savedPostSchema
);
