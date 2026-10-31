
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

// ========================================
// REGISTER ONLINE PRESENCE NAMESPACE
// ========================================

const registerOnlinePresence = (io) => {
  // Isolated namespace.
  // Existing default Socket.IO events
  // will continue working normally.
  const presence = io.of("/presence");

  // Map:
  // userId -> {
  //   user: { _id, name, username, profilePicture },
  //   sockets: Set(socketId)
  // }
  const onlineUsers = new Map();

  // ======================================
  // GET CURRENT ONLINE USERS
  // ======================================

  const getOnlineUsers = () => {
    return Array.from(onlineUsers.values())
      .map((entry) => entry.user)
      .sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || ""
        )
      );
  };

  // ======================================
  // BROADCAST REAL-TIME ONLINE USERS
  // ======================================

  const broadcastOnlineUsers = () => {
    presence.emit(
      "presence:users",
      getOnlineUsers()
    );
  };

  // ======================================
  // JWT AUTHENTICATION
  // ======================================

  presence.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (
        typeof token !== "string" ||
        !token
      ) {
        return next(
          new Error("Authentication required.")
        );
      }

      const cleanToken = token.replace(
        /^Bearer\s+/i,
        ""
      );

      const decoded = jwt.verify(
        cleanToken,
        process.env.JWT_SECRET
      );

      const userId =
        decoded.id ||
        decoded._id ||
        decoded.userId;

      if (
        !mongoose.isValidObjectId(userId)
      ) {
        return next(
          new Error("Invalid authentication.")
        );
      }

      // Never trust a user ID sent
      // directly by the browser.
      // Verify JWT and fetch user from DB.
      const user = await User.findById(
        userId
      )
        .select(
          "_id name username profilePicture"
        )
        .lean();

      if (!user) {
        return next(
          new Error("User not found.")
        );
      }

      socket.data.presenceUser = {
        _id: String(user._id),
        name: user.name || "Community Member",
        username: user.username || "",
        profilePicture:
          user.profilePicture || "",
      };

      next();

    } catch (error) {
      console.error(
        "Presence Authentication Failed:",
        error.message
      );

      next(
        new Error("Unauthorized presence connection.")
      );
    }
  });

  // ======================================
  // SOCKET CONNECTION
  // ======================================

  presence.on("connection", (socket) => {
    const user =
      socket.data.presenceUser;

    const userId = user._id;

    let entry = onlineUsers.get(userId);

    const wasOffline = !entry;

    if (!entry) {
      entry = {
        user,
        sockets: new Set(),
      };

      onlineUsers.set(userId, entry);
    }

    // Keep track of multiple tabs
    // opened by the same user.
    entry.sockets.add(socket.id);

    console.log(
      `Presence Connected: ${user.name}`
    );

    // Send current list to this client.
    socket.emit(
      "presence:users",
      getOnlineUsers()
    );

    // Only broadcast when a user
    // actually becomes online.
    if (wasOffline) {
      broadcastOnlineUsers();
    }

    // ====================================
    // DISCONNECT
    // ====================================

    socket.on("disconnect", () => {
      const existingEntry =
        onlineUsers.get(userId);

      if (!existingEntry) return;

      existingEntry.sockets.delete(
        socket.id
      );

      // If other tabs are still open,
      // the user remains online.
      if (
        existingEntry.sockets.size > 0
      ) {
        return;
      }

      onlineUsers.delete(userId);

      console.log(
        `Presence Disconnected: ${user.name}`
      );

      broadcastOnlineUsers();
    });
  });

  console.log(
    "Online Presence Namespace Ready: /presence"
  );
};

module.exports = registerOnlinePresence;
