
const express = require("express");
const multer = require("multer");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  createUploader,
  RULES,
} = require("../middleware/uploadMiddleware");

const {
  uploadFile,
} = require("../controllers/uploadController");

const router = express.Router();

// ========================================
// SECURE UPLOAD MIDDLEWARE
// ========================================

const handleMulterUpload = (
  req,
  res,
  next
) => {
  const kind = req.params.kind;

  // Reject unknown upload categories
  if (
    !Object.prototype.hasOwnProperty.call(
      RULES,
      kind
    )
  ) {
    return res.status(400).json({
      message: "Invalid upload category.",
    });
  }

  const upload = createUploader(kind);

  const maxMB =
    RULES[kind].maxBytes /
    (1024 * 1024);

  // Process one file using the
  // category-specific stream limit.
  upload.single("file")(
    req,
    res,
    (error) => {
      if (error) {
        if (
          error instanceof multer.MulterError
        ) {
          const tooLarge =
            error.code === "LIMIT_FILE_SIZE";

          return res.status(
            tooLarge ? 413 : 400
          ).json({
            message: tooLarge
              ? `Maximum ${maxMB} MB allowed for ${kind} uploads.`
              : error.message,
          });
        }

        return res.status(
          error.statusCode || 400
        ).json({
          message:
            error.message ||
            "Invalid file upload.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Please select a file.",
        });
      }

      next();
    }
  );
};

// ========================================
// PROTECTED UPLOAD ENDPOINTS

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
