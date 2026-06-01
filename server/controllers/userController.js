const User = require("../models/User");

// GET USER PROFILE
const getUserProfile = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message:
        error.message,
    });
  }
};

// UPDATE PROFILE
const updateProfile =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      user.name =
        req.body.name ||
        user.name;

      user.bio =
        req.body.bio ||
        user.bio;

      user.profilePicture =
        req.body
          .profilePicture ||
        user.profilePicture;

      user.coverPhoto =
        req.body.coverPhoto ||
        user.coverPhoto;

      user.skills =
        req.body.skills ||
        user.skills;

      const updatedUser =
        await user.save();

      res.status(200).json({
        message:
          "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// FOLLOW USER
const followUser =
  async (req, res) => {
    try {
      const currentUser =
        await User.findById(
          req.user.id
        );

      const targetUser =
        await User.findById(
          req.params.id
        );

      if (!targetUser) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      if (
        currentUser._id.toString() ===
        targetUser._id.toString()
      ) {
        return res
          .status(400)
          .json({
            message:
              "You cannot follow yourself",
          });
      }

      const alreadyFollowing =
        currentUser.following.includes(
          targetUser._id
        );

      if (
        alreadyFollowing
      ) {
        return res
          .status(400)
          .json({
            message:
              "Already following",
          });
      }

      currentUser.following.push(
        targetUser._id
      );

      targetUser.followers.push(
        currentUser._id
      );

      await currentUser.save();
      await targetUser.save();

      res.status(200).json({
        message:
          "User followed successfully",
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// UNFOLLOW USER
const unfollowUser =
  async (req, res) => {
    try {
      const currentUser =
        await User.findById(
          req.user.id
        );

      const targetUser =
        await User.findById(
          req.params.id
        );

      if (!targetUser) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      currentUser.following =
        currentUser.following.filter(
          (id) =>
            id.toString() !==
            targetUser._id.toString()
        );

      targetUser.followers =
        targetUser.followers.filter(
          (id) =>
            id.toString() !==
            currentUser._id.toString()
        );

      await currentUser.save();
      await targetUser.save();

      res.status(200).json({
        message:
          "User unfollowed successfully",
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

module.exports = {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
};