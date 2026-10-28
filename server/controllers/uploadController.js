
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const {
  RULES,
  UPLOAD_DIR,
  hasValidSignature,
} = require("../middleware/uploadMiddleware");

// ========================================
// UPLOAD FILE CONTROLLER
// ========================================

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please select a file.",
    });
  }

  const tempPath = req.file.path;

  try {
    const kind = req.params.kind;

    const rule = RULES[kind];

    if (!rule) {
      const error = new Error(
        "Invalid upload category."
      );
      error.statusCode = 400;
      throw error;
    }

    // Check category-specific size
    if (req.file.size > rule.maxBytes) {
      const error = new Error(
        "File exceeds the allowed size."
      );
      error.statusCode = 413;
      throw error;
    }

    // Verify actual file signature
    const validSignature =
      await hasValidSignature(
        tempPath,
        req.file.mimetype
      );

    if (!validSignature) {
      const error = new Error(
        "Invalid file content or format."
      );
      error.statusCode = 400;
      throw error;
    }

    const fileConfig =
      rule.accept[req.file.mimetype];

    const fileName =
      crypto.randomBytes(16).toString("hex") +
      fileConfig.savedExt;

    const destinationDir = path.join(
      UPLOAD_DIR,
      kind
    );

    await fs.mkdir(destinationDir, {
      recursive: true,
    });

    const destinationPath = path.join(
      destinationDir,
      fileName
    );

    // Move verified file to public storage
    await fs.rename(
      tempPath,
      destinationPath
    );

    const filePath =
      `/uploads/${kind}/${fileName}`;

    return res.status(201).json({
      message: "File uploaded successfully.",
      filePath,
      kind,
      mimeType: req.file.mimetype,
      size: req.file.size,
      originalName: req.file.originalname,
    });

  } catch (error) {
    console.error(
      "Upload processing error:",
      error.message
    );

    // Clean up temporary file if
    // validation or saving fails.
    await fs.unlink(tempPath).catch(() => {});

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to upload file.",
    });
  }
};

module.exports = {
  uploadFile,
};
