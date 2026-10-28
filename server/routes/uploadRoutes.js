
const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  uploader,
  RULES,
} = require("../middleware/uploadMiddleware");

const {
  uploadFile,
} = require("../controllers/uploadController");

// ========================================
// UPLOAD ERROR HANDLER
// ========================================

const handleMulterUpload = (
  req,
  res,
  next
) => {
  // Only known upload categories
  if (
    !Object.prototype.hasOwnProperty.call(
      RULES,
      req.params.kind
    )
  ) {
    return res.status(400).json({
      message: "Invalid upload category.",
    });
  }

  uploader.single("file")(
    req,
    res,
    (error) => {
      if (error) {
        if (
          error instanceof multer.MulterError
        ) {
          const status =
            error.code === "LIMIT_FILE_SIZE"
              ? 413
              : 400;

          return res.status(status).json({
            message:
              error.code === "LIMIT_FILE_SIZE"
                ? "File is too large. Maximum 25 MB."
                : error.message,
          });
        }

        return res.status(
          error.statusCode || 400
        ).json({
          message:
            error.message || "Invalid upload.",
        });
      }

      next();
    }
  );
};

// ========================================
// PROTECTED UPLOAD ENDPOINT
// ========================================

// POST /api/uploads/image
// POST /api/uploads/video
// POST /api/uploads/pdf

router.post(
  "/:kind",
  protect,
  handleMulterUpload,
  uploadFile
);

module.exports = router;
