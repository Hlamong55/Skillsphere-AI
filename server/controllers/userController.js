const User = require("../models/User");

// GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "_id")
      .populate("following", "_id")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = req.body.name || user.name;

    user.bio = req.body.bio || user.bio;

    if (typeof req.body.profilePicture === "string") {
      user.profilePicture = req.body.profilePicture.trim();
    }

    if (typeof req.body.coverPhoto === "string") {
      user.coverPhoto = req.body.coverPhoto.trim();
    }

    user.skills = req.body.skills || user.skills;

    
    const updatedUser = await user.save();

    const safeUser = await User.findById(updatedUser._id)
      .select("-password")
      .populate("followers", "_id")
      .populate("following", "_id");

    res.status(200).json({
      message: "Profile updated successfully",
      user: safeUser,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// FOLLOW USER
const followUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (currentUser._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const alreadyFollowing = currentUser.following.includes(targetUser._id);

    if (alreadyFollowing) {
      return res.status(400).json({
        message: "Already following",
      });
    }

    currentUser.following.push(targetUser._id);

    targetUser.followers.push(currentUser._id);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      message: "User followed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UNFOLLOW USER
const unfollowUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUser._id.toString(),
    );

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUser._id.toString(),
    );

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      message: "User unfollowed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// SEARCH USER
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            {
              name: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              username: {
                $regex: req.query.search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const users = await User.find(keyword).select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Suggest User
const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId =
      req.user?._id || req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Get logged-in user's following list
    const currentUser = await User.findById(
      currentUserId
    )
      .select("following")
      .lean();

    if (!currentUser) {
      return res.status(401).json({
        message: "Current user not found.",
      });
    }

    // Exclude own account
    const users = await User.find({
      _id: {
        $ne: currentUserId,
      },
    })
      .select("_id name username profilePicture")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Following IDs for quick comparison
    const followingIds = new Set(
      (currentUser.following || []).map(
        (id) => String(id)
      )
    );

    // Add real following status
    const suggestedUsers = users.map(
      (user) => ({
        _id: user._id,
        name: user.name,
        username: user.username,
        profilePicture:
          user.profilePicture || "",
        isFollowing: followingIds.has(
          String(user._id)
        ),
      })
    );

    return res.status(200).json(
      suggestedUsers
    );

  } catch (error) {
    console.error(
      "Get Suggested Users Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load suggested users.",
    });
  }
};


module.exports = {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestedUsers,
};
