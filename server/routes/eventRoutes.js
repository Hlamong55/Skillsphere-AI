
const express = require("express");

const {
  createEvent,
  getEvents,
  getEventById,
  joinEvent,
  leaveEvent,
} = require("../controllers/eventController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE EVENT
router.post("/", protect, createEvent);

// VIEW ALL EVENTS
router.get("/", getEvents);

// VIEW SINGLE EVENT
router.get("/:id", getEventById);

// JOIN EVENT
router.put("/:id/join", protect, joinEvent);

// LEAVE EVENT
router.put("/:id/leave", protect, leaveEvent);

module.exports = router;
