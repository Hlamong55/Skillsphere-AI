
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["tutorial", "video", "pdf"],
      required: true,
    },

    url: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        value: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
    },

    ratingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.index({
  category: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Resource",
  resourceSchema
);
