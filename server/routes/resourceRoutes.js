
const express = require("express");

const {
  createResource,
  getResources,
  getResourceById,
  rateResource,
} = require("../controllers/resourceController");

const {
  getMyResourceRating,
} = require("../controllers/ratingController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE RESOURCE
router.post("/", protect, createResource);

// LIST RESOURCES
router.get("/", getResources);

// GET MY RATING
router.get(
  "/:id/my-rating",
  protect,
  getMyResourceRating
);

// ADD OR UPDATE RATING
router.put(
  "/:id/rate",
  protect,
  rateResource
);

// RESOURCE DETAILS
router.get("/:id", getResourceById);

module.exports = router;
