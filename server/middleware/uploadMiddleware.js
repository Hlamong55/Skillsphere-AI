
const multer = require("multer");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const SERVER_DIR = path.resolve(__dirname, "..");

const TEMP_DIR = path.join(
  SERVER_DIR,
  ".upload-temp"
);

const UPLOAD_DIR = path.join(
  SERVER_DIR,
  "uploads"
);

const MB = 1024 * 1024;

// Create upload temporary directory
fs.mkdirSync(TEMP_DIR, {
  recursive: true,
});

// ========================================
// FILE TYPE AND SIZE RULES
// ========================================

const RULES = {
  image: {
    maxBytes: 5 * MB,
    accept: {
      "image/jpeg": {
        extensions: [".jpg", ".jpeg"],
        savedExt: ".jpg",
      },
      "image/png": {
        extensions: [".png"],
        savedExt: ".png",
      },
      "image/webp": {
        extensions: [".webp"],
        savedExt: ".webp",
      },
    },
  },

  video: {
    maxBytes: 25 * MB,
    accept: {
      "video/mp4": {
        extensions: [".mp4"],
        savedExt: ".mp4",
      },
      "video/webm": {
        extensions: [".webm"],
        savedExt: ".webm",
      },
    },
  },

  pdf: {
    maxBytes: 10 * MB,
    accept: {
      "application/pdf": {
        extensions: [".pdf"],
        savedExt: ".pdf",
      },
    },
  },
};

// ========================================
// TEMPORARY FILE STORAGE
// ========================================

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, TEMP_DIR);
  },

  filename(req, file, cb) {
    const fileName =
      crypto.randomBytes(16).toString("hex");

    cb(null, `${fileName}.tmp`);
  },
});

// ========================================
// FILE FILTER
// ========================================

const fileFilter = (req, file, cb) => {
  const rule = RULES[req.params.kind];

  if (!rule) {
    const error = new Error(
      "Invalid upload category."
    );

    error.statusCode = 400;

    return cb(error);
  }

  const acceptedType =
    rule.accept[file.mimetype];

  const extension = path
    .extname(file.originalname || "")
    .toLowerCase();

  if (
    !acceptedType ||
    !acceptedType.extensions.includes(
      extension
    )
  ) {
    const error = new Error(
      "Unsupported file type."
    );

    error.statusCode = 400;

    return cb(error);
  }

  cb(null, true);
};

// ========================================
// CATEGORY-SPECIFIC MULTER INSTANCE
// ========================================

// Configure the size limit BEFORE
// processing the upload stream.

const createUploader = (kind) => {
  const rule = RULES[kind];

  if (!rule) return null;

  return multer({
    storage,

    limits: {
      // Individual maximum size
      fileSize: rule.maxBytes,

      // One file per request
      files: 1,

      // No extra text fields
      fields: 0,

      // Keep 2 because the previously
      // tested parts: 1 caused errors.
      parts: 2,
    },

    fileFilter,
  });
};

// ========================================
// VERIFY FILE SIGNATURE
// ========================================

// MIME type and extension alone cannot
// reliably identify file content.

const hasValidSignature = async (
  filePath,
  mimeType
) => {
  const handle = await fsPromises.open(
    filePath,
    "r"
  );

  let buffer;

  try {
    const chunk = Buffer.alloc(4096);

    const { bytesRead } = await handle.read(
      chunk,
      0,
      chunk.length,
      0
    );

    buffer = chunk.subarray(0, bytesRead);

  } finally {
    await handle.close();
  }

  // JPEG
  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  // PNG
  if (mimeType === "image/png") {
    const pngHeader = Buffer.from([
      137, 80, 78, 71,
      13, 10, 26, 10,
    ]);

    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(pngHeader)
    );
  }

  // WEBP
  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  // PDF
  if (mimeType === "application/pdf") {
    return (
      buffer.length >= 5 &&
      buffer.toString("ascii", 0, 5) === "%PDF-"
    );
  }

  // MP4
  if (mimeType === "video/mp4") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 4, 8) === "ftyp"
    );
  }

  // WEBM
  if (mimeType === "video/webm") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3 &&
      buffer.includes(Buffer.from("webm"))
    );
  }

  return false;
};

module.exports = {
  createUploader,
  RULES,
  UPLOAD_DIR,
  hasValidSignature,
};
