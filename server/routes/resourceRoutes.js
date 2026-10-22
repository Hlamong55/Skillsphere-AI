
const express = require("express");

const {
  createResource,
  getResources,
  getResourceById,
  rateResource,
} = require("../controllers/resourceController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create resource - Login required
router.post("/", protect, createResource);

// Get resources - Public
router.get("/", getResources);

// Get single resource - Public
router.get("/:id", getResourceById);

// Rate resource - Login required
router.put("/:id/rate", protect, rateResource);

module.exports = router;
