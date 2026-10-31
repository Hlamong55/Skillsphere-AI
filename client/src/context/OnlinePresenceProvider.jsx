
import {
  useContext,
  useEffect,
  useState,
} from "react";

import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import OnlinePresenceContext from "./OnlinePresenceContext";

const OnlinePresenceProvider = ({ children }) => {
  const { user: authUser } =
    useContext(AuthContext);

  const currentUser =
    authUser?.user || authUser;

  const currentUserId = String(
    currentUser?._id ||
    currentUser?.id ||
    ""
  );

  // Get existing JWT without changing
  // the current login system.
  const getToken = () => {
    if (authUser?.token) {
      return authUser.token;
    }

    if (authUser?.user?.token) {
      return authUser.user.token;
    }

    try {
      const stored = JSON.parse(
        localStorage.getItem("userInfo") ||
        "null"
      );

      return (
        stored?.token ||
        stored?.user?.token ||
        ""
      );

    } catch {
      return "";
    }
  };

  const token = getToken();

  const [presence, setPresence] = useState({
    ownerId: "",
    connected: false,
    users: [],
    error: "",
  });

  // ======================================
  // SOCKET.IO PRESENCE CONNECTION
  // ======================================

  useEffect(() => {
    if (!currentUserId || !token) {
      return;
    }

    // Separate namespace.
    // Does not replace the existing
    // Like/Comment Socket.IO client.
    const socket = io(
      "http://localhost:5001/presence",
      {
        autoConnect: false,
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: Infinity,
      }
    );

    // ====================================
    // CONNECTED
    // ====================================

    const handleConnect = () => {
      setPresence({
        ownerId: currentUserId,
        connected: true,
        users: [],
        error: "",
      });
    };

    // ====================================
    // ONLINE USERS UPDATE
    // ====================================

    const handleOnlineUsers = (users) => {
      setPresence({
        ownerId: currentUserId,
        connected: true,
        users: Array.isArray(users)
          ? users
          : [],
        error: "",
      });
    };

    // ====================================
    // DISCONNECTED
    // ====================================

    const handleDisconnect = () => {
      setPresence({
        ownerId: currentUserId,
        connected: false,
        users: [],
        error: "",
      });
    };

    // ====================================
    // CONNECTION ERROR
    // ====================================

    const handleError = (error) => {
      console.error(
        "Online Presence Connection Error:",
        error.message
      );

      setPresence({
        ownerId: currentUserId,
        connected: false,
        users: [],
        error:
          error.message ||
          "Unable to connect.",
      });
    };

    // ====================================
    // EVENT LISTENERS
    // ====================================

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "presence:users",
      handleOnlineUsers
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "connect_error",
      handleError
    );

    socket.connect();

    // ====================================
    // CLEANUP / LOGOUT
    // ====================================

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "presence:users",
        handleOnlineUsers
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "connect_error",
        handleError
      );

      socket.disconnect();
    };

  }, [currentUserId, token]);

  // Prevent old account's online list
  // from appearing after account switch.
  const belongsToCurrentUser =
    presence.ownerId === currentUserId;

  const connected =
    Boolean(currentUserId && token) &&
    belongsToCurrentUser &&
    presence.connected;

  // Exclude the current user from
  // Suggested / Active Community display.
  const onlineUsers = connected
    ? presence.users.filter(
        (person) =>
          String(person._id) !==
          currentUserId
      )
    : [];

  const value = {
    onlineUsers,
    onlineCount: onlineUsers.length,
    connected,
    error: belongsToCurrentUser
      ? presence.error
      : "",
  };

  return (
    <OnlinePresenceContext.Provider
      value={value}
    >
      {children}
    </OnlinePresenceContext.Provider>
  );
};

export default OnlinePresenceProvider;
