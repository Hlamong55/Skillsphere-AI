
const Resource = require("../models/Resource");

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

// CREATE RESOURCE
const createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      url = "",
      content = "",
    } = req.body;

    const cleanTitle = String(title || "").trim();
    const cleanDescription = String(description || "").trim();
    const cleanCategory = String(category || "").trim();
    const cleanUrl = String(url || "").trim();
    const cleanContent = String(content || "").trim();

    if (
      !cleanTitle ||
      !cleanDescription ||
      !cleanCategory ||
      !["tutorial", "video", "pdf"].includes(type)
    ) {
      return res.status(400).json({
        message: "Please provide valid resource details.",
      });
    }

    if (
      (type === "video" || type === "pdf") &&
      !cleanUrl
    ) {
      return res.status(400).json({
        message: "A resource URL is required.",
      });
    }

    if (cleanUrl && !isValidUrl(cleanUrl)) {
      return res.status(400).json({
        message: "Please provide a valid HTTP/HTTPS URL.",
      });
    }

    if (
      type === "tutorial" &&
      !cleanContent &&
      !cleanUrl
    ) {
      return res.status(400).json({
        message: "Tutorial content or URL is required.",
      });
    }

    const resource = await Resource.create({
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      type,
      url: cleanUrl,
      content: cleanContent,
      createdBy: req.user._id,
    });

    await resource.populate(
      "createdBy",
      "name username profilePicture"
    );

    return res.status(201).json(resource);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET RESOURCES WITH SEARCH & PAGINATION
const getResources = async (req, res) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = 6;

    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (
      req.query.type &&
      ["tutorial", "video", "pdf"].includes(req.query.type)
    ) {
      filter.type = req.query.type;
    }

    if (req.query.search) {
      const keyword = String(req.query.search)
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    const totalResources =
      await Resource.countDocuments(filter);

    const resources = await Resource.find(filter)
      .select("-ratings")
      .populate(
        "createdBy",
        "name username profilePicture"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      resources,
      page,
      pages: Math.ceil(totalResources / limit),
      totalResources,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE RESOURCE
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .select("-ratings")
      .populate(
        "createdBy",
        "name username profilePicture"
      );

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    return res.status(200).json(resource);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ADD OR UPDATE STAR RATING
const rateResource = async (req, res) => {
  try {
    const { rating } = req.body;
    const score = Number(rating);

    if (
      !Number.isInteger(score) ||
      score < 1 ||
      score > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    const userId = String(req.user._id);

    const existingRating = resource.ratings.find(
      (item) => String(item.user) === userId
    );

    if (existingRating) {
      existingRating.value = score;
    } else {
      resource.ratings.push({
        user: req.user._id,
        value: score,
      });
    }

    const total = resource.ratings.reduce(
      (sum, item) => sum + item.value,
      0
    );

    resource.ratingsCount = resource.ratings.length;

    resource.averageRating = resource.ratingsCount
      ? Number(
          (total / resource.ratingsCount).toFixed(2)
        )
      : 0;

    await resource.save();

    return res.status(200).json({
      message: "Rating saved successfully",
      averageRating: resource.averageRating,
      ratingsCount: resource.ratingsCount,
      userRating: score,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  rateResource,
};
