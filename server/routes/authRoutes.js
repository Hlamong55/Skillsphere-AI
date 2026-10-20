const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const User = require("../models/User");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/check-username", async (req, res) => {
  try {
    const username = String(req.query.username || "")
      .trim()
      .toLowerCase();

    if (username.length < 3) {
      return res.json({
        available: false,
        message: "Minimum 3 characters required",
      });
    }

    const existingUser = await User.findOne({
      username,
    });

    return res.json({
      available: !existingUser,
      message: existingUser
        ? "Username already taken"
        : "Username available",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Username check failed",
    });
  }
});

module.exports = router;