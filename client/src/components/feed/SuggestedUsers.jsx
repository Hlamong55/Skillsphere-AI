import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiRefreshCw,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

const SuggestedUsers = () => {
  const { user: authUser } = useContext(AuthContext);
  const currentUser = authUser?.user || authUser;

  const currentUserId = String(currentUser?._id || currentUser?.id || "");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ======================================
  // LOAD SUGGESTED USERS

  useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/users/suggested", {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const receivedUsers = Array.isArray(data) ? data : [];

        // Extra frontend safety:
        // Never display own account.
        const filteredUsers = receivedUsers.filter(
          (person) => String(person._id) !== currentUserId,
        );

        setUsers(filteredUsers);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Suggested Users Error:", err);

          setError(
            err.response?.data?.message || "Failed to load suggested users.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (currentUserId) {
      loadUsers();
    }

    return () => {
      controller.abort();
    };
  }, [currentUserId, refreshKey]);


  // ======================================
  // FOLLOW / UNFOLLOW

  const handleFollowToggle = async (person) => {
    const personId = String(person._id);

    if (!currentUserId) {
      toast.error("Please login first.");
      return;
    }

    if (!personId || personId === currentUserId || pendingId) {
      return;
    }

    const wasFollowing = Boolean(person.isFollowing);

    try {
      setPendingId(personId);

      if (wasFollowing) {
        await api.put(`/users/unfollow/${personId}`);
      } else {
        await api.put(`/users/follow/${personId}`);
      }

      // Update UI only after
      // successful API response.
      setUsers((previousUsers) =>
        previousUsers.map((item) => {
          if (String(item._id) !== personId) {
            return item;
          }

          return {
            ...item,
            isFollowing: !wasFollowing,
          };
        }),
      );

      toast.success(
        wasFollowing
          ? "User unfollowed successfully."
          : "User followed successfully!",
      );
    } catch (err) {
      console.error("Follow/Unfollow Error:", err);

      toast.error(
        err.response?.data?.message || "Unable to update follow status.",
      );
    } finally {
      setPendingId(null);
    }
  };


  // ======================================
  // REFRESH

  const handleRefresh = () => {
    if (loading || pendingId) {
      return;
    }

    setRefreshKey((previous) => previous + 1);
  };


  // ======================================
  // COMPONENT UI

  return (
    <section className="rounded-2xl border border-white/10 bg-[#161C2B] p-5">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <FiUsers size={18} className="text-indigo-400" />

          <h3 className="text-lg font-bold text-white">Suggested Users</h3>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || Boolean(pendingId)}
          title="Refresh suggested users"
          aria-label="Refresh suggested users"
          className="rounded-lg p-2 text-gray-400 hover:text-indigo-300 hover:bg-white/5 transition disabled:opacity-40"
        >
          <FiRefreshCw size={17} className={loading ? "animate-spin" : ""} />
        </button>
      </div>


      {/* LOADING STATE */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-white/10" />

                <div className="h-2 w-16 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* ERROR STATE */
        <div className="text-center py-6 space-y-3">
          <FiAlertCircle size={24} className="mx-auto text-amber-400" />

          <p className="text-xs text-gray-400">{error}</p>

          <button
            type="button"
            onClick={handleRefresh}
            className="text-sm font-medium text-indigo-300 hover:text-indigo-200"
          >
            Try Again
          </button>
        </div>
      ) : users.length === 0 ? (
        /* EMPTY STATE */
        <div className="text-center py-7">
          <FiUsers size={28} className="mx-auto text-gray-500 mb-3" />

          <p className="text-sm text-gray-400">No suggested users available.</p>
        </div>
      ) : (
        /* USERS LIST */
        <div className="space-y-5">
          {users.map((person) => {
            const personId = String(person._id);

            const isPending = pendingId === personId;

            return (
              <div key={personId} className="flex items-center gap-3 min-w-0">
                {/* AVATAR */}
                <Link
                  to={`/profile/${personId}`}
                  className="shrink-0"
                  title={`View ${person.name}'s profile`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    {person.profilePicture ? (
                      <img
                        src={person.profilePicture}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {person.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </Link>

                {/* NAME & USERNAME */}
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/profile/${personId}`}
                    className="block text-sm font-semibold text-white truncate hover:text-indigo-300 transition"
                  >
                    {person.name || "Community Member"}
                  </Link>

                  <p className="text-xs text-gray-400 mt-1 truncate">
                    @{person.username}
                  </p>
                </div>

                {/* FOLLOW BUTTON */}
                <button
                  type="button"
                  disabled={Boolean(pendingId)}
                  onClick={() => handleFollowToggle(person)}
                  title={person.isFollowing ? "Unfollow user" : "Follow user"}
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                    person.isFollowing
                      ? "border border-white/15 bg-white/10 text-gray-200 hover:bg-white/15"
                      : "bg-indigo-600 text-white hover:bg-indigo-400"
                  }`}
                >
                  {isPending ? (
                    <FiLoader className="animate-spin" size={14} />
                  ) : person.isFollowing ? (
                    <FiUserCheck size={14} />
                  ) : (
                    <FiUserPlus size={14} />
                  )}

                  <span>{person.isFollowing ? "Following" : "Follow"}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SuggestedUsers;
