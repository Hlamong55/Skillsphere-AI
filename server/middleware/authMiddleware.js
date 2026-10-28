
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT AUTHENTICATION MIDDLEWARE
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    // Extract JWT
    const token = authHeader
      .slice(7)
      .trim();

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing",
      });
    }

    // Verify JWT signature and expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find authenticated user
    const user = await User.findById(
      decoded.id
    ).select("-password");

    // Reject deleted or unavailable accounts
    if (!user) {
      return res.status(401).json({
        message: "User account no longer exists",
      });
    }

    // Attach authenticated user to request
    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = { protect };
