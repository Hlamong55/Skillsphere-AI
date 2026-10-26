
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

// OPTIONAL AUTHENTICATION
// Public visitors may view event details.
// If a Bearer token is supplied, verify it using
// the existing authentication middleware.
const optionalProtect = (req, res, next) => {
  const authorization = req.headers.authorization || "";

  if (!authorization) {
    return next();
  }

  // If an auth header is supplied, it must be
  // a valid Bearer token.
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    return res.status(401).json({
      message: "Invalid authorization header",
    });
  }

  return protect(req, res, next);
};

// CREATE EVENT - LOGIN REQUIRED
router.post("/", protect, createEvent);

// EVENT LIST - PUBLIC
router.get("/", getEvents);

// EVENT DETAILS - OPTIONAL AUTH
router.get("/:id", optionalProtect, getEventById);

// JOIN / LEAVE - LOGIN REQUIRED
router.put("/:id/join", protect, joinEvent);
router.put("/:id/leave", protect, leaveEvent);

module.exports = router;
