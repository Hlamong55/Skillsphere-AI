
const Event = require("../models/Event");

// Allowed event categories
const CATEGORIES = [
  "Workshop",
  "Study Session",
  "Webinar",
  "Hackathon",
  "Collaboration",
];

// Only these fields can be edited
const ALLOWED_FIELDS = [
  "title",
  "description",
  "category",
  "eventDate",
  "location",
  "mode",
  "meetingLink",
  "maxParticipants",
  "agenda",
];

const hasField = (object, field) =>
  Object.prototype.hasOwnProperty.call(object, field);

const isValidId = (id) =>
  /^[a-fA-F0-9]{24}$/.test(id);

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const isValidMeetingUrl = (value) => {
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

// =========================================
// UPDATE EVENT — ORGANIZER ONLY
// PUT /api/events/:id
// =========================================
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id.toString();

    if (!isValidId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    // SECURITY: Only organizer can edit
    if (event.organizer.toString() !== userId) {
      return res.status(403).json({
        message: "Only the organizer can edit this event.",
      });
    }

    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      throw validationError("Invalid request body.");
    }

    const fields = Object.keys(body);

    if (fields.length === 0) {
      throw validationError("No changes provided.");
    }

    // Prevent organizer, participants and ID modification
    const unknownFields = fields.filter(
      (field) => !ALLOWED_FIELDS.includes(field)
    );

    if (unknownFields.length > 0) {
      throw validationError(
        "One or more fields cannot be modified."
      );
    }

    const updates = {};

    // TITLE
    if (hasField(body, "title")) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 150
      ) {
        throw validationError(
          "Title must contain 1 to 150 characters."
        );
      }

      updates.title = body.title.trim();
    }

    // DESCRIPTION
    if (hasField(body, "description")) {
      if (
        typeof body.description !== "string" ||
        !body.description.trim() ||
        body.description.trim().length > 2000
      ) {
        throw validationError(
          "Description must contain 1 to 2000 characters."
        );
      }

      updates.description = body.description.trim();
    }

    // CATEGORY
    if (hasField(body, "category")) {
      if (!CATEGORIES.includes(body.category)) {
        throw validationError("Invalid event category.");
      }

      updates.category = body.category;
    }

    // EVENT DATE
    if (hasField(body, "eventDate")) {
      const date = new Date(body.eventDate);

      if (
        !body.eventDate ||
        Number.isNaN(date.getTime()) ||
        date.getTime() <= Date.now()
      ) {
        throw validationError(
          "Event date must be in the future."
        );
      }

      updates.eventDate = date;
    }

    // MODE
    if (hasField(body, "mode")) {
      if (!["Online", "Offline"].includes(body.mode)) {
        throw validationError("Invalid event mode.");
      }

      updates.mode = body.mode;
    }

    // LOCATION
    if (hasField(body, "location")) {
      if (
        typeof body.location !== "string" ||
        body.location.trim().length > 250
      ) {
        throw validationError("Invalid event location.");
      }

      updates.location = body.location.trim();
    }

    // MEETING LINK
    if (hasField(body, "meetingLink")) {
      if (typeof body.meetingLink !== "string") {
        throw validationError("Invalid meeting link.");
      }

      updates.meetingLink = body.meetingLink.trim();
    }

    // CAPACITY
    if (hasField(body, "maxParticipants")) {
      const capacity = Number(body.maxParticipants);

      if (
        !Number.isSafeInteger(capacity) ||
        capacity < 1 ||
        capacity > 10000
      ) {
        throw validationError(
          "Capacity must be between 1 and 10000."
        );
      }

      // Cannot set capacity below registered count
      const joinedCount = event.participants.length;

      if (capacity < joinedCount) {
        throw validationError(
          `Cannot set capacity below ${joinedCount} joined participants.`
        );
      }

      updates.maxParticipants = capacity;
    }

    // AGENDA
    if (hasField(body, "agenda")) {
      if (
        !Array.isArray(body.agenda) ||
        body.agenda.length > 20 ||
        body.agenda.some(
          (topic) =>
            typeof topic !== "string" ||
            topic.trim().length > 200
        )
      ) {
        throw validationError(
          "Agenda must contain at most 20 valid topics."
        );
      }

      updates.agenda = body.agenda
        .map((topic) => topic.trim())
        .filter(Boolean);
    }

    // VALIDATE FINAL MODE + LOCATION
    const finalMode = updates.mode || event.mode;

    if (finalMode === "Online") {
      const link = hasField(updates, "meetingLink")
        ? updates.meetingLink
        : event.meetingLink;

      if (!link || !isValidMeetingUrl(link)) {
        throw validationError(
          "Online events require a valid HTTP/HTTPS meeting URL."
        );
      }

      updates.location = "Online";
      updates.meetingLink = link;
    } else {
      const location = hasField(updates, "location")
        ? updates.location
        : event.location;

      if (!location || location === "Online") {
        throw validationError(
          "Offline events require a valid venue."
        );
      }

      updates.location = location;
      updates.meetingLink = "";
    }

    // Save only validated fields
    event.set(updates);

    await event.save();

    await event.populate("organizer", "name");

    return res.status(200).json({
      message: "Event updated successfully.",
      event,
    });

  } catch (error) {
    console.error("Update event error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid event information.",
      });
    }

    return res.status(500).json({
      message: "Failed to update event.",
    });
  }
};

// =========================================
// DELETE EVENT — ORGANIZER ONLY
// DELETE /api/events/:id
// =========================================
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id.toString();

    if (!isValidId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID.",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    // SECURITY: Only organizer can delete
    if (event.organizer.toString() !== userId) {
      return res.status(403).json({
        message: "Only the organizer can delete this event.",
      });
    }

    const joinedCount = event.participants.length;

    // Recheck organizer during database deletion
    const result = await Event.deleteOne({
      _id: eventId,
      organizer: req.user._id,
    });

    if (result.deletedCount !== 1) {
      return res.status(409).json({
        message: "Event could not be deleted.",
      });
    }

    return res.status(200).json({
      message: "Event deleted successfully.",
      deletedEventId: eventId,
      deletedParticipantsCount: joinedCount,
    });

  } catch (error) {
    console.error("Delete event error:", error);

    return res.status(500).json({
      message: "Failed to delete event.",
    });
  }
};

module.exports = {
  updateEvent,
  deleteEvent,
};
