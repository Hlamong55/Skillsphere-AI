
const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check duplicate username
    const usernameExists = await User.findOne({
      username: cleanUsername,
    });

    if (usernameExists) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    // Check duplicate email
    const emailExists = await User.findOne({
      email: cleanEmail,
    });

    if (emailExists) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Check duplicate phone
    const phoneExists = await User.findOne({
      phone: cleanPhone,
    });

    if (phoneExists) {
      return res.status(409).json({
        message: "Phone number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        bio: user.bio,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);

    // MongoDB unique index error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        message: field
          ? `${field} already registered`
          : "Account information already exists",
      });
    }

    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        bio: user.bio,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
