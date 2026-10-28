
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

// Create temporary directory
fs.mkdirSync(TEMP_DIR, {
  recursive: true,
});

// Allowed uploads
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

// Temporary disk storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, TEMP_DIR);
  },

  filename(req, file, cb) {
    const randomName =
      crypto.randomBytes(16).toString("hex");

    cb(null, `${randomName}.tmp`);
  },
});

// Multer configuration
const uploader = multer({
  storage,

  limits: {
    fileSize: 25 * MB,
    files: 1,
    fields: 0,
    parts: 2,
  },

  fileFilter(req, file, cb) {
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
      .extname(file.originalname)
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
  },
});

// Verify actual file header
// Browser-provided MIME type alone is
// not sufficient for upload security.
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

  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(
          Buffer.from([
            137, 80, 78, 71,
            13, 10, 26, 10,
          ])
        )
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) ===
        "RIFF" &&
      buffer.toString("ascii", 8, 12) ===
        "WEBP"
    );
  }

  if (mimeType === "application/pdf") {
    return (
      buffer.length >= 5 &&
      buffer.toString("ascii", 0, 5) ===
        "%PDF-"
    );
  }

  if (mimeType === "video/mp4") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 4, 8) ===
        "ftyp"
    );
  }

  if (mimeType === "video/webm") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3 &&
      buffer.includes(
        Buffer.from("webm")
      )
    );
  }

  return false;
};

module.exports = {
  uploader,
  RULES,
  UPLOAD_DIR,
  hasValidSignature,
};
