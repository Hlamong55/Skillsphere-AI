
const mongoose = require("mongoose");
const Event = require("../models/Event");

const validCategories = [
  "Workshop",
  "Study Session",
  "Webinar",
  "Hackathon",
  "Collaboration",
];

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return ["https:", "http:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// CREATE EVENT
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      eventDate,
      location,
      mode,
      meetingLink = "",
      maxParticipants = 20,
      agenda = [],
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 150 ||
      typeof description !== "string" ||
      !description.trim() ||
      description.length > 2000 ||
      !validCategories.includes(category) ||
      typeof location !== "string" ||
      !location.trim() ||
      !["Online", "Offline"].includes(mode)
    ) {
      return res.status(400).json({
        message: "Please provide valid event details.",
      });
    }

    const date = new Date(eventDate);

    if (
      !eventDate ||
      Number.isNaN(date.getTime()) ||
      date <= new Date()
    ) {
      return res.status(400).json({
        message: "Select a valid future date and time.",
      });
    }

    const capacity = Number(maxParticipants);

    if (
      !Number.isSafeInteger(capacity) ||
      capacity < 1 ||
      capacity > 10000
    ) {
      return res.status(400).json({
        message: "Invalid participant capacity.",
      });
    }

    if (
      !Array.isArray(agenda) ||
      agenda.length > 20 ||
      agenda.some((topic) =>
        typeof topic !== "string" || topic.length > 200
      )
    ) {
      return res.status(400).json({
        message: "Invalid event agenda.",
      });
    }

    const cleanLink =
      typeof meetingLink === "string"
        ? meetingLink.trim()
        : "";

    if (mode === "Online" && !isValidHttpUrl(cleanLink)) {
      return res.status(400).json({
        message: "Provide a valid online meeting URL.",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category,
      eventDate: date,
      location: location.trim(),
      mode,
      meetingLink:
        mode === "Online" ? cleanLink : "",
      maxParticipants: capacity,
      agenda: agenda.map((topic) => topic.trim()).filter(Boolean),
      organizer: req.user._id,
    });

    await event.populate(
      "organizer",
      "name username profilePicture"
    );

    return res.status(201).json(event);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL EVENTS
const getEvents = async (req, res) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = 6;
    const filter = {};

    if (req.query.category) {
      if (!validCategories.includes(req.query.category)) {
        return res.status(400).json({
          message: "Invalid category.",
        });
      }

      filter.category = req.query.category;
    }

    if (req.query.upcoming === "true") {
      filter.eventDate = { $gte: new Date() };
    }

    const totalEvents = await Event.countDocuments(filter);

    const events = await Event.find(filter)
      .populate(
        "organizer",
        "name username profilePicture"
      )
      .select("-participants -meetingLink")
      .sort({ eventDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      events,
      page,
      pages: Math.ceil(totalEvents / limit),
      totalEvents,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE EVENT

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name")
      .lean();

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const currentUserId = req.user?._id?.toString();

    const organizerId = event.organizer?._id?.toString();

    // Check whether requester is the organizer
    const isOrganizer = Boolean(
      currentUserId &&
      organizerId === currentUserId
    );

    // Check whether requester has joined this event
    const isParticipant = Boolean(
      currentUserId &&
      event.participants?.some(
        (participantId) =>
          participantId.toString() === currentUserId
      )
    );

    // Never expose the meeting URL without authorization
    const canViewMeetingLink =
      isOrganizer || isParticipant;

    if (!canViewMeetingLink) {
      delete event.meetingLink;
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Get event details error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    return res.status(500).json({
      message: "Failed to get event details",
    });
  }
};

// JOIN EVENT
const joinEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const userId = req.user._id;

    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        eventDate: { $gt: new Date() },
        organizer: { $ne: userId },
        participants: { $ne: userId },
        $expr: {
          $lt: [
            { $size: "$participants" },
            "$maxParticipants",
          ],
        },
      },
      { $addToSet: { participants: userId } },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(409).json({
        message:
          "Event unavailable, full, already joined, or created by you.",
      });
    }

    return res.status(200).json({
      message: "Joined event successfully",
      participantsCount: event.participants.length,
      isJoined: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// LEAVE EVENT
const leaveEvent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $pull: { participants: req.user._id } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.status(200).json({
      message: "Left event successfully",
      participantsCount: event.participants.length,
      isJoined: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  joinEvent,
  leaveEvent,
};
