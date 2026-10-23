
const mongoose = require("mongoose");
const Resource = require("../models/Resource");

// GET LOGGED-IN USER'S RATING
const getMyResourceRating = async (req, res) => {
  try {
    const resourceId = req.params.id;

    if (!mongoose.isValidObjectId(resourceId)) {
      return res.status(400).json({
        message: "Invalid resource ID",
      });
    }

    const resource = await Resource.findById(resourceId)
      .select("ratings averageRating ratingsCount");

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    const userId = String(req.user._id);

    const myRating = resource.ratings.find(
      (item) => String(item.user) === userId
    );

    return res.status(200).json({
      userRating: myRating?.value || 0,
      averageRating: resource.averageRating || 0,
      ratingsCount: resource.ratingsCount || 0,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getMyResourceRating,
};
