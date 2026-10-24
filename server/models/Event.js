
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
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
      enum: [
        "Workshop",
        "Study Session",
        "Webinar",
        "Hackathon",
        "Collaboration",
      ],
      required: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },

    meetingLink: {
      type: String,
      default: "",
      trim: true,
    },

    maxParticipants: {
      type: Number,
      default: 20,
      min: 1,
    },

    agenda: {
      type: [String],
      default: [],
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

eventSchema.index({
  eventDate: 1,
  category: 1,
});

module.exports = mongoose.model("Event", eventSchema);
